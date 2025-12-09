/**
 * SignupScreen Component
 * 
 * Multi-step signup wizard with form validation.
 * Steps: 1) Contact Info → 2) Business Verification → 3) License → 4) Payment Setup
 * Uses slide animations between steps and progress indicator.
 * 
 * @example
 * <Stack.Screen 
 *   name="Signup" 
 *   component={SignupScreen} 
 *   options={{ headerShown: false }} 
 * />
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../design-system/atoms/Text';
import { Button } from '../../design-system/atoms/Button';
import { Spacer } from '../../design-system/atoms/Spacer';
import { Input } from '../../design-system/molecules/Input';
import { Modal } from '../../design-system/molecules/Modal';
import { VerificationBadge } from '../../design-system/molecules/VerificationBadge';
import {
  PhoneInput,
  EmailInput,
  ABNInput,
  LicenseInput,
  validateAustralianPhone,
  validateEmail,
  validateABN,
  validateLicense,
} from '../../design-system/molecules/auth';
import { Colors, Spacing } from '../../design-system/primitives';
import { useAuth, SignupData } from '../../contexts/AuthContext';
import { lookupABN, verifyLicense, BusinessEntity } from '../../services/mockAPI';
import { WelcomeModal } from './WelcomeModal';

// Navigation types
type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  Signup: { userType: 'dealer' | 'wholesaler' };
  Home: undefined;
};

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;
type SignupScreenRouteProp = RouteProp<RootStackParamList, 'Signup'>;

interface SignupScreenProps {
  navigation: SignupScreenNavigationProp;
  route: SignupScreenRouteProp;
}

/**
 * Form data for all signup steps
 */
interface FormData {
  // Step 1: Contact Info
  fullName: string;
  email: string;
  phone: string;
  
  // Step 2: Business Verification
  abn: string;
  businessName: string;
  tradingName: string;
  businessAddress: string;
  state: string;
  postcode: string;
  
  // Step 3: License
  licenseNumber: string;
  licenseState: string;
  licenseType: string;
  
  // Step 4: Payment Details
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  billingPostcode: string;
}

/**
 * Form errors for validation
 */
interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  abn?: string;
  licenseNumber?: string;
  cardNumber?: string;
  cardholderName?: string;
  expiryDate?: string;
  cvv?: string;
  billingPostcode?: string;
}

/**
 * SignupScreen
 * 
 * 4-step signup wizard:
 * 1. Contact Info (name, email, phone)
 * 2. Business Verification (ABN lookup with auto-fill)
 * 3. License Verification (state-specific)
 * 4. Payment Setup (card details, consent)
 */
export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation, route }) => {
  const { userType } = route.params;
  const { signup } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isABNVerified, setIsABNVerified] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    abn: '',
    businessName: '',
    tradingName: '',
    businessAddress: '',
    state: '',
    postcode: '',
    licenseNumber: '',
    licenseState: '',
    licenseType: '',
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    billingPostcode: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  /**
   * Update form field
   */
  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  };

  /**
   * Validate Step 1: Contact Info
   */
  const validateStep1 = (): boolean => {
    // Validation removed - allow any input
    return true;
  };

  /**
   * Validate Step 2: ABN
   */
  const validateStep2 = (): boolean => {
    // Validation removed - allow any input
    return true;
  };

  /**
   * Validate Step 3: License
   */
  const validateStep3 = (): boolean => {
    // Validation removed - allow any input
    return true;
  };

  /**
   * Validate Step 4: Payment Details
   */
  const validateStep4 = (): boolean => {
    // Validation removed - allow any input
    return true;
  };

  /**
   * Handle ABN lookup and auto-fill business details
   */
  const handleABNLookup = async () => {
    if (!formData.abn) return;
    
    setIsVerifying(true);
    try {
      const business = await lookupABN(formData.abn);
      
      if (business) {
        setFormData(prev => ({
          ...prev,
          businessName: business.businessName,
          tradingName: business.tradingName,
          businessAddress: business.address,
          state: business.state,
          postcode: business.postcode,
        }));
        setIsABNVerified(true);
      }
    } catch (error) {
      console.error('ABN lookup failed:', error);
      setIsABNVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Navigate to next step
   */
  const handleNext = async () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        // Block navigation if ABN not verified
        if (!isABNVerified && formData.abn) {
          return; // Don't proceed until verified
        }
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        // Final step - validate payment and complete signup
        isValid = validateStep4();
        if (isValid) {
          await handleSignup();
        }
        return;
    }
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  /**
   * Navigate to previous step
   */
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  /**
   * Complete signup and navigate to home
   */
  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const signupData: SignupData = {
        userType,
        ...formData,
      };
      
      await signup(signupData);
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Auto-navigate after 2.5s
      setTimeout(() => {
        setShowSuccessModal(false);
        navigation.replace('Home');
      }, 2500);
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render current step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  /**
   * Step 1: Contact Information
   */
  const renderStep1 = () => (
    <View>
      <Text variant="h2" weight="bold" style={styles.stepTitle}>
        Contact Information
      </Text>
      <Spacer size="xs" />
      <Text variant="bodySmall" color="textTertiary" style={styles.stepSubtitle}>
        Let's start with your basic details
      </Text>
      
      <Spacer size="xl" />
      
      <Input
        label="Full Name"
        value={formData.fullName}
        onChange={(text) => updateField('fullName', text)}
        placeholder="John Smith"
        error={formErrors.fullName}
        autoCapitalize="words"
      />
      
      <Spacer size="md" />
      
      <EmailInput
        value={formData.email}
        onChange={(text) => updateField('email', text)}
        error={formErrors.email}
      />
      
      <Spacer size="md" />
      
      <PhoneInput
        value={formData.phone}
        onChange={(text) => updateField('phone', text)}
        error={formErrors.phone}
      />
    </View>
  );

  /**
   * Step 2: Business Verification (ABN)
   */
  const renderStep2 = () => (
    <View>
      <Text variant="h2" weight="bold" style={styles.stepTitle}>
        Business Verification
      </Text>
      <Spacer size="xs" />
      <Text variant="bodySmall" color="textTertiary" style={styles.stepSubtitle}>
        Enter your ABN to verify your business
      </Text>
      
      <Spacer size="xl" />
      
      <ABNInput
        value={formData.abn}
        onChange={(text) => {
          updateField('abn', text);
          // Reset verification when ABN changes
          if (isABNVerified) {
            setIsABNVerified(false);
            setFormData(prev => ({
              ...prev,
              businessName: '',
              tradingName: '',
              businessAddress: '',
              state: '',
              postcode: '',
            }));
          }
        }}
        error={formErrors.abn}
        showVerifyButton={formData.abn.length >= 11 && !isABNVerified}
        isVerifying={isVerifying}
        isVerified={isABNVerified}
        onVerify={handleABNLookup}
      />
      
      {/* Verified Business Details */}
      {isABNVerified && formData.businessName && (
        <>
          <Spacer size="xl" />
          
          {/* Success Banner with Verification Badge */}
          <View style={styles.verificationBanner}>
            <View style={styles.verificationIconContainer}>
              <Text style={styles.verificationIcon}>✓</Text>
            </View>
            <View style={styles.verificationTextContainer}>
              <Text variant="bodySmall" weight="bold" style={styles.verificationTitle}>
                ABN Verified
              </Text>
              <Text variant="caption" style={styles.verificationSubtitle}>
                Business details confirmed
              </Text>
            </View>
          </View>
          
          <Spacer size="lg" />
          
          {/* Business Details Card */}
          <View style={styles.businessDetailsCard}>
            <View style={styles.detailsHeader}>
              <Text variant="bodySmall" weight="bold" style={styles.detailsHeaderText}>
                Business Details
              </Text>
            </View>
            
            <View style={styles.detailsDivider} />
            
            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Text variant="caption" style={styles.detailKey}>
                  BUSINESS NAME
                </Text>
                <Text variant="body" weight="semibold" style={styles.detailValue}>
                  {formData.businessName}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text variant="caption" style={styles.detailKey}>
                  TRADING NAME
                </Text>
                <Text variant="bodySmall" weight="medium" style={styles.detailValue}>
                  {formData.tradingName}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text variant="caption" style={styles.detailKey}>
                  ADDRESS
                </Text>
                <Text variant="bodySmall" weight="medium" style={styles.detailValue}>
                  {formData.businessAddress}
                </Text>
              </View>
              
              <View style={styles.detailsRow}>
                <View style={styles.detailRowHalf}>
                  <Text variant="caption" style={styles.detailKey}>
                    STATE
                  </Text>
                  <Text variant="bodySmall" weight="medium" style={styles.detailValue}>
                    {formData.state}
                  </Text>
                </View>
                
                <View style={styles.detailRowHalf}>
                  <Text variant="caption" style={styles.detailKey}>
                    POSTCODE
                  </Text>
                  <Text variant="bodySmall" weight="medium" style={styles.detailValue}>
                    {formData.postcode}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );

  /**
   * Step 3: License Verification
   */
  const renderStep3 = () => (
    <View>
      <Text variant="h2" weight="bold" style={styles.stepTitle}>
        Dealer License
      </Text>
      <Spacer size="xs" />
      <Text variant="bodySmall" color="textTertiary" style={styles.stepSubtitle}>
        Verify your motor dealer license
      </Text>
      
      <Spacer size="xl" />
      
      <LicenseInput
        value={formData.licenseNumber}
        onChange={(text) => updateField('licenseNumber', text)}
        error={formErrors.licenseNumber}
        state={formData.state as any}
      />
    </View>
  );

  /**
   * Step 4: Payment Setup (Card Details)
   */
  const renderStep4 = () => (
    <View>
      <Text variant="h2" weight="bold" style={styles.stepTitle}>
        Payment Details
      </Text>
      <Spacer size="xs" />
      <Text variant="bodySmall" color="textTertiary" style={styles.stepSubtitle}>
        Add your card for marketplace transactions
      </Text>
      
      <Spacer size="xl" />
      
      {/* Card Number */}
      <Input
        label="Card Number"
        value={formData.cardNumber}
        onChange={(text) => {
          // Format: XXXX XXXX XXXX XXXX
          const formatted = text
            .replace(/\D/g, '')
            .slice(0, 16)
            .replace(/(\d{4})/g, '$1 ')
            .trim();
          updateField('cardNumber', formatted);
        }}
        placeholder="1234 5678 9012 3456"
        keyboardType="number-pad"
        leftIcon="card"
        maxLength={19} // 16 digits + 3 spaces
        error={formErrors.cardNumber}
      />
      
      <Spacer size="md" />
      
      {/* Cardholder Name */}
      <Input
        label="Cardholder Name"
        value={formData.cardholderName}
        onChange={(text) => updateField('cardholderName', text)}
        placeholder="John Smith"
        autoCapitalize="words"
        leftIcon="user"
        error={formErrors.cardholderName}
      />
      
      <Spacer size="md" />
      
      {/* Expiry Date and CVV - Two Columns */}
      <View style={styles.cardDetailsRow}>
        <View style={styles.cardDetailHalf}>
          <Input
            label="Expiry Date"
            value={formData.expiryDate}
            onChange={(text) => {
              // Format: MM/YY
              const formatted = text
                .replace(/\D/g, '')
                .slice(0, 4)
                .replace(/(\d{2})(\d{0,2})/, (match, p1, p2) => 
                  p2 ? `${p1}/${p2}` : p1
                );
              updateField('expiryDate', formatted);
            }}
            placeholder="MM/YY"
            keyboardType="number-pad"
            leftIcon="calendar"
            maxLength={5}
            error={formErrors.expiryDate}
          />
        </View>
        
        <View style={styles.cardDetailHalf}>
          <Input
            label="CVV"
            value={formData.cvv}
            onChange={(text) => {
              const formatted = text.replace(/\D/g, '').slice(0, 3);
              updateField('cvv', formatted);
            }}
            placeholder="123"
            keyboardType="number-pad"
            leftIcon="shield-checkmark"
            maxLength={3}
            secureTextEntry
            error={formErrors.cvv}
          />
        </View>
      </View>
      
      <Spacer size="md" />
      
      {/* Billing Postcode */}
      <Input
        label="Billing Postcode"
        value={formData.billingPostcode}
        onChange={(text) => {
          const formatted = text.replace(/\D/g, '').slice(0, 4);
          updateField('billingPostcode', formatted);
        }}
        placeholder="2000"
        keyboardType="number-pad"
        leftIcon="map-pin"
        maxLength={4}
        error={formErrors.billingPostcode}
      />
      
      <Spacer size="xl" />
      
      {/* Security Badge */}
      <View style={styles.securityBadge}>
        <View style={styles.securityIconContainer}>
          <Text style={styles.securityIcon}>🔒</Text>
        </View>
        <View style={styles.securityTextContainer}>
          <Text variant="caption" weight="semibold" style={styles.securityTitle}>
            Secure Payment
          </Text>
          <Text variant="caption" style={styles.securitySubtitle}>
            Your card details are encrypted and secure
          </Text>
        </View>
      </View>
      
      <Spacer size="md" />
      
      {/* Payment Terms */}
      <View style={styles.termsContainer}>
        <Text variant="caption" color="textTertiary" style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text variant="caption" style={styles.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text variant="caption" style={styles.termsLink}>Privacy Policy</Text>
          . Card will be charged only for completed transactions.
        </Text>
      </View>
    </View>
  );

  /**
   * Progress indicator
   */
  const renderProgress = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4].map((step) => (
        <View
          key={step}
          style={[
            styles.progressDot,
            step === currentStep && styles.progressDotActive,
            step < currentStep && styles.progressDotComplete,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Gradient Background - Enhanced with brand colors */}
      <LinearGradient
        colors={[
          Colors.backgroundAlt,     // #F5F1E3 - Beige (top)
          Colors.tealLight + '15',  // #51EAEA - Light teal (15% opacity)
          Colors.primary + '20',    // #0ABAB5 - Primary teal (20% opacity)
          Colors.backgroundAlt,     // #F5F1E3 - Beige (bottom)
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Centered Card Container */}
            <View style={styles.cardContainer}>
              {/* Progress Indicator */}
              {renderProgress()}
              
              <Spacer size="lg" />
              
              {/* Step Content */}
              {renderStepContent()}
              
              <Spacer size="xl" />
              
              {/* Action Buttons - Inside Card */}
              <View style={styles.actions}>
                {currentStep > 1 ? (
                  <>
                    <Button
                      variant="ghost"
                      size="lg"
                      onPress={handleBack}
                      style={styles.backButton}
                    >
                      Back
                    </Button>
                    
                    <Button
                      variant="primary"
                      size="lg"
                      onPress={handleNext}
                      loading={isLoading}
                      style={styles.nextButton}
                      disabled={currentStep === 2 && !isABNVerified}
                    >
                      {currentStep === 4 ? 'Finish' : 'Continue'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onPress={handleNext}
                    loading={isLoading}
                  >
                    Continue
                  </Button>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        
        {/* Welcome Modal - Full Screen Animated */}
        <WelcomeModal
          visible={showSuccessModal}
          onDismiss={() => {
            setShowSuccessModal(false);
            navigation.replace('Home');
          }}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    minHeight: '100%',
  },
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    marginHorizontal: 'auto',
    width: '100%',
    maxWidth: 480,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.greyscale300,
  },
  progressDotActive: {
    width: 32,
    backgroundColor: Colors.primary,
  },
  progressDotComplete: {
    backgroundColor: Colors.success,
  },
  stepTitle: {
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 4,
  },
  stepSubtitle: {
    opacity: 0.65,
    lineHeight: 20,
    textAlign: 'center',
  },
  consentText: {
    lineHeight: 24,
    textAlign: 'center',
  },
  bulletContainer: {
    gap: Spacing.md,
  },
  bulletItem: {
    lineHeight: 22,
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  verifiedContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  verificationBanner: {
    backgroundColor: Colors.success + '10',
    borderRadius: 16,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  verificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verificationIcon: {
    fontSize: 28,
    color: Colors.white,
    fontWeight: 'bold',
  },
  verificationTextContainer: {
    flex: 1,
  },
  verificationTitle: {
    color: Colors.success,
    marginBottom: 2,
  },
  verificationSubtitle: {
    color: Colors.text,
    opacity: 0.6,
  },
  businessDetailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.greyscale300,
    overflow: 'hidden',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  detailsHeader: {
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.greyscale300,
  },
  detailsHeaderText: {
    color: Colors.text,
    letterSpacing: 0.3,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: Colors.greyscale300,
  },
  detailsContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  detailsLabel: {
    letterSpacing: 0.5,
    color: Colors.text,
    opacity: 0.7,
  },
  detailRow: {
    flexDirection: 'column',
    gap: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  detailRowHalf: {
    flex: 1,
    flexDirection: 'column',
    gap: 6,
  },
  detailKey: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.5,
    fontSize: 12,
  },
  detailValue: {
    color: Colors.text,
    lineHeight: 22,
  },
  // Payment Step Styles
  cardDetailsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cardDetailHalf: {
    flex: 1,
  },
  securityBadge: {
    backgroundColor: Colors.greyscale100,
    borderRadius: 12,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.greyscale300,
  },
  securityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityIcon: {
    fontSize: 20,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    color: Colors.text,
    marginBottom: 2,
  },
  securitySubtitle: {
    color: Colors.textTertiary,
    opacity: 0.8,
  },
  termsContainer: {
    paddingHorizontal: Spacing.sm,
  },
  termsText: {
    lineHeight: 18,
    textAlign: 'center',
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default SignupScreen;
