/**
 * NotificationsSettingsScreen
 * 
 * Screen for managing notification preferences.
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { Text, Spacer } from '../../design-system';
import { Colors, Spacing } from '../../design-system/primitives';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function NotificationsSettingsScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold">Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Spacer size="md" />

        <View style={styles.placeholderContainer}>
          <Text variant="h3" style={styles.placeholderTitle}>
            Coming Soon
          </Text>
          <Spacer size="sm" />
          <Text variant="body" style={styles.placeholderText}>
            Manage your notification preferences for offers, messages, and updates.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBEEF2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: Spacing.lg,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  placeholderContainer: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderTitle: {
    color: Colors.text,
  },
  placeholderText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
