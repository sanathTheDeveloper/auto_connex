/**
 * SettingsSection Component
 * 
 * Groups SettingsListItems with a section title.
 * Used to organize account settings into logical groups.
 * 
 * @example
 * <SettingsSection title="Profile">
 *   <SettingsListItem label="Name" value="John Doe" onPress={...} />
 *   <SettingsListItem label="Email" value="john@example.com" onPress={...} />
 * </SettingsSection>
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';
import { Spacer } from '../atoms/Spacer';
import { Colors, Spacing, BorderRadius } from '../primitives';

export interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.container}>
      <Text variant="h4" style={styles.title}>
        {title}
      </Text>
      <Spacer size="sm" />
      <View style={styles.card}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.text,
    paddingHorizontal: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 2,
  },
});
