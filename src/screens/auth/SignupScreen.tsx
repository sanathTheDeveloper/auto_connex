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

import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Animated, Dimensions, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../design-system/atoms/Text';
import { Button } from '../../design-system/atoms/Button';
import { Spacer } from '../../design-system/atoms/Spacer';
import { Input } from '../../design-system/molecules/Input';
import { Select } from '../../design-system/molecules/Select';
import {
  PhoneInput,
  EmailInput,
  ABNInput,
} from '../../design-system/molecules/auth';
import { Colors, Spacing, BorderRadius, responsive } from '../../design-system/primitives';
import { useAuth, SignupData } from '../../contexts/AuthContext';
import { lookupABN } from '../../services/mockAPI';
import { AUSTRALIAN_STATES } from '../../data/australia';
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
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation, route }) => {
  const { userType } = route.params;
  const { signup } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isABNVerified, setIsABNVerified] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [animatingStep, setAnimatingStep] = useState(1);

  /**
   * Animate transition between steps
   */
  const animateToStep = (newStep: number, direction: 'forward' | 'back') => {
    const toValue = direction === 'forward' ? -SCREEN_WIDTH : SCREEN_WIDTH;

    // Slide out current step
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update step and reset position for slide in
      setAnimatingStep(newStep);
      setCurrentStep(newStep);
      slideAnim.setValue(direction === 'forward' ? SCREEN_WIDTH : -SCREEN_WIDTH);

      // Slide in new step
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };
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
   * Navigate to next step with animation
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
        if (isValid) {
          // Directly register - no modal needed
          handleSignup();
        }
        return;
    }

    if (isValid) {
      animateToStep(currentStep + 1, 'forward');
    }
  };

  /**
   * Navigate to previous step with animation
   */
  const handleBack = () => {
    if (currentStep > 1) {
      animateToStep(currentStep - 1, 'back');
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
   * Render current step content with animation
   */
  const renderStepContent = () => {
    const getStepContent = () => {
      switch (animatingStep) {
        case 1:
          return renderStep1();
        case 2:
          return renderStep2();
        case 3:
          return renderStep3();
        default:
          return null;
      }
    };

    return (
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            transform: [{ translateX: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        {getStepContent()}
      </Animated.View>
    );
  };

  /**
   * Step 1: Contact Information
   */
  const renderStep1 = () => (
    <View>
      <Text variant="h4" weight="bold" style={styles.stepTitle}>
        Contact Information
      </Text>
      <Spacer size="xs" />
      <Text variant="caption" weight="medium" style={styles.stepSubtitle}>
        Let's start with your basic details
      </Text>
      
      <Spacer size="lg" />
      
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
      <Text variant="h4" weight="bold" style={styles.stepTitle}>
        Business Verification
      </Text>
      <Spacer size="xs" />
      <Text variant="caption" weight="medium" style={styles.stepSubtitle}>
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
          
          {/* Success Banner with Verification Badge - Centered pill shape */}
          <View style={styles.verificationBanner}>
            <View style={styles.verificationIconContainer}>
              <Text style={styles.verificationIcon}>✓</Text>
            </View>
            <Text variant="caption" weight="semibold" style={styles.verificationTitle}>
              ABN Verified Successfully
            </Text>
          </View>
          
          <Spacer size="lg" />
          
          {/* Business Details Card - Beige/Cream background matching design */}
          <View style={styles.businessDetailsCard}>
            {/* Header */}
            <View style={styles.detailsHeader}>
              <Text variant="h4" weight="bold" style={styles.detailsHeaderText}>
                Business Details
              </Text>
            </View>
            
            <View style={styles.detailsDivider} />
            
            <View style={styles.detailsContent}>
              {/* Business Name */}
              <View style={styles.detailRow}>
                <Text variant="caption" weight="semibold" style={styles.detailKey}>
                  BUSINESS NAME
                </Text>
                <Text variant="bodySmall" weight="medium" style={styles.detailValue}>
                  {formData.businessName}
                </Text>
              </View>
              
              {/* Trading Name */}
              <View style={styles.detailRow}>
                <Text variant="caption" weight="semibold" style={styles.detailKey}>
                  TRADING NAME
                </Text>
                <Text variant="bodySmall" weight="medium" style={styles.detailValue}>
                  {formData.tradingName}
                </Text>
              </View>
              
              {/* Address */}
              <View style={styles.detailRow}>
                <Text variant="caption" weight="semibold" style={styles.detailKey}>
                  ADDRESS
                </Text>
                <Text variant="bodySmall" weight="medium" style={styles.detailValue}>
                  {formData.businessAddress}
                </Text>
              </View>
              
              {/* State and Postcode - Two columns */}
              <View style={styles.detailsRow}>
                <View style={styles.detailRowHalf}>
                  <Text variant="caption" weight="semibold" style={styles.detailKey}>
                    STATE
                  </Text>
                  <Text variant="bodySmall" weight="medium" style={styles.detailValue}>
                    {formData.state}
                  </Text>
                </View>
                
                <View style={styles.detailRowHalf}>
                  <Text variant="caption" weight="semibold" style={styles.detailKey}>
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
   * Get license placeholder and label based on state
   */
  const getLicenseInfo = (state: string) => {
    switch (state) {
      case 'VIC':
        return {
          label: 'LMCT Number',
          placeholder: 'e.g. LMCT 12345',
          authority: 'Consumer Affairs Victoria',
        };
      case 'NSW':
        return {
          label: 'Motor Dealer Licence Number',
          placeholder: 'e.g. MD 123456',
          authority: 'NSW Fair Trading',
        };
      case 'QLD':
        return {
          label: 'Motor Dealer Licence Number',
          placeholder: 'e.g. 1234567',
          authority: 'Office of Fair Trading QLD',
        };
      case 'WA':
        return {
          label: 'Motor Vehicle Dealer Licence',
          placeholder: 'e.g. MVD 12345',
          authority: 'DMIRS Western Australia',
        };
      case 'SA':
        return {
          label: 'Dealer Licence Number',
          placeholder: 'e.g. D 123456',
          authority: 'Consumer and Business Services SA',
        };
      case 'TAS':
        return {
          label: 'Motor Vehicle Trader Licence',
          placeholder: 'e.g. MVT 1234',
          authority: 'Consumer Building and Occupational Services',
        };
      case 'ACT':
        return {
          label: 'Motor Vehicle Dealer Licence',
          placeholder: 'e.g. 12345678',
          authority: 'Access Canberra',
        };
      case 'NT':
        return {
          label: 'Motor Vehicle Dealer Licence',
          placeholder: 'e.g. MVD 1234',
          authority: 'Licensing NT',
        };
      default:
        return {
          label: 'Dealer Licence Number',
          placeholder: 'Enter your licence number',
          authority: 'your state licensing authority',
        };
    }
  };

  /**
   * Step 3: License Verification
   */
  const renderStep3 = () => {
    const licenseInfo = getLicenseInfo(formData.licenseState);

    return (
      <View>
        <Text variant="h4" weight="bold" style={styles.stepTitle}>
          License Details
        </Text>
        <Spacer size="xs" />
        <Text variant="caption" weight="medium" style={styles.stepSubtitle}>
          Verify your {userType === 'dealer' ? 'dealer' : 'wholesaler'} license
        </Text>

        <Spacer size="lg" />

        {/* State Selection */}
        <Select
          label="State"
          value={formData.licenseState}
          onChange={(value) => {
            updateField('licenseState', value);
            // Clear license number when state changes
            if (formData.licenseNumber) {
              updateField('licenseNumber', '');
            }
          }}
          options={AUSTRALIAN_STATES}
          placeholder="Select your state"
        />

        <Spacer size="md" />

        {/* License Number Input */}
        <Input
          label={licenseInfo.label}
          value={formData.licenseNumber}
          onChange={(text) => updateField('licenseNumber', text.toUpperCase())}
          placeholder={licenseInfo.placeholder}
          autoCapitalize="characters"
          autoCorrect={false}
          leftIcon="description"
          error={formErrors.licenseNumber}
        />

        <Spacer size="md" />

        {/* Verification Info Banner */}
        <View style={styles.verificationBannerContainer}>
          <Image
            source={require('../../../assets/icons/verified-badge.png')}
            style={styles.verifiedBadgeImage}
          />
          <Text variant="caption" style={styles.verificationBannerText}>
            Verification takes 1-2 business days. Once approved, you'll receive a verified badge. You can trade on the platform in the meantime.
          </Text>
        </View>
      </View>
    );
  };


  /**
   * Progress indicator
   */
  const renderProgress = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((step) => (
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
              {/* Card Content */}
              <View style={styles.cardContent}>
                {/* Progress Indicator */}
                {renderProgress()}

                <Spacer size="sm" />

                {/* Step Content */}
                {renderStepContent()}
              </View>

              {/* Action Buttons - Pinned to bottom */}
              <View style={styles.actions}>
                {currentStep > 1 ? (
                  <>
                    <Button
                      variant="outline"
                      size="md"
                      onPress={handleBack}
                      style={styles.backButton}
                    >
                      Back
                    </Button>

                    <Button
                      variant="primary"
                      size="md"
                      onPress={handleNext}
                      loading={isLoading}
                      style={styles.nextButton}
                      disabled={currentStep === 2 && !isABNVerified}
                    >
                      {currentStep === 3 ? 'Register' : 'Continue'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onPress={handleNext}
                    loading={isLoading}
                  >
                    Continue
                  </Button>
                )}
              </View>
            </View>

            {/* Background Image - positioned bottom left */}
            <View style={styles.bottomImageContainer}>
              <Image
                source={require('../../../assets/images/singup-backgroundimage.png')}
                style={styles.bottomImage}
              />
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
    backgroundColor: Colors.black,
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
  animatedContainer: {
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xs,
  },
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    overflow: 'hidden',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
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
    textAlign: 'center',
    marginBottom: 4,
  },
  stepSubtitle: {
    color: Colors.greyscale700,
    opacity: 0.85,
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
    gap: Spacing.sm,
    width: '100%',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
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
    borderRadius: 100,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    alignSelf: 'center',
  },
  verificationIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationIcon: {
    fontSize: responsive.getFontSize('lg'),
    color: Colors.white,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  verificationTitle: {
    color: Colors.success,
    lineHeight: 18,
  },
  businessDetailsCard: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.greyscale300 + '60',
    overflow: 'hidden',
  },
  detailsHeader: {
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.greyscale300 + '60',
  },
  detailsHeaderText: {
    color: Colors.text,
    letterSpacing: -0.3,
    // fontSize handled by Text variant h4
  },
  detailsDivider: {
    height: 0,
  },
  detailsContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  detailsLabel: {
    letterSpacing: 0.5,
    color: Colors.text,
    opacity: 0.7,
  },
  detailRow: {
    flexDirection: 'column',
    gap: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  detailRowHalf: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  detailKey: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.5,
  },
  detailValue: {
    color: Colors.text,
    lineHeight: 18,
  },
  // License Step Styles
  helperText: {
    color: Colors.textTertiary,
    opacity: 0.8,
    marginTop: -8,
  },
  helperTextSmall: {
    color: Colors.textTertiary,
    opacity: 0.7,
    fontSize: responsive.getFontSize('sm'),
    fontStyle: 'italic',
  },
  inputLabel: {
    color: Colors.text,
    marginBottom: 4,
  },
  licenseRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  licenseHalf: {
    flex: 1,
    position: 'relative',
  },
  selectPlaceholder: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectPlaceholderText: {
    color: Colors.textTertiary,
    flex: 1,
  },
  dropdownIcon: {
    fontSize: responsive.getFontSize('sm'),
    color: Colors.textTertiary,
    marginLeft: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.greyscale300,
    marginTop: 4,
    maxHeight: 140,
    zIndex: 1000,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 140,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.greyscale300 + '50',
    backgroundColor: Colors.white,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primary + '08',
  },
  dropdownItemText: {
    color: Colors.text,
    flex: 1,
    fontSize: responsive.getFontSize('base'),
  },
  dropdownItemTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  dropdownCheckmark: {
    fontSize: responsive.getFontSize('sm'),
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  // Verification Banner
  verificationBannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  verifiedBadgeImage: {
    width: 24,
    height: 24,
  },
  verificationBannerText: {
    flex: 1,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  // Bottom Background Image - positioned bottom left
  bottomImageContainer: {
    backgroundColor: Colors.black,
    marginTop: -105,
    marginHorizontal: -Spacing.md,
    flex: 1,
    minHeight: 300,
    zIndex: -1,
  },
  bottomImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    position: 'absolute',
    left: -10,
    bottom: 0,
  },
});

export default SignupScreen;
