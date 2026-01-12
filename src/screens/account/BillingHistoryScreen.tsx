/**
 * BillingHistoryScreen
 * 
 * Screen for viewing past billing history and invoices.
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { Text, Spacer } from '../../design-system';
import { Colors, Spacing } from '../../design-system/primitives';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BillingHistoryScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text variant="body" style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text variant="h2" style={styles.title}>
            Billing History
          </Text>
        </View>

        <Spacer size="lg" />

        <View style={styles.placeholderContainer}>
          <Text variant="h3" style={styles.placeholderTitle}>
            Coming Soon
          </Text>
          <Spacer size="sm" />
          <Text variant="body" style={styles.placeholderText}>
            View your billing history, invoices, and transaction records.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.md,
  },
  backButton: {
    marginBottom: Spacing.sm,
  },
  backText: {
    color: Colors.primary,
  },
  title: {
    color: Colors.text,
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
