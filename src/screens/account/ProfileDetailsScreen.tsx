/**
 * ProfileDetailsScreen
 * 
 * Screen for viewing and editing user profile details.
 * Includes name, email, phone, and profile photo.
 */

import React, { useState } from 'react';
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
import { Text, Spacer, Input, Button } from '../../design-system';
import { Colors, Spacing } from '../../design-system/primitives';
import { useAuth } from '../../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, updateProfile } = useAuth();

  // Generate account name similar to dealer names on HomeScreen
  const accountName = user?.accountName || `Dealer_${Math.floor(Math.random() * 99) + 1}`;
  
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email';
    }
    return '';
  };

  const validatePhone = (value: string) => {
    if (!value.trim()) {
      return 'Phone number is required';
    }
    const phoneRegex = /^(\+61|0)4\d{8}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Please enter a valid Australian mobile number';
    }
    return '';
  };

  const handleEmailBlur = () => {
    const error = validateEmail(email);
    setErrors(prev => ({ ...prev, email: error }));
  };

  const handlePhoneBlur = () => {
    const error = validatePhone(phone);
    setErrors(prev => ({ ...prev, phone: error }));
  };

  const handleSave = async () => {
    // Validate all fields
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);

    setErrors({
      email: emailError,
      phone: phoneError,
    });

    // Don't save if there are errors
    if (emailError || phoneError) {
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        email,
        phone,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
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
        <Text variant="h3" weight="bold">Profile Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Spacer size="md" />

        {/* Account Name - Non-editable, grey background */}
        <View style={styles.fieldContainer}>
          <Text variant="bodySmall" style={styles.fieldLabel}>
            Account Name
          </Text>
          <View style={styles.nonEditableField}>
            <Text variant="body" weight="semibold" style={styles.accountNameText}>
              {accountName}
            </Text>
          </View>
          <Text variant="caption" style={styles.fieldHelper}>
            Your unique account identifier
          </Text>
        </View>

        <Spacer size="md" />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          onBlur={handleEmailBlur}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Spacer size="md" />

        <Input
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          onBlur={handlePhoneBlur}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          error={errors.phone}
        />

        <Spacer size="xl" />

        <Button
          variant="primary"
          fullWidth
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
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
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  nonEditableField: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  accountNameText: {
    color: Colors.secondary,
    fontSize: 16,
  },
  fieldHelper: {
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
});
