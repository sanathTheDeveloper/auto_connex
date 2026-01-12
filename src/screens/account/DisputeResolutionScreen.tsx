/**
 * DisputeResolutionScreen
 *
 * Combined screen for dispute resolution and contact support.
 * Integrates email support with dispute filing functionality.
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { Text, Spacer, Button, Input } from '../../design-system';
import { Colors, Spacing } from '../../design-system/primitives';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DisputeResolutionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleEmailSupport = () => {
    const email = 'support@autoconnex.com.au';
    const subjectLine = subject || 'Support Request';
    const body = message || '';
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(mailto);
  };

  const handleSubmit = async () => {
    if (!subject || !message) return;

    setIsSending(true);
    // Simulate sending
    setTimeout(() => {
      handleEmailSupport();
      setIsSending(false);
      setSubject('');
      setMessage('');
    }, 500);
  };

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
        <Text variant="h3" weight="bold">Dispute & Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Spacer size="md" />

        {/* Contact Information Card */}
        <View style={styles.contactCard}>
          <Text variant="h4" style={styles.cardTitle}>
            Contact Information
          </Text>
          <Spacer size="md" />
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:support@autoconnex.com.au')}
          >
            <Ionicons name="mail" size={20} color={Colors.primary} />
            <Text variant="body" style={styles.contactText}>
              support@autoconnex.com.au
            </Text>
          </TouchableOpacity>
          <Spacer size="sm" />
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('tel:1800282662')}
          >
            <Ionicons name="call" size={20} color={Colors.primary} />
            <Text variant="body" style={styles.contactText}>
              1800 AUTO CONNEX
            </Text>
          </TouchableOpacity>
          <Spacer size="sm" />
          <View style={styles.contactRow}>
            <Ionicons name="time" size={20} color={Colors.primary} />
            <Text variant="body" style={styles.contactText}>
              Mon-Fri 9AM-6PM AEST
            </Text>
          </View>
        </View>

        <Spacer size="xl" />

        {/* Dispute Information */}
        <View style={styles.infoCard}>
          <Text variant="h4" style={styles.cardTitle}>
            How Dispute Resolution Works
          </Text>
          <Spacer size="sm" />
          <Text variant="bodySmall" style={styles.stepText}>
            1. Submit a dispute within 14 days of transaction
          </Text>
          <Spacer size="xs" />
          <Text variant="bodySmall" style={styles.stepText}>
            2. Provide evidence and documentation
          </Text>
          <Spacer size="xs" />
          <Text variant="bodySmall" style={styles.stepText}>
            3. Our team will review within 3-5 business days
          </Text>
          <Spacer size="xs" />
          <Text variant="bodySmall" style={styles.stepText}>
            4. Resolution determined based on platform policies
          </Text>
        </View>

        <Spacer size="xl" />

        {/* Disputes Empty State */}
        <View style={styles.emptyState}>
          <Text variant="h4" style={styles.emptyTitle}>
            No Active Disputes
          </Text>
          <Spacer size="sm" />
          <Text variant="body" style={styles.emptyText}>
            You currently have no active disputes
          </Text>
          <Spacer size="md" />
          <Button
            variant="outline"
            fullWidth
            onPress={() => navigation.navigate('Home')}
          >
            Explore Vehicles
          </Button>
        </View>

        <Spacer size="xl" />

        {/* Contact Form */}
        <Text variant="h4" style={styles.formTitle}>
          Send us a message
        </Text>
        <Spacer size="md" />

        <Input
          label="Subject"
          value={subject}
          onChangeText={setSubject}
          placeholder="What do you need help with?"
        />

        <Spacer size="md" />

        <Input
          label="Message"
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your issue or question..."
          multiline
          numberOfLines={6}
        />

        <Spacer size="xl" />

        <Button
          variant="primary"
          fullWidth
          onPress={handleSubmit}
          disabled={isSending || !subject || !message}
        >
          {isSending ? 'Sending...' : 'Send Email'}
        </Button>

        <Spacer size="2xl" />
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
  contactCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contactText: {
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  infoCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  cardTitle: {
    color: Colors.text,
    fontWeight: '600',
  },
  stepText: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  emptyTitle: {
    color: Colors.text,
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  formTitle: {
    color: Colors.text,
    fontWeight: '600',
  },
});
