import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { Volume2, VolumeX } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface SpeakButtonProps {
  text: string;
  size?: number;
  color?: string;
  disabled?: boolean;
}

export default function SpeakButton({ text, size = 32, color = Colors.gold, disabled = false }: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = useCallback(() => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  const handlePress = useCallback(() => {
    if (disabled || !text.trim()) return;

    void Speech.isSpeakingAsync().then((speaking) => {
      if (speaking || isSpeaking) {
        void Speech.stop();
        setIsSpeaking(false);
        stopPulse();
        return;
      }

      setIsSpeaking(true);
      startPulse();

      Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: Platform.OS === 'web' ? 1.0 : 0.95,
      onDone: () => {
        setIsSpeaking(false);
        stopPulse();
      },
      onStopped: () => {
        setIsSpeaking(false);
        stopPulse();
      },
      onError: () => {
        console.log('[SpeakButton] Speech error');
        setIsSpeaking(false);
        stopPulse();
      },
      });
    });
  }, [text, disabled, isSpeaking, startPulse, stopPulse]);

  useEffect(() => {
    return () => {
      void Speech.stop();
      stopPulse();
    };
  }, [stopPulse]);

  const iconSize = size * 0.55;

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isSpeaking ? 'rgba(212, 175, 55, 0.25)' : 'rgba(212, 175, 55, 0.12)',
            borderColor: isSpeaking ? 'rgba(212, 175, 55, 0.5)' : 'rgba(212, 175, 55, 0.2)',
          },
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={disabled}
        testID="speak-button"
      >
        {isSpeaking ? (
          <VolumeX size={iconSize} color={color} />
        ) : (
          <Volume2 size={iconSize} color={color} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.4,
  },
});
