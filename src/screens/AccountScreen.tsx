/**
 * AccountScreen
 * 
 * Main account and settings screen with iOS Settings-style layout.
 * Features:
 * - Weekly charges banner with countdown
 * - Spending analytics with tabs
 * - Profile management
 * - Business details
 * - Payment settings
 * - Notifications and privacy
 * - Support and help
 * 
 * @example
 * navigation.navigate('Account');
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation';
import {
  Text,
  Spacer,
  SettingsSection,
  SettingsListItem,
} from '../design-system';
import { WeeklyPurchaseProgress } from '../components';
import { Colors, Spacing } from '../design-system/primitives';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AccountScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();

  // Mock weekly purchase data - matching HomeScreen format
  const weeklyPurchaseData = {
    amountSpent: 125000,
    currentDay: 4, // Day 4 of 7
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header - Matching PurchasesOffersScreen */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold">Account & Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Weekly Purchase Progress - Matching HomeScreen */}
        <WeeklyPurchaseProgress
          amountSpent={weeklyPurchaseData.amountSpent}
          currentDay={weeklyPurchaseData.currentDay}
        />

        <Spacer size="lg" />

        {/* Settings Sections Container with padding */}
        <View style={styles.sectionsContainer}>
          {/* Account Section */}
          <SettingsSection title="Account">
            <SettingsListItem
              icon={require('../../assets/icons/user.png')}
              label="Profile Details"
              value={user?.fullName || 'Not set'}
              onPress={() => navigation.navigate('ProfileDetails')}
              isFirst
            />
            <SettingsListItem
              icon={require('../../assets/icons/card.png')}
              label="Business Details"
              value={user?.businessName || 'Not set'}
              onPress={() => navigation.navigate('BusinessDetails')}
              isLast
            />
          </SettingsSection>

          {/* Financial Section */}
          <SettingsSection title="Financial">
            <SettingsListItem
              icon={require('../../assets/icons/card.png')}
              label="Payment & Billing"
              onPress={() => navigation.navigate('PaymentMethods')}
              isFirst
              isLast
            />
          </SettingsSection>

          {/* Support Section */}
          <SettingsSection title="Help & Support">
            <SettingsListItem
              icon={require('../../assets/icons/message.png')}
              label="Dispute & Support"
              onPress={() => navigation.navigate('DisputeResolution')}
              isFirst
              isLast
            />
          </SettingsSection>
        </View>

        {/* Extra space for fixed logout button */}
        <Spacer size="3xl" />
        <Spacer size="3xl" />
      </ScrollView>

      {/* Logout Button - Fixed at bottom above navigation bar */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text variant="body" style={styles.logoutText}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: Spacing.md,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  sectionsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  logoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EBEEF2',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  logoutButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  logoutText: {
    color: Colors.accent,
    fontWeight: '600',
    fontSize: 16,
  },
});
