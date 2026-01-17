/**
 * BusinessDetailsScreen
 * 
 * Screen for viewing and editing business details.
 * Includes ABN, business name, trading name, address, and license information.
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
import { Text, Spacer, Input, Button, Badge } from '../../design-system';
import { Colors, Spacing } from '../../design-system/primitives';
import { useAuth } from '../../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BusinessDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, updateProfile } = useAuth();

  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [tradingName, setTradingName] = useState(user?.tradingName || '');
  const [abn, setAbn] = useState(user?.abn || '');
  const [businessAddress, setBusinessAddress] = useState(user?.businessAddress || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{
    businessName?: string;
    tradingName?: string;
    abn?: string;
    businessAddress?: string;
  }>({});

  const validateBusinessName = (value: string) => {
    if (!value.trim()) {
      return 'Business name is required';
    }
    if (value.trim().length < 2) {
      return 'Business name must be at least 2 characters';
    }
    return '';
  };

  const validateTradingName = (value: string) => {
    // Trading name is optional
    if (value && value.trim().length < 2) {
      return 'Trading name must be at least 2 characters';
    }
    return '';
  };

  const validateABN = (value: string) => {
    if (!value.trim()) {
      return 'ABN is required';
    }
    const abnDigits = value.replace(/\s/g, '');
    if (!/^\d{11}$/.test(abnDigits)) {
      return 'ABN must be 11 digits';
    }
    return '';
  };

  const validateBusinessAddress = (value: string) => {
    if (!value.trim()) {
      return 'Business address is required';
    }
    if (value.trim().length < 10) {
      return 'Please enter a complete address';
    }
    return '';
  };

  const handleBusinessNameBlur = () => {
    const error = validateBusinessName(businessName);
    setErrors(prev => ({ ...prev, businessName: error }));
  };

  const handleTradingNameBlur = () => {
    const error = validateTradingName(tradingName);
    setErrors(prev => ({ ...prev, tradingName: error }));
  };

  const handleABNBlur = () => {
    const error = validateABN(abn);
    setErrors(prev => ({ ...prev, abn: error }));
  };

  const handleBusinessAddressBlur = () => {
    const error = validateBusinessAddress(businessAddress);
    setErrors(prev => ({ ...prev, businessAddress: error }));
  };

  const handleSave = async () => {
    // Validate all fields
    const businessNameError = validateBusinessName(businessName);
    const tradingNameError = validateTradingName(tradingName);
    const abnError = validateABN(abn);
    const businessAddressError = validateBusinessAddress(businessAddress);

    setErrors({
      businessName: businessNameError,
      tradingName: tradingNameError,
      abn: abnError,
      businessAddress: businessAddressError,
    });

    // Don't save if there are errors
    if (businessNameError || tradingNameError || abnError || businessAddressError) {
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        businessName,
        tradingName,
        abn,
        businessAddress,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error updating business details:', error);
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
        <Text variant="h3" weight="bold">Business Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Spacer size="md" />

        {/* License Status Banner */}
        {user?.licenseVerified && (
          <>
            <View style={styles.verifiedBanner}>
              <Badge variant="success" label="✓ License Verified" />
              <Spacer size="xs" />
              <Text variant="bodySmall" style={styles.verifiedText}>
                Your license has been verified and is active
              </Text>
            </View>
            <Spacer size="md" />
          </>
        )}

        {/* Form */}
        <Input
          label="Business Name"
          value={businessName}
          onChangeText={setBusinessName}
          onBlur={handleBusinessNameBlur}
          placeholder="Enter business name"
          error={errors.businessName}
        />

        <Spacer size="md" />

        <Input
          label="Trading Name"
          value={tradingName}
          onChangeText={setTradingName}
          onBlur={handleTradingNameBlur}
          placeholder="Enter trading name (optional)"
          error={errors.tradingName}
        />

        <Spacer size="md" />

        <Input
          label="ABN"
          value={abn}
          onChangeText={setAbn}
          onBlur={handleABNBlur}
          placeholder="Enter ABN (11 digits)"
          keyboardType="number-pad"
          error={errors.abn}
        />

        <Spacer size="md" />

        <Input
          label="Business Address"
          value={businessAddress}
          onChangeText={setBusinessAddress}
          onBlur={handleBusinessAddressBlur}
          placeholder="Enter business address"
          multiline
          numberOfLines={3}
          error={errors.businessAddress}
        />

        <Spacer size="md" />

        {/* License Information */}
        <View style={styles.licenseSection}>
          <Text variant="h4" style={styles.sectionTitle}>
            License Information
          </Text>
          <Spacer size="sm" />
          <View style={styles.infoRow}>
            <Text variant="body" style={styles.infoLabel}>License Number:</Text>
            <Text variant="body" style={styles.infoValue}>{user?.licenseNumber || 'Not set'}</Text>
          </View>
          <Spacer size="xs" />
          <View style={styles.infoRow}>
            <Text variant="body" style={styles.infoLabel}>License State:</Text>
            <Text variant="body" style={styles.infoValue}>{user?.licenseState || 'Not set'}</Text>
          </View>
          <Spacer size="xs" />
          <View style={styles.infoRow}>
            <Text variant="body" style={styles.infoLabel}>License Type:</Text>
            <Text variant="body" style={styles.infoValue}>{user?.licenseType || 'Not set'}</Text>
          </View>
        </View>

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
  verifiedBanner: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  verifiedText: {
    color: Colors.textSecondary,
  },
  licenseSection: {
    backgroundColor: '#F5F5F5',
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    color: Colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: Colors.textSecondary,
  },
  infoValue: {
    color: Colors.text,
    fontWeight: '600',
  },
});
