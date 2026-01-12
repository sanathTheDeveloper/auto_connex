/**
 * ContactSupportScreen
 * 
 * Screen for contacting customer support.
 */

import React, { useState } from 'react';
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
import { Text, Spacer, Input, Button } from '../../design-system';
import { Colors, Spacing } from '../../design-system/primitives';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ContactSupportScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    setIsSending(true);
    // Simulate sending message
    setTimeout(() => {
      setIsSending(false);
      alert('Support request submitted successfully!');
      navigation.goBack();
    }, 1000);
  };

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
            Contact Support
          </Text>
        </View>

        <Spacer size="lg" />

        <View style={styles.infoCard}>
          <Text variant="body" style={styles.infoText}>
            📧 Email: support@autoconnex.com.au
          </Text>
          <Spacer size="xs" />
          <Text variant="body" style={styles.infoText}>
            📞 Phone: 1800 AUTO CONNEX
          </Text>
          <Spacer size="xs" />
          <Text variant="body" style={styles.infoText}>
            🕐 Hours: Mon-Fri 9AM-6PM AEST
          </Text>
        </View>

        <Spacer size="lg" />

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
          {isSending ? 'Sending...' : 'Submit Request'}
        </Button>
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
  infoCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  infoText: {
    color: Colors.text,
  },
  formTitle: {
    color: Colors.text,
  },
});
