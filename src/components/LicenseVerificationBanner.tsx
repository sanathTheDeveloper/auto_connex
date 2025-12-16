/**
 * LicenseVerificationBanner Component
 *
 * Dismissible banner displayed below header showing license verification status.
 * Uses brand-compliant Warning color (#FF9500) for pending verification status.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../design-system/atoms/Text';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

interface LicenseVerificationBannerProps {
  /** Whether the banner is visible */
  visible: boolean;
  /** Callback when dismiss is pressed */
  onDismiss: () => void;
}

export const LicenseVerificationBanner: React.FC<LicenseVerificationBannerProps> = ({
  visible,
  onDismiss,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={18} color={Colors.warning} />
        </View>
        <View style={styles.textContainer}>
          <Text variant="caption" weight="semibold" style={styles.title}>
            Licence Verification Pending
          </Text>
          <Text variant="caption" style={styles.subtitle}>
            We'll notify you once approved (1-2 business days)
          </Text>
        </View>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          accessibilityLabel="Dismiss banner"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.warning + '30',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.text,
  },
  subtitle: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
});

export default LicenseVerificationBanner;
