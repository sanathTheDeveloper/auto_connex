/**
 * SettingsListItem Component
 * 
 * iOS Settings-style list item with icon, label, optional value, and chevron.
 * Used in Account & Settings screen for navigation items.
 * 
 * @example
 * <SettingsListItem
 *   icon={require('@/assets/icons/user.png')}
 *   label="Profile & Name"
 *   onPress={() => navigate('ProfileDetails')}
 *   showChevron
 * />
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Text } from '../atoms/Text';
import { Colors, Spacing, BorderRadius } from '../primitives';

export interface SettingsListItemProps {
  icon?: ImageSourcePropType;
  label: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
  badge?: string;
  badgeColor?: string;
  isFirst?: boolean;
  isLast?: boolean;
}

export const SettingsListItem: React.FC<SettingsListItemProps> = ({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  badge,
  badgeColor = Colors.success,
  isFirst = false,
  isLast = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isFirst && styles.firstItem,
        isLast && styles.lastItem,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        {icon && (
          <View style={styles.iconContainer}>
            <Image source={icon} style={styles.icon} />
          </View>
        )}
        
        <Text variant="body" style={styles.label}>
          {label}
        </Text>
      </View>

      <View style={styles.rightContent}>
        {badge && (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text variant="caption" style={styles.badgeText}>
              {badge}
            </Text>
          </View>
        )}
        
        {value && (
          <Text variant="bodySmall" style={styles.value}>
            {value}
          </Text>
        )}
        
        {showChevron && (
          <Image
            source={require('../../../assets/icons/chevron-right.png')}
            style={styles.chevron}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  firstItem: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  lastItem: {
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    borderBottomWidth: 0,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: Colors.primary,
  },
  label: {
    color: Colors.text,
    flex: 1,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  chevron: {
    width: 20,
    height: 20,
    tintColor: Colors.textSecondary,
  },
});
