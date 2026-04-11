import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  HelpCircle,
  Dices,
  Moon,
  MessageCircle,
  Grid3x3,
  Trophy,
  Sun,
  Radio,
  ScanLine,
  ShoppingBag,
  Activity,
  Baby,
  Hash,
  ChevronDown,
  Shield,
  FileText,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';

interface HelpItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HELP_ITEMS: HelpItem[] = [
  {
    icon: <Dices size={20} color="#00E5FF" />,
    title: 'Generate Numbers',
    description: 'Tap "Generate" on the home screen to get AI-powered lottery number predictions. Choose a strategy (Hot, Cold, or Balanced) before generating. The AI analyzes recent draw patterns to create smart picks.',
  },
  {
    icon: <Trophy size={20} color="#2ECC71" />,
    title: 'Trivia Rewards',
    description: 'Play games to earn Mind Credits! Answer trivia questions, solve crosswords & word searches across 3 difficulty levels. Build daily & weekly streaks for bonus credits. Spend credits to unlock premium tools and features.',
  },
  {
    icon: <Moon size={20} color="#9B8CE8" />,
    title: 'Dream Oracle',
    description: 'Describe a dream and our AI will interpret it into lucky numbers. The system analyzes dream symbols, emotions, and themes to generate personalized lottery picks. Also includes Name Numbers and Baby Names features.',
  },
  {
    icon: <MessageCircle size={20} color="#00E5FF" />,
    title: 'AI Chat',
    description: 'Chat with LottoMind for personalized lottery strategies, number advice, and insights. Ask questions like "What are the hottest Powerball numbers?" or "Give me a balanced pick."',
  },
  {
    icon: <Grid3x3 size={20} color={Colors.gold} />,
    title: 'Heatmap',
    description: 'View a visual grid showing how frequently each number appears in recent draws. Gold = hot (frequent), Dark = cold (rare). Tap any cell for detailed stats.',
  },
  {
    icon: <Sun size={20} color="#FFB74D" />,
    title: 'Daily Horoscope',
    description: 'Get your zodiac sign reading with lucky numbers, compatibility, mood, and best play times. Select your sign and check daily for updated predictions.',
  },
  {
    icon: <Radio size={20} color="#FF6B35" />,
    title: 'Live Data',
    description: 'View real-time lottery draw results, hot/cold number trends, and statistical analysis from official lottery data sources.',
  },
  {
    icon: <ScanLine size={20} color="#00E676" />,
    title: 'Ticket Scanner',
    description: 'Scan your lottery tickets to quickly check results against recent draws.',
  },
  {
    icon: <Activity size={20} color="#00E5FF" />,
    title: 'Sequence Engine',
    description: 'Advanced pattern analysis tool that detects number sequences, trends, and statistical anomalies across lottery draws.',
  },
  {
    icon: <Baby size={20} color="#FF69B4" />,
    title: 'Baby Names',
    description: 'In the Dream Oracle tab, use the Baby Names feature to generate lucky numbers based on baby names using numerology. Great for expecting parents looking for lucky picks!',
  },
  {
    icon: <Hash size={20} color="#00E676" />,
    title: 'Pick 3 & Pick 4',
    description: 'View live results, prizes, and odds for Pick 3 and Pick 4 daily number games in your state.',
  },
  {
    icon: <ShoppingBag size={20} color={Colors.gold} />,
    title: 'Shop',
    description: 'Browse e-books, merchandise, and gear in the LottoMind shop.',
  },
];

const TERMS_OF_USE = `Welcome to LottoMind. These Terms of Use ("Terms") govern your access to and use of the LottoMind mobile app, website, features, content, tools, and related services (collectively, the "Service") provided by LottoMind ("LottoMind," "we," "us," or "our").

By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.

1. Eligibility
You must be at least 18 years old, or the age of majority in your jurisdiction, whichever is higher, to use the Service. You represent that your use of the Service is lawful where you are located. You are responsible for ensuring that your use of any lottery-related information complies with all applicable laws, rules, age restrictions, and geographic restrictions in your jurisdiction.

2. Nature of the Service
LottoMind is an independent informational and entertainment platform. LottoMind: does not sell lottery tickets; does not process wagers or bets; does not operate any lottery; does not pay prizes; is not a broker, agent, or retailer for any lottery authority unless expressly stated in writing. The Service may provide number suggestions, historical statistics, trends, alerts, educational content, entertainment features, AI-generated content, or other informational tools. These are provided for informational and entertainment purposes only.

3. No Affiliation With Lottery Authorities
LottoMind is not affiliated with, endorsed by, sponsored by, or operated by any state lottery, governmental entity, regulator, the Multi-State Lottery Association, Powerball, Mega Millions, or any other lottery operator, unless explicitly stated otherwise in a separate written agreement. Any references to third-party lottery names, draw names, trademarks, or logos are used solely for descriptive, referential, or informational purposes. All third-party marks remain the property of their respective owners.

4. No Guarantee of Results
LottoMind does not guarantee winnings, success, improved odds, or any particular outcome. All lottery drawings are games of chance. Past results do not guarantee future results. Any predictions, recommendations, insights, AI outputs, or statistical analyses generated by the Service may be incomplete, experimental, inaccurate, or not useful for your purposes. You use the Service at your own risk.

5. Official Rules and Results Control
You are solely responsible for verifying: official drawing times, official game rules, ticket eligibility, prize claim deadlines, winning numbers, jurisdiction requirements, retailer information, and any other lottery-related terms with the official lottery authority in your jurisdiction. If there is ever a conflict between information shown in LottoMind and information from an official lottery source, the official lottery source controls.

6. Responsible Use
The Service is not intended to encourage excessive or harmful gambling behavior. You agree not to use LottoMind in a way that causes financial distress, compulsive behavior, or unlawful activity. If you believe lottery play is causing harm, stop using the Service and seek appropriate support.

7. Accounts
You may need to create an account to access some features. You agree to provide accurate information and keep your login credentials secure. You are responsible for all activity that occurs under your account.

8. User Content
If you submit, upload, post, or transmit content to the Service ("User Content"), you grant us a non-exclusive, worldwide, royalty-free license to host, store, process, reproduce, display, and use that content as necessary to operate, improve, and provide the Service. You retain ownership of your User Content, subject to the rights granted above.

9. AI and Automated Features
Some features may rely on artificial intelligence, automated patterning, or algorithmic analysis. AI-generated content may be incorrect, incomplete, misleading, or inappropriate. AI outputs are provided as experimental informational tools only and should not be treated as factual, financial, legal, or professional advice.

10. Subscriptions, Purchases, and Credits
If the Service offers paid subscriptions, one-time purchases, credits, tokens, or premium features: all prices are displayed at checkout; payments are processed through third-party providers or app stores; virtual credits, if any, have no cash value unless expressly required by law.

11. Intellectual Property
The Service, including its software, design, text, graphics, branding, interfaces, compilations, and original content, is owned by LottoMind or its licensors and is protected by intellectual property laws.

12. Third-Party Services and Data
The Service may rely on third-party APIs, data feeds, analytics tools, payment processors, app stores, hosting providers, or linked websites. We do not control and are not responsible for third-party services, data accuracy, availability, security, or content.

13. Privacy
Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference.

14. Disclaimer of Warranties
TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE." WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, AVAILABILITY, AND RELIABILITY.

15. Limitation of Liability
TO THE MAXIMUM EXTENT PERMITTED BY LAW, LOTTOMIND AND ITS OWNERS, OFFICERS, DIRECTORS, EMPLOYEES, AFFILIATES, CONTRACTORS, LICENSORS, AND SERVICE PROVIDERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.

16. Indemnification
You agree to defend, indemnify, and hold harmless LottoMind and its affiliates from and against claims, liabilities, damages, losses, and expenses arising out of: your use of the Service; your User Content; your violation of these Terms; your violation of any law or third-party right.

17. Termination
We may suspend or terminate your access to the Service at any time, with or without notice, if we believe you violated these Terms.

18. Changes to the Service or Terms
We may modify the Service or these Terms from time to time. Updated Terms become effective when posted. Your continued use after updates means you accept the revised Terms.

19. Governing Law
These Terms are governed by the laws of the applicable jurisdiction, without regard to conflict-of-law principles.

Powerball®, Mega Millions®, and other third-party marks are the property of their respective owners and are used only for descriptive and informational purposes.

© ${new Date().getFullYear()} LottoMind™. All rights reserved. Please play responsibly.`;

const PRIVACY_POLICY = `LOTTOMIND PRIVACY POLICY
Effective Date: April 10, 2026
Last Updated: April 10, 2026

This Privacy Policy explains how LottoMind ("LottoMind," "we," "us," or "our") collects, uses, discloses, and protects information when you use the LottoMind app, website, and related services (the "Service").

1. Information We Collect

A. Information You Provide
We may collect information you provide directly, such as: name or display name; email address; account login details; profile information; messages you send to us; content you enter into app tools, such as names, dream entries, lucky numbers, preferences, prompts, or notes; payment-related information processed through third-party payment providers; any other information you choose to provide.

B. Information Collected Automatically
When you use the Service, we may automatically collect: device type; operating system; app version; browser type; IP address; approximate location derived from IP or device settings; usage activity; session data; crash logs; diagnostics; identifiers used for analytics, fraud prevention, or notifications.

C. Information From Third Parties
We may receive information from: analytics providers; authentication providers; payment processors; app stores; advertising or attribution partners; third-party data providers or APIs used to power lottery-related informational features.

2. How We Use Information
We may use personal information to: provide, maintain, and improve the Service; create and manage accounts; personalize features and content; power AI or recommendation features; process transactions and subscriptions; send service messages, security alerts, and support responses; analyze usage and performance; prevent fraud, abuse, and unauthorized access; comply with legal obligations; enforce our Terms and protect our rights.

3. Legal Bases
If applicable under laws in your jurisdiction, we process personal information based on one or more of the following: your consent; performance of a contract with you; compliance with legal obligations; our legitimate interests in operating, securing, and improving the Service.

4. How We Share Information
We may share information: with vendors and service providers who help us operate the Service; with payment processors and app platforms; with analytics, hosting, cloud storage, customer support, authentication, and security providers; if required by law, subpoena, court order, or legal process; to protect rights, safety, and security; in connection with a merger, acquisition, asset sale, financing, or restructuring; with your direction or consent.

We do not sell lottery tickets or share your information with a lottery authority for ticket purchase fulfillment unless we explicitly offer such a feature and disclose it separately.

5. Data Retention
We retain personal information for as long as reasonably necessary to: provide the Service; maintain your account; comply with legal obligations; resolve disputes; enforce agreements; protect against fraud and abuse. We may delete or de-identify information when it is no longer needed.

6. Security
We use reasonable administrative, technical, and organizational safeguards designed to protect personal information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.

7. Children's Privacy
The Service is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If we learn we collected such information, we will take reasonable steps to delete it.

8. Your Choices
Depending on your location, you may be able to: access or update account information; request deletion of your account or data; opt out of certain marketing communications; manage device permissions such as notifications or location; adjust cookie settings where applicable.

9. State Privacy Rights
Depending on where you live, you may have additional rights under applicable U.S. state privacy laws, such as the right to know, access, delete, correct, or opt out of certain data processing activities.

10. International Users
If you access the Service from outside the United States, your information may be transferred to and processed in the United States or other countries where our providers operate.

11. Third-Party Links and Services
The Service may contain links to third-party websites, platforms, or services. We are not responsible for their privacy practices or content.

12. App Tracking / Analytics Disclosure
We may use analytics, attribution, or diagnostics tools to understand app performance and user engagement. If we use advertising identifiers, cross-app tracking, or similar technologies, we will provide any disclosures and permissions required by applicable law and platform rules.

13. Changes to This Policy
We may update this Privacy Policy from time to time. We will post the updated version with a revised "Last Updated" date. Continued use of the Service after changes means the updated policy applies, to the extent permitted by law.

14. Contact Us
If you have questions or requests about this Privacy Policy, please contact us through the app's support channels.

Powerball®, Mega Millions®, and other third-party marks are the property of their respective owners and are used only for descriptive and informational purposes.

Not affiliated with any lottery authority. No ticket sales. No guarantee of winnings. Please play responsibly and only where lawful.

© ${new Date().getFullYear()} LottoMind™. All rights reserved.`;

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [termsExpanded, setTermsExpanded] = useState<boolean>(false);
  const [privacyExpanded, setPrivacyExpanded] = useState<boolean>(false);
  const termsRotate = useRef(new Animated.Value(0)).current;
  const privacyRotate = useRef(new Animated.Value(0)).current;

  const toggleTerms = () => {
    Animated.timing(termsRotate, {
      toValue: termsExpanded ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setTermsExpanded(!termsExpanded);
  };

  const togglePrivacy = () => {
    Animated.timing(privacyRotate, {
      toValue: privacyExpanded ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setPrivacyExpanded(!privacyExpanded);
  };

  const termsChevronRotation = termsRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const privacyChevronRotation = privacyRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <HelpCircle size={20} color={Colors.gold} />
          <Text style={styles.headerTitle}>How to Use</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>🎰</Text>
          <Text style={styles.introTitle}>Welcome to LottoMind™</Text>
          <Text style={styles.introText}>
            Your AI-powered lottery intelligence companion. Here's how to get the most out of every feature.
          </Text>
        </View>

        {HELP_ITEMS.map((item, index) => (
          <View key={`help-${index}`} style={styles.helpCard}>
            <View style={styles.helpIconWrap}>
              {item.icon}
            </View>
            <View style={styles.helpInfo}>
              <Text style={styles.helpTitle}>{item.title}</Text>
              <Text style={styles.helpDesc}>{item.description}</Text>
            </View>
          </View>
        ))}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Pro Tips</Text>
          <Text style={styles.tipItem}>• Play games daily to build streaks and earn bonus credits</Text>
          <Text style={styles.tipItem}>• Use credits to unlock premium AI predictions and features</Text>
          <Text style={styles.tipItem}>• Check the heatmap before picking — hot numbers appear more frequently</Text>
          <Text style={styles.tipItem}>• Combine Dream Oracle + Name Numbers for diverse picks</Text>
          <Text style={styles.tipItem}>• Switch between Powerball & Mega Millions on any screen</Text>
        </View>

        <View style={styles.legalSection}>
          <Text style={styles.legalSectionLabel}>Legal</Text>

          <TouchableOpacity
            style={styles.legalDropdownHeader}
            onPress={toggleTerms}
            activeOpacity={0.7}
            testID="terms-dropdown-toggle"
          >
            <View style={styles.legalDropdownLeft}>
              <View style={styles.legalIconWrap}>
                <FileText size={16} color={Colors.gold} />
              </View>
              <Text style={styles.legalDropdownTitle}>Terms of Use</Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: termsChevronRotation }] }}>
              <ChevronDown size={18} color={Colors.textSecondary} />
            </Animated.View>
          </TouchableOpacity>
          {termsExpanded && (
            <View style={styles.legalContent}>
              <Text style={styles.legalText}>{TERMS_OF_USE}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.legalDropdownHeader, { marginTop: 10 }]}
            onPress={togglePrivacy}
            activeOpacity={0.7}
            testID="privacy-dropdown-toggle"
          >
            <View style={styles.legalDropdownLeft}>
              <View style={styles.legalIconWrap}>
                <Shield size={16} color="#00E5FF" />
              </View>
              <Text style={styles.legalDropdownTitle}>Privacy Policy</Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: privacyChevronRotation }] }}>
              <ChevronDown size={18} color={Colors.textSecondary} />
            </Animated.View>
          </TouchableOpacity>
          {privacyExpanded && (
            <View style={styles.legalContent}>
              <Text style={styles.legalText}>{PRIVACY_POLICY}</Text>
            </View>
          )}
        </View>

        <View style={styles.footerDisclaimer}>
          <Text style={styles.footerDisclaimerText}>
            Not affiliated with any lottery authority. No ticket sales. No guarantee of winnings. Please play responsibly.
          </Text>
          <Text style={styles.footerDisclaimerText}>
            Powerball®, Mega Millions®, and other third-party marks are the property of their respective owners.
          </Text>
          <Text style={styles.footerDisclaimerText}>
            © {new Date().getFullYear()} LottoMind™. All rights reserved.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 14,
  },
  introCard: {
    backgroundColor: Colors.goldMuted,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  introEmoji: {
    fontSize: 40,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  helpCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  helpIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  helpInfo: {
    flex: 1,
    gap: 4,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  helpDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  tipsCard: {
    backgroundColor: 'rgba(46, 204, 113, 0.06)',
    borderRadius: 16,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.15)',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#2ECC71',
    marginBottom: 4,
  },
  tipItem: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  legalSection: {
    marginTop: 6,
  },
  legalSectionLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  legalDropdownHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legalDropdownLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  legalIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  legalDropdownTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  legalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  legalText: {
    fontSize: 12,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  footerDisclaimer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 6,
  },
  footerDisclaimerText: {
    fontSize: 11,
    lineHeight: 17,
    color: Colors.textMuted,
    textAlign: 'center' as const,
  },
});
