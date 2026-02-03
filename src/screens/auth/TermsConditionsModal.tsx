/**
 * TermsConditionsModal Component
 *
 * Full-screen modal displaying Terms & Conditions.
 * Scrollable content with brand-compliant styling.
 * Used in signup flow for user consent.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../design-system/atoms/Text';
import { Button } from '../../design-system/atoms/Button';
import { Spacer } from '../../design-system/atoms/Spacer';
import { Colors, Spacing, BorderRadius } from '../../design-system/primitives';

interface TermsConditionsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({
  visible,
  onClose,
  onAccept,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleAccept = () => {
    onAccept?.();
    onClose();
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
              <Text variant="h4" weight="bold">
                Terms & Conditions
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text variant="caption" style={styles.lastUpdated}>
                Last Updated: February 2026
              </Text>

              <Spacer size="md" />

              <Text variant="bodySmall" weight="semibold" style={styles.sectionTitle}>
                1. Acceptance of Terms
              </Text>
              <Text variant="caption" style={styles.paragraph}>
                By accessing and using Auto Connex ("the Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
              </Text>

              <Spacer size="md" />

              <Text variant="bodySmall" weight="semibold" style={styles.sectionTitle}>
                2. User Registration
              </Text>
              <Text variant="caption" style={styles.paragraph}>
                To use certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your account credentials and for all activities that occur under your account.
              </Text>

              <Spacer size="md" />

              <Text variant="bodySmall" weight="semibold" style={styles.sectionTitle}>
                3. Business Verification
              </Text>
              <Text variant="caption" style={styles.paragraph}>
                All dealers and wholesalers must provide valid Australian Business Number (ABN) and relevant motor dealer licenses for their state or territory. Auto Connex reserves the right to verify this information and may suspend or terminate accounts that provide false or misleading business credentials.
              </Text>

              <Spacer size="md" />

              <Text variant="bodySmall" weight="semibold" style={styles.sectionTitle}>
                4. 7-Day Account Terms
              </Text>
              <Text variant="caption" style={styles.paragraph}>
                Dealers may access 7-day payment terms subject to credit approval. Payment must be received within 7 days of purchase confirmation. Late payments may incur fees and affect your account standing. Auto Connex reserves the right to modify or revoke payment terms at any time.
              </Text>

              <Spacer size="md" />

              <Text variant="bodySmall" weight="semibold" style={styles.sectionTitle}>
                5. Vehicle Listings
              </Text>
              <Text variant="caption" style={styles.paragraph}>
                Wholesalers are responsible for ensuring all vehicle listings are accurate and complete. This includes accurate representation of vehicle condition, history, and specifications. Misrepresentation of vehicles may result in account suspension and liability for damages.
              </Text>

              <Spacer size="md" />

              <Text variant="bodySmall" weight="semibold" style={styles.sectionTitle}>
                6. Privacy & Data Collection
              </Text>
              <Text variant="caption" style={styles.paragraph}>
                We collect and process personal information in accordance with our Privacy Policy and the Australian Privacy Principles. By using the Platform, you consent to the collection, use, and disclosure of your information as described in our Privacy Policy. Your data may be used to improve our services, facilitate transactions, and for marketing purposes where permitted.
              </Text>

              <Spacer size="md" />

              <Text variant="bodySmall" weight="semibold" style={styles.sectionTitle}>
                7. Intellectual Property
              </Text>
              <Text variant="caption" style={styles.paragraph}>
                All content on the Platform, including logos, text, graphics, and software, is the property of Auto Connex or its licensors and is protected by Australian and international intellectual property laws. You may not reproduce, modify, or distribute any content without prior written consent.
              </Text>

              <Spacer size="md" />

              <Text variant="bodySmall" weight="semibold" style={styles.sectionTitle}>
                8. Limitation of Liability
              </Text>
              <Text variant="caption" style={styles.paragraph}>
                Auto Connex provides the Platform "as is" and makes no warranties regarding the accuracy of listings or the conduct of users. To the maximum extent permitted by law, Auto Connex shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.
              </Text>

              <Spacer size="md" />

              <Text variant="bodySmall" weight="semibold" style={styles.sectionTitle}>
                9. Dispute Resolution
              </Text>
              <Text variant="caption" style={styles.paragraph}>
                Any disputes arising from transactions on the Platform should first be resolved between the parties directly. Auto Connex offers a dispute resolution service to assist in mediating issues. These Terms are governed by the laws of Victoria, Australia.
              </Text>

              <Spacer size="md" />

              <Text variant="bodySmall" weight="semibold" style={styles.sectionTitle}>
                10. Changes to Terms
              </Text>
              <Text variant="caption" style={styles.paragraph}>
                Auto Connex reserves the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new Terms. We will notify users of material changes via email or platform notifications.
              </Text>

              <Spacer size="lg" />

              <View style={styles.contactSection}>
                <Text variant="caption" weight="semibold" style={styles.contactTitle}>
                  Contact Us
                </Text>
                <Text variant="caption" style={styles.contactText}>
                  Auto Connex Pty Ltd{'\n'}
                  ABN: 12 345 678 901{'\n'}
                  Email: legal@autoconnex.com.au{'\n'}
                  Phone: 1300 AUTO CX
                </Text>
              </View>

              <Spacer size="xl" />
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
              <View style={styles.footerButtons}>
                <Button
                  variant="outline"
                  size="md"
                  onPress={onClose}
                  style={styles.declineButton}
                >
                  Decline
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onPress={handleAccept}
                  style={styles.acceptButton}
                >
                  Accept
                </Button>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  lastUpdated: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  sectionTitle: {
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  paragraph: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactTitle: {
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  contactText: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  declineButton: {
    flex: 1,
  },
  acceptButton: {
    flex: 1,
  },
});

export default TermsConditionsModal;
