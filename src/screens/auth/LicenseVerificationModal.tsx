/**
 * LicenseVerificationModal Component
 *
 * Simple modal displayed after license verification submission.
 * Clean, brand-compliant design following Auto Connex guidelines.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../design-system/atoms/Text';
import { Button } from '../../design-system/atoms/Button';
import { Spacer } from '../../design-system/atoms/Spacer';
import { Colors, Spacing, BorderRadius } from '../../design-system/primitives';

interface LicenseVerificationModalProps {
  visible: boolean;
  onRegister: () => void;
  isLoading?: boolean;
  licenseState?: string;
}

export const LicenseVerificationModal: React.FC<LicenseVerificationModalProps> = ({
  visible,
  onRegister,
  isLoading = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.9);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, fadeAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="time-outline" size={32} color={Colors.primary} />
            </View>
          </View>

          <Spacer size="md" />

          {/* Title */}
          <Text variant="h4" weight="bold" align="center">
            Verification Pending
          </Text>

          <Spacer size="sm" />

          {/* Description */}
          <Text variant="bodySmall" align="center" style={styles.description}>
            We'll verify your licence within 1-2 business days and notify you once approved.
          </Text>

          <Spacer size="lg" />

          {/* Badge Info */}
          <View style={styles.badgeInfo}>
            <Image
              source={require('../../../assets/icons/verified-badge.png')}
              style={styles.verifiedBadgeIcon}
            />
            <Text variant="caption" style={styles.badgeText}>
              You'll receive a verified badge on your profile
            </Text>
          </View>

          <Spacer size="sm" />

          {/* Trade Message */}
          <Text variant="caption" align="center" style={styles.tradeMessage}>
            In the meanwhile, you can still trade on the platform
          </Text>

          <Spacer size="lg" />

          {/* Register Button */}
          <Button
            variant="primary"
            size="md"
            fullWidth
            onPress={onRegister}
            loading={isLoading}
            disabled={isLoading}
          >
            Register
          </Button>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 360 : '100%',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    color: Colors.textMuted,
    lineHeight: 20,
  },
  badgeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  badgeText: {
    color: Colors.success,
    flex: 1,
  },
  verifiedBadgeIcon: {
    width: 20,
    height: 20,
  },
  tradeMessage: {
    color: Colors.textMuted,
  },
});

export default LicenseVerificationModal;
