/**
 * Mock API Service
 * 
 * Simulates backend API calls for development/testing.
 * Includes ABN lookup, license verification, and business data.
 * Uses realistic delays (1-2s) to simulate network latency.
 */

/**
 * Mock Australian business database
 */
const MOCK_BUSINESSES = [
  {
    abn: '53 004 085 616',
    businessName: 'Toyota Motor Corporation Australia',
    tradingName: 'Toyota Australia',
    address: '29-39 Lexia Place, Mulgrave VIC 3170',
    state: 'VIC',
    postcode: '3170',
    entityType: 'Australian Public Company',
    gstRegistered: true,
  },
  {
    abn: '12 345 678 901',
    businessName: 'Sydney Premium Motors Pty Ltd',
    tradingName: 'Sydney Premium Motors',
    address: '123 Parramatta Road, Auburn NSW 2144',
    state: 'NSW',
    postcode: '2144',
    entityType: 'Australian Private Company',
    gstRegistered: true,
  },
  {
    abn: '98 765 432 109',
    businessName: 'Melbourne Auto Traders Pty Ltd',
    tradingName: 'Melbourne Auto Traders',
    address: '456 Bourke Street, Melbourne VIC 3000',
    state: 'VIC',
    postcode: '3000',
    entityType: 'Australian Private Company',
    gstRegistered: true,
  },
  {
    abn: '11 222 333 444',
    businessName: 'Brisbane Vehicle Solutions Pty Ltd',
    tradingName: 'Brisbane Vehicle Solutions',
    address: '789 Queen Street, Brisbane QLD 4000',
    state: 'QLD',
    postcode: '4000',
    entityType: 'Australian Private Company',
    gstRegistered: true,
  },
];

/**
 * Business entity returned from ABN lookup
 */
export interface BusinessEntity {
  abn: string;
  businessName: string;
  tradingName: string;
  address: string;
  state: string;
  postcode: string;
  entityType: string;
  gstRegistered: boolean;
}

/**
 * Mock ABN lookup
 * 
 * Simulates Australian Business Register (ABR) ABN lookup.
 * Returns business details if ABN is valid and exists in mock database.
 * 
 * @param abn - Australian Business Number (11 digits, formatted or not)
 * @returns Business entity or null if not found
 */
export const lookupABN = async (abn: string): Promise<BusinessEntity | null> => {
  // Simulate network delay (1-2 seconds)
  await delay(1000 + Math.random() * 1000);
  
  // Remove formatting (spaces, dashes)
  const cleanABN = abn.replace(/\D/g, '');
  
  // Format for comparison: XX XXX XXX XXX
  const formattedABN = formatABNForComparison(cleanABN);
  
  // Search mock database
  const business = MOCK_BUSINESSES.find(b => b.abn === formattedABN);
  
  if (business) {
    return { ...business };
  }
  
  // If not found but valid format, return generic business
  if (cleanABN.length === 11) {
    return {
      abn: formattedABN,
      businessName: 'Generic Motors Pty Ltd',
      tradingName: 'Generic Motors',
      address: '1 Business Street, Sydney NSW 2000',
      state: 'NSW',
      postcode: '2000',
      entityType: 'Australian Private Company',
      gstRegistered: true,
    };
  }
  
  return null;
};

/**
 * Mock license verification
 * 
 * Simulates state motor dealer license verification.
 * Returns verification status and license details.
 * 
 * @param licenseNumber - Dealer license number
 * @param state - Australian state
 * @returns License verification result
 */
export interface LicenseVerificationResult {
  isValid: boolean;
  licenseNumber: string;
  state: string;
  licenseType: string;
  holderName: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended' | 'invalid';
}

export const verifyLicense = async (
  licenseNumber: string,
  state: string
): Promise<LicenseVerificationResult> => {
  // Simulate network delay
  await delay(1200 + Math.random() * 800);
  
  const cleanLicense = licenseNumber.toUpperCase().trim();
  
  // Mock verification logic
  const isValidFormat = cleanLicense.length >= 6;
  
  if (!isValidFormat) {
    return {
      isValid: false,
      licenseNumber: cleanLicense,
      state,
      licenseType: 'Motor Dealer License',
      holderName: '',
      expiryDate: '',
      status: 'invalid',
    };
  }
  
  // Return mock valid license
  return {
    isValid: true,
    licenseNumber: cleanLicense,
    state,
    licenseType: state === 'QLD' ? 'Motor Dealer License' : 'LMCT License',
    holderName: 'License Holder Name',
    expiryDate: '2026-12-31',
    status: 'active',
  };
};

/**
 * Mock payment processing
 * 
 * Simulates payment gateway card validation.
 * Does NOT charge real money - for development only.
 * 
 * @param cardNumber - Credit card number
 * @param expiryMonth - Card expiry month (1-12)
 * @param expiryYear - Card expiry year (YYYY)
 * @param cvv - Card CVV/CVC
 * @returns Payment result
 */
export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  error?: string;
}

export const processPayment = async (
  cardNumber: string,
  expiryMonth: number,
  expiryYear: number,
  cvv: string
): Promise<PaymentResult> => {
  // Simulate payment processing delay
  await delay(2000 + Math.random() * 1000);
  
  // Basic validation (Luhn algorithm would go here in production)
  const cleanCard = cardNumber.replace(/\D/g, '');
  
  if (cleanCard.length < 13 || cleanCard.length > 19) {
    return {
      success: false,
      message: 'Invalid card number',
      error: 'INVALID_CARD_NUMBER',
    };
  }
  
  if (expiryMonth < 1 || expiryMonth > 12) {
    return {
      success: false,
      message: 'Invalid expiry month',
      error: 'INVALID_EXPIRY',
    };
  }
  
  if (cvv.length < 3 || cvv.length > 4) {
    return {
      success: false,
      message: 'Invalid CVV',
      error: 'INVALID_CVV',
    };
  }
  
  // Mock successful payment
  return {
    success: true,
    message: 'Payment method verified successfully',
    transactionId: `mock_txn_${Date.now()}`,
  };
};

/**
 * Delay utility for simulating network latency
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Format ABN for comparison: XX XXX XXX XXX
 */
const formatABNForComparison = (abn: string): string => {
  if (abn.length !== 11) return abn;
  return `${abn.slice(0, 2)} ${abn.slice(2, 5)} ${abn.slice(5, 8)} ${abn.slice(8)}`;
};

/**
 * Validate credit card using Luhn algorithm
 * 
 * @param cardNumber - Card number string (digits only)
 * @returns true if valid, false otherwise
 */
export const luhnCheck = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  // Loop through digits from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};
