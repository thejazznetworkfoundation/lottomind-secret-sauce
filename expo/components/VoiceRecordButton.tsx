import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  View,
  Text,
} from 'react-native';
import { Mic, MicOff, Loader } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';

const STT_URL = 'https://toolkit.rork.com/stt/transcribe/';

interface VoiceRecordButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  size?: number;
  color?: string;
  activeColor?: string;
}

export default function VoiceRecordButton({
  onTranscript,
  disabled = false,
  size = 48,
  color = Colors.gold,
  activeColor = '#E74C3C',
}: VoiceRecordButtonProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const webMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const webChunksRef = useRef<Blob[]>([]);
  const webStreamRef = useRef<MediaStream | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
      if (webStreamRef.current) {
        webStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startPulse = useCallback(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.current = loop;
    loop.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    if (pulseLoop.current) {
      pulseLoop.current.stop();
      pulseLoop.current = null;
    }
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  const startRecordingNative = useCallback(async () => {
    try {
      console.log('[VoiceRecordButton] Requesting permissions...');
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.log('[VoiceRecordButton] Permission denied');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('[VoiceRecordButton] Starting native recording...');
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: 2,
          audioEncoder: 3,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: 1819304813,
          audioQuality: 127,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
        isMeteringEnabled: true,
      });
      await recording.startAsync();
      recordingRef.current = recording;
      console.log('[VoiceRecordButton] Native recording started');
      return true;
    } catch (error) {
      console.error('[VoiceRecordButton] Failed to start native recording:', error);
      return false;
    }
  }, []);

  const stopRecordingNative = useCallback(async (): Promise<FormData | null> => {
    try {
      const recording = recordingRef.current;
      if (!recording) return null;

      console.log('[VoiceRecordButton] Stopping native recording...');
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recording.getURI();
      recordingRef.current = null;

      if (!uri) {
        console.log('[VoiceRecordButton] No URI from recording');
        return null;
      }

      console.log('[VoiceRecordButton] Recording URI:', uri);
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const formData = new FormData();
      const audioFile = {
        uri,
        name: `recording.${fileType}`,
        type: `audio/${fileType}`,
      } as unknown as Blob;
      formData.append('audio', audioFile);
      return formData;
    } catch (error) {
      console.error('[VoiceRecordButton] Failed to stop native recording:', error);
      return null;
    }
  }, []);

  const startRecordingWeb = useCallback(async () => {
    try {
      console.log('[VoiceRecordButton] Starting web recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      webStreamRef.current = stream;
      webChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          webChunksRef.current.push(e.data);
        }
      };
      mediaRecorder.start();
      webMediaRecorderRef.current = mediaRecorder;
      console.log('[VoiceRecordButton] Web recording started');
      return true;
    } catch (error) {
      console.error('[VoiceRecordButton] Failed to start web recording:', error);
      return false;
    }
  }, []);

  const stopRecordingWeb = useCallback((): Promise<FormData | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = webMediaRecorderRef.current;
      if (!mediaRecorder) {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        console.log('[VoiceRecordButton] Web recording stopped');
        const blob = new Blob(webChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });

        if (webStreamRef.current) {
          webStreamRef.current.getTracks().forEach(track => track.stop());
          webStreamRef.current = null;
        }

        const formData = new FormData();
        formData.append('audio', file);
        webMediaRecorderRef.current = null;
        webChunksRef.current = [];
        resolve(formData);
      };

      mediaRecorder.stop();
    });
  }, []);

  const transcribe = useCallback(async (formData: FormData) => {
    try {
      console.log('[VoiceRecordButton] Sending audio for transcription...');
      setIsTranscribing(true);

      const response = await fetch(STT_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[VoiceRecordButton] STT error:', errorText);
        return;
      }

      const data = await response.json();
      console.log('[VoiceRecordButton] Transcription result:', data);

      if (data.text && data.text.trim()) {
        onTranscript(data.text.trim());
      }
    } catch (error) {
      console.error('[VoiceRecordButton] Transcription failed:', error);
    } finally {
      setIsTranscribing(false);
    }
  }, [onTranscript]);

  const handlePress = useCallback(async () => {
    if (disabled || isTranscribing) return;

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (isRecording) {
      stopPulse();
      setIsRecording(false);

      const formData = Platform.OS === 'web'
        ? await stopRecordingWeb()
        : await stopRecordingNative();

      if (formData) {
        await transcribe(formData);
      }
    } else {
      const started = Platform.OS === 'web'
        ? await startRecordingWeb()
        : await startRecordingNative();

      if (started) {
        setIsRecording(true);
        startPulse();
      }
    }
  }, [disabled, isTranscribing, isRecording, stopPulse, startPulse, startRecordingNative, stopRecordingNative, startRecordingWeb, stopRecordingWeb, transcribe]);

  const currentColor = isRecording ? activeColor : color;
  const iconSize = size * 0.42;

  return (
    <View style={styles.wrapper}>
      {isRecording && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: size + 14,
              height: size + 14,
              borderRadius: (size + 14) / 2,
              borderColor: activeColor,
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.25],
                outputRange: [0.6, 0],
              }),
            },
          ]}
        />
      )}
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isRecording
              ? 'rgba(231, 76, 60, 0.2)'
              : isTranscribing
              ? Colors.surfaceHighlight
              : Colors.surface,
            borderColor: isRecording
              ? 'rgba(231, 76, 60, 0.4)'
              : isTranscribing
              ? Colors.border
              : 'rgba(212, 175, 55, 0.25)',
          },
        ]}
        onPress={handlePress}
        disabled={disabled || isTranscribing}
        activeOpacity={0.7}
        testID="voice-record-button"
      >
        {isTranscribing ? (
          <Loader size={iconSize} color={Colors.textMuted} />
        ) : isRecording ? (
          <MicOff size={iconSize} color={activeColor} />
        ) : (
          <Mic size={iconSize} color={currentColor} />
        )}
      </TouchableOpacity>
      {isRecording && (
        <Text style={styles.recordingLabel}>Listening...</Text>
      )}
      {isTranscribing && (
        <Text style={styles.recordingLabel}>Transcribing...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  recordingLabel: {
    position: 'absolute',
    bottom: -18,
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textAlign: 'center',
    width: 80,
  },
});
