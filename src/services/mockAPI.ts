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

// ============================================================================
// SELL FLOW API FUNCTIONS
// ============================================================================

/**
 * Vehicle details from registration lookup
 */
export interface RegoLookupResult {
  registration: string;
  state: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  color: string;
  bodyType: string;
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  engineSize: string;
  vin: string;
  mileage: number;
  hasLogbook: boolean;
}

/**
 * Mock vehicle database for rego lookup
 */
const MOCK_VEHICLES: RegoLookupResult[] = [
  {
    registration: 'ABC123',
    state: 'NSW',
    make: 'Toyota',
    model: 'Camry',
    variant: 'Ascent Sport',
    year: 2021,
    color: 'White',
    bodyType: 'Sedan',
    transmission: 'automatic',
    fuelType: 'petrol',
    engineSize: '2.5L',
    vin: '6T1BF3FK5MU123456',
    mileage: 45230,
    hasLogbook: true,
  },
  {
    registration: 'XYZ789',
    state: 'VIC',
    make: 'Mazda',
    model: 'CX-5',
    variant: 'Maxx Sport',
    year: 2022,
    color: 'Soul Red',
    bodyType: 'SUV',
    transmission: 'automatic',
    fuelType: 'petrol',
    engineSize: '2.0L',
    vin: 'JM3KFBDM5N0654321',
    mileage: 28500,
    hasLogbook: true,
  },
  {
    registration: 'DEF456',
    state: 'QLD',
    make: 'Ford',
    model: 'Ranger',
    variant: 'Wildtrak',
    year: 2020,
    color: 'Meteor Grey',
    bodyType: 'Ute',
    transmission: 'automatic',
    fuelType: 'diesel',
    engineSize: '2.0L Bi-Turbo',
    vin: 'MNAUXXMJ4LW987654',
    mileage: 67800,
    hasLogbook: false,
  },
  {
    registration: 'GHI321',
    state: 'SA',
    make: 'Hyundai',
    model: 'i30',
    variant: 'N Line',
    year: 2023,
    color: 'Performance Blue',
    bodyType: 'Hatchback',
    transmission: 'manual',
    fuelType: 'petrol',
    engineSize: '1.6L Turbo',
    vin: 'KMHK381GDPU456789',
    mileage: 12400,
    hasLogbook: true,
  },
  {
    registration: 'JKL654',
    state: 'WA',
    make: 'Tesla',
    model: 'Model 3',
    variant: 'Long Range',
    year: 2022,
    color: 'Pearl White',
    bodyType: 'Sedan',
    transmission: 'automatic',
    fuelType: 'electric',
    engineSize: 'Dual Motor',
    vin: '5YJ3E1EA5NF789012',
    mileage: 18900,
    hasLogbook: true,
  },
];

/**
 * Mock registration lookup
 *
 * Simulates vehicle registry API lookup by registration number.
 * Returns vehicle details if found in mock database.
 *
 * @param registration - Vehicle registration number
 * @param state - Australian state code
 * @returns Vehicle details or null if not found
 */
export const lookupRego = async (
  registration: string,
  state: string
): Promise<RegoLookupResult | null> => {
  // Simulate network delay (1-2 seconds)
  await delay(1000 + Math.random() * 1000);

  // Clean registration input
  const cleanRego = registration.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Search mock database
  const vehicle = MOCK_VEHICLES.find(
    (v) => v.registration === cleanRego && v.state === state
  );

  if (vehicle) {
    return { ...vehicle };
  }

  // For any valid format rego, return a generated vehicle
  if (cleanRego.length >= 5 && cleanRego.length <= 7) {
    return generateMockVehicle(cleanRego, state);
  }

  return null;
};

/**
 * Generate a mock vehicle for unknown registrations
 * Creates realistic looking data for prototype testing
 */
const generateMockVehicle = (registration: string, state: string): RegoLookupResult => {
  const makes = ['Toyota', 'Mazda', 'Ford', 'Hyundai', 'Kia', 'Honda', 'Nissan', 'Volkswagen'];
  const models: Record<string, string[]> = {
    Toyota: ['Corolla', 'Camry', 'RAV4', 'HiLux', 'Kluger'],
    Mazda: ['3', 'CX-5', 'CX-30', 'BT-50', 'MX-5'],
    Ford: ['Ranger', 'Everest', 'Mustang', 'Puma', 'Focus'],
    Hyundai: ['i30', 'Tucson', 'Santa Fe', 'Kona', 'Venue'],
    Kia: ['Cerato', 'Sportage', 'Seltos', 'Carnival', 'Stinger'],
    Honda: ['Civic', 'CR-V', 'HR-V', 'Accord', 'Jazz'],
    Nissan: ['X-Trail', 'Qashqai', 'Navara', 'Pathfinder', 'Leaf'],
    Volkswagen: ['Golf', 'Tiguan', 'Polo', 'T-Cross', 'Amarok'],
  };
  const colors = ['White', 'Silver', 'Black', 'Grey', 'Blue', 'Red'];
  const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Ute', 'Wagon'];
  const transmissions: ('automatic' | 'manual')[] = ['automatic', 'manual'];
  const fuelTypes: ('petrol' | 'diesel' | 'hybrid' | 'electric')[] = ['petrol', 'diesel', 'hybrid'];

  const make = makes[Math.floor(Math.random() * makes.length)];
  const modelList = models[make] || ['Base'];
  const model = modelList[Math.floor(Math.random() * modelList.length)];
  const year = 2018 + Math.floor(Math.random() * 6); // 2018-2023

  return {
    registration,
    state,
    make,
    model,
    variant: 'Standard',
    year,
    color: colors[Math.floor(Math.random() * colors.length)],
    bodyType: bodyTypes[Math.floor(Math.random() * bodyTypes.length)],
    transmission: transmissions[Math.floor(Math.random() * transmissions.length)],
    fuelType: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
    engineSize: ['1.8L', '2.0L', '2.5L', '3.0L'][Math.floor(Math.random() * 4)],
    vin: generateMockVIN(),
    mileage: 10000 + Math.floor(Math.random() * 150000),
    hasLogbook: Math.random() > 0.5, // 50% chance of having logbook
  };
};

/**
 * Generate a mock VIN (17 characters)
 */
const generateMockVIN = (): string => {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let vin = '';
  for (let i = 0; i < 17; i++) {
    vin += chars[Math.floor(Math.random() * chars.length)];
  }
  return vin;
};

/**
 * Mock publish listing
 *
 * Simulates publishing a vehicle listing to the marketplace.
 *
 * @param listingData - Complete listing data
 * @returns Publish result with listing ID
 */
export interface PublishListingResult {
  success: boolean;
  listingId?: string;
  message: string;
  error?: string;
}

export const publishListing = async (listingData: unknown): Promise<PublishListingResult> => {
  // Simulate network delay (2-3 seconds)
  await delay(2000 + Math.random() * 1000);

  // Mock successful publish
  return {
    success: true,
    listingId: `listing_${Date.now()}`,
    message: 'Vehicle listing published successfully',
  };
};
