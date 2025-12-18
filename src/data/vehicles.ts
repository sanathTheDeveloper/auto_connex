/**
 * Vehicle Data
 *
 * Mock vehicle data for the Auto Connex marketplace.
 * Images are loaded from assets/images/vehiclesWithBackground/ with real backgrounds.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PPSRDetails {
  status: 'clear' | 'encumbered' | 'stolen' | 'written-off';
  checkDate: string;
  certificateNumber?: string;
  details: {
    moneyOwing: boolean;
    stolen: boolean;
    writtenOff: boolean;
    validRegistration: boolean;
  };
}

export interface ConditionReport {
  pros: string[];
  cons: string[];
}

export interface AfterMarketExtra {
  name: string;
  cost: number;
  category?: 'Electronics' | 'Comfort' | 'Safety' | 'Exterior' | 'Performance';
}

export interface SellerDetails {
  abn?: string;
  memberSince?: string;
  rating?: number;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  age: number;
  price: number;
  tradePrice: number;
  retailPrice: number;
  overTrade: number;
  location: string;
  suburb: string;
  state: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair';
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  bodyType: string;
  color: string;
  dealer: string;
  dealerName: string;
  sellerType: 'Dealer' | 'Wholesaler' | 'Private';
  verified: boolean;
  hasLogbook: boolean;
  featured?: boolean;
  imageKey: VehicleImageKey;
  backgroundImageIndex: number;

  // NEW FIELDS for wholesaler upload features
  images?: VehicleImageKey[];
  registration?: string;
  askingPrice?: number;
  ppsr?: PPSRDetails;
  conditionReport?: ConditionReport;
  afterMarketExtras?: string[]; // Legacy - kept for backwards compatibility
  afterMarketExtrasDetailed?: AfterMarketExtra[];
  sellerDetails?: SellerDetails;
}

// ============================================================================
// IMAGE MAPPING
// ============================================================================

// Available vehicle image keys (matching files in assets/images/vehicles/)
export type VehicleImageKey =
  | 'toyota-camry'
  | 'honda-accord'
  | 'mazda-cx5'
  | 'ford-ranger'
  | 'hyundai-tucson'
  | 'tesla-model3'
  | 'bmw-3series'
  | 'mercedes-cclass'
  | 'audi-a4'
  | 'volkswagen-golf'
  | 'porsche-911'
  | 'lexus-rx'
  | 'subaru-outback'
  | 'kia-sportage'
  | 'nissan-xtrail'
  | 'jeep-wrangler'
  | 'range-rover'
  | 'mustang-gt'
  | 'chevrolet-camaro'
  | 'lamborghini-huracan';

// Static image imports - mapped to background images by index
// Each vehicle uses its backgroundImageIndex to get the corresponding image
export const VEHICLE_IMAGES: Record<VehicleImageKey, any> = {
  'toyota-camry': require('../../assets/images/vehiclesWithBackground/car_01.jpg'),
  'honda-accord': require('../../assets/images/vehiclesWithBackground/car_02.jpg'),
  'mazda-cx5': require('../../assets/images/vehiclesWithBackground/car_03.jpg'),
  'ford-ranger': require('../../assets/images/vehiclesWithBackground/car_04.jpg'),
  'hyundai-tucson': require('../../assets/images/vehiclesWithBackground/car_05.jpg'),
  'tesla-model3': require('../../assets/images/vehiclesWithBackground/car_06.jpg'),
  'bmw-3series': require('../../assets/images/vehiclesWithBackground/car_07.jpg'),
  'mercedes-cclass': require('../../assets/images/vehiclesWithBackground/car_08.jpg'),
  'audi-a4': require('../../assets/images/vehiclesWithBackground/car_09.jpg'),
  'volkswagen-golf': require('../../assets/images/vehiclesWithBackground/car_10.jpg'),
  'porsche-911': require('../../assets/images/vehiclesWithBackground/car_11.jpg'),
  'lexus-rx': require('../../assets/images/vehiclesWithBackground/car_12.jpg'),
  'subaru-outback': require('../../assets/images/vehiclesWithBackground/car_13.jpg'),
  'kia-sportage': require('../../assets/images/vehiclesWithBackground/car_14.jpg'),
  'nissan-xtrail': require('../../assets/images/vehiclesWithBackground/car_15.jpg'),
  'jeep-wrangler': require('../../assets/images/vehiclesWithBackground/car_16.jpg'),
  'range-rover': require('../../assets/images/vehiclesWithBackground/car_17.jpg'),
  'mustang-gt': require('../../assets/images/vehiclesWithBackground/car_18.jpg'),
  'chevrolet-camaro': require('../../assets/images/vehiclesWithBackground/car_19.jpg'),
  'lamborghini-huracan': require('../../assets/images/vehiclesWithBackground/car_20.jpg'),
};

// Fallback image
export const DEFAULT_VEHICLE_IMAGE = require('../../assets/images/vehiclesWithBackground/car_01.jpg');

/**
 * Get vehicle image by key with fallback
 */
export const getVehicleImage = (imageKey: VehicleImageKey): any => {
  return VEHICLE_IMAGES[imageKey] || DEFAULT_VEHICLE_IMAGE;
};

// ============================================================================
// BACKGROUND IMAGES (with real backgrounds from vehiclesWithBackground)
// ============================================================================

export const VEHICLE_BACKGROUND_IMAGES: Record<number, any> = {
  1: require('../../assets/images/vehiclesWithBackground/car_01.jpg'),
  2: require('../../assets/images/vehiclesWithBackground/car_02.jpg'),
  3: require('../../assets/images/vehiclesWithBackground/car_03.jpg'),
  4: require('../../assets/images/vehiclesWithBackground/car_04.jpg'),
  5: require('../../assets/images/vehiclesWithBackground/car_05.jpg'),
  6: require('../../assets/images/vehiclesWithBackground/car_06.jpg'),
  7: require('../../assets/images/vehiclesWithBackground/car_07.jpg'),
  8: require('../../assets/images/vehiclesWithBackground/car_08.jpg'),
  9: require('../../assets/images/vehiclesWithBackground/car_09.jpg'),
  10: require('../../assets/images/vehiclesWithBackground/car_10.jpg'),
  11: require('../../assets/images/vehiclesWithBackground/car_11.jpg'),
  12: require('../../assets/images/vehiclesWithBackground/car_12.jpg'),
  13: require('../../assets/images/vehiclesWithBackground/car_13.jpg'),
  14: require('../../assets/images/vehiclesWithBackground/car_14.jpg'),
  15: require('../../assets/images/vehiclesWithBackground/car_15.jpg'),
  16: require('../../assets/images/vehiclesWithBackground/car_16.jpg'),
  17: require('../../assets/images/vehiclesWithBackground/car_17.jpg'),
  18: require('../../assets/images/vehiclesWithBackground/car_18.jpg'),
  19: require('../../assets/images/vehiclesWithBackground/car_19.jpg'),
  20: require('../../assets/images/vehiclesWithBackground/car_20.jpg'),
};

/**
 * Get vehicle background image by index (1-20)
 */
export const getVehicleBackgroundImage = (index: number): any => {
  return VEHICLE_BACKGROUND_IMAGES[index] || VEHICLE_BACKGROUND_IMAGES[1];
};

// ============================================================================
// DEALER NAMES (Gaming-style usernames for dealers/wholesalers)
// ============================================================================

export const DEALER_NAMES = [
  'AutoKing_99',
  'WheelDealer_X',
  'CarPro_Elite',
  'MotorMaverick',
  'DriveMaster_AU',
  'SpeedTrader_77',
  'VehicleVault',
  'GearHead_Pro',
  'TurboTrader_X',
  'AutoNinja_88',
  'CarBoss_VIP',
  'WheelWizard',
  'MotorMax_AU',
  'DriveForce_X',
  'AutoAce_Elite',
  'SpeedKing_Pro',
  'CarMaster_99',
  'WheelPro_VIP',
  'MotorTrade_X',
  'GearPro_Elite',
];

/**
 * Get dealer name by index
 */
export const getDealerName = (index: number): string => {
  return DEALER_NAMES[index % DEALER_NAMES.length];
};

// ============================================================================
// AUSTRALIAN SUBURBS BY STATE
// ============================================================================

export const SUBURBS_BY_STATE: Record<string, string[]> = {
  NSW: ['Parramatta', 'Chatswood', 'Liverpool', 'Penrith', 'Blacktown', 'Hornsby', 'Sutherland', 'Bondi', 'Manly', 'Bankstown'],
  VIC: ['Richmond', 'Footscray', 'St Kilda', 'Brunswick', 'Dandenong', 'Frankston', 'Box Hill', 'Werribee', 'Geelong', 'Ballarat'],
  QLD: ['Fortitude Valley', 'Southbank', 'Toowoomba', 'Cairns', 'Gold Coast', 'Sunshine Coast', 'Ipswich', 'Redcliffe', 'Logan', 'Caboolture'],
  WA: ['Fremantle', 'Subiaco', 'Joondalup', 'Rockingham', 'Mandurah', 'Bunbury', 'Armadale', 'Midland', 'Scarborough', 'Victoria Park'],
  SA: ['Glenelg', 'Norwood', 'Prospect', 'Unley', 'Marion', 'Port Adelaide', 'Salisbury', 'Elizabeth', 'Murray Bridge', 'Mount Gambier'],
  TAS: ['Hobart CBD', 'Sandy Bay', 'Glenorchy', 'Kingston', 'Launceston', 'Devonport', 'Burnie', 'New Norfolk', 'Sorell', 'Bridgewater'],
  ACT: ['Civic', 'Belconnen', 'Woden', 'Tuggeranong', 'Gungahlin', 'Kingston', 'Braddon', 'Dickson', 'Fyshwick', 'Mitchell'],
  NT: ['Darwin CBD', 'Palmerston', 'Casuarina', 'Alice Springs', 'Katherine', 'Winnellie', 'Stuart Park', 'Fannie Bay', 'Nightcliff', 'Parap'],
};

/**
 * Get random suburb for a state
 */
export const getSuburbForState = (state: string, index: number): string => {
  const suburbs = SUBURBS_BY_STATE[state] || SUBURBS_BY_STATE['NSW'];
  return suburbs[index % suburbs.length];
};

// ============================================================================
// MOCK VEHICLE DATA
// ============================================================================

export const VEHICLES: Vehicle[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    variant: 'Ascent Sport',
    year: 2023,
    age: 1,
    price: 37300,
    tradePrice: 30500,
    retailPrice: 39500,
    overTrade: 9000,
    location: 'Sydney',
    suburb: 'Parramatta',
    state: 'NSW',
    mileage: 15000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'hybrid',
    bodyType: 'Sedan',
    color: 'Silver',
    dealer: 'Sydney Premium Motors',
    dealerName: 'AutoKing_99',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: true,
    featured: true,
    imageKey: 'toyota-camry',
    backgroundImageIndex: 1,
    images: [
      'toyota-camry',
      'honda-accord',
      'mazda-cx5',
      'ford-ranger',
      'hyundai-tucson',
      'tesla-model3',
      'bmw-3series',
      'mercedes-cclass',
      'audi-a4',
      'volkswagen-golf',
      'porsche-911',
      'lexus-rx',
      'subaru-outback',
      'kia-sportage',
      'nissan-xtrail',
      'jeep-wrangler',
      'range-rover',
      'mustang-gt',
      'chevrolet-camaro',
      'lamborghini-huracan',
    ],
    registration: 'ABC-123',
    askingPrice: 37300, // Trade price ($30,500) + Extras ($6,800) = $37,300
    ppsr: {
      status: 'clear',
      checkDate: '2025-12-10',
      certificateNumber: '123456789',
      details: {
        moneyOwing: false,
        stolen: false,
        writtenOff: false,
        validRegistration: true,
      },
    },
    conditionReport: {
      pros: [
        'Excellent service history',
        'Single owner vehicle',
        'Low mileage for age',
        'Recently serviced at authorized dealer',
        'All maintenance records available',
      ],
      cons: [
        'Minor paint chip on front bonnet',
        'Driver seat shows light wear',
      ],
    },
    afterMarketExtras: ['GPS Navigation', 'Reverse Camera', 'Leather Seats', 'Sunroof', 'Tow Bar'],
    afterMarketExtrasDetailed: [
      { name: 'GPS Navigation', cost: 1200, category: 'Electronics' },
      { name: 'Reverse Camera', cost: 450, category: 'Safety' },
      { name: 'Leather Seats', cost: 2800, category: 'Comfort' },
      { name: 'Sunroof', cost: 1500, category: 'Comfort' },
      { name: 'Tow Bar', cost: 850, category: 'Exterior' },
    ],
    sellerDetails: {
      abn: '12 345 678 901',
      memberSince: '2019',
      rating: 4.8,
    },
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Accord',
    variant: 'VTi-LX',
    year: 2022,
    age: 2,
    price: 28900,
    tradePrice: 27200,
    retailPrice: 31500,
    overTrade: 4300,
    location: 'Melbourne',
    suburb: 'Richmond',
    state: 'VIC',
    mileage: 22000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Sedan',
    color: 'Black',
    dealer: 'Melbourne Auto Traders',
    dealerName: 'WheelDealer_X',
    sellerType: 'Wholesaler',
    verified: true,
    hasLogbook: false,
    featured: false,
    imageKey: 'honda-accord',
    backgroundImageIndex: 2,
    images: ['honda-accord', 'toyota-camry', 'bmw-3series'],
    registration: 'XYZ-789',
    askingPrice: 28900,
    ppsr: {
      status: 'clear',
      checkDate: '2025-12-08',
      certificateNumber: '987654321',
      details: {
        moneyOwing: false,
        stolen: false,
        writtenOff: false,
        validRegistration: true,
      },
    },
    conditionReport: {
      pros: [
        'Full logbook service history',
        'Non-smoking vehicle',
        'Premium sound system',
        'Recent brake service',
      ],
      cons: [
        'Minor stone chips on windscreen',
        'Light scratches on rear bumper',
      ],
    },
    afterMarketExtras: ['Apple CarPlay', 'Blind Spot Monitoring', 'Heated Seats'],
    afterMarketExtrasDetailed: [
      { name: 'Apple CarPlay', cost: 650, category: 'Electronics' },
      { name: 'Blind Spot Monitoring', cost: 1100, category: 'Safety' },
      { name: 'Heated Seats', cost: 950, category: 'Comfort' },
    ],
    sellerDetails: {
      abn: '98 765 432 109',
      memberSince: '2020',
      rating: 4.6,
    },
  },
  {
    id: '3',
    make: 'Mazda',
    model: 'CX-5',
    variant: 'GT',
    year: 2023,
    age: 1,
    price: 38000,
    tradePrice: 36200,
    retailPrice: 40800,
    overTrade: 4600,
    location: 'Brisbane',
    suburb: 'Fortitude Valley',
    state: 'QLD',
    mileage: 8500,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'SUV',
    color: 'Soul Red',
    dealer: 'Brisbane Vehicle Solutions',
    dealerName: 'CarPro_Elite',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: true,
    featured: false,
    imageKey: 'mazda-cx5',
    backgroundImageIndex: 3,
  },
  {
    id: '4',
    make: 'Ford',
    model: 'Ranger',
    variant: 'Wildtrak',
    year: 2021,
    age: 3,
    price: 42000,
    tradePrice: 39500,
    retailPrice: 45000,
    overTrade: 5500,
    location: 'Sydney',
    suburb: 'Chatswood',
    state: 'NSW',
    mileage: 35000,
    condition: 'good',
    transmission: 'automatic',
    fuelType: 'diesel',
    bodyType: 'Ute',
    color: 'White',
    dealer: 'Sydney Premium Motors',
    dealerName: 'MotorMaverick',
    sellerType: 'Private',
    verified: false,
    hasLogbook: false,
    featured: false,
    imageKey: 'ford-ranger',
    backgroundImageIndex: 4,
  },
  {
    id: '5',
    make: 'Hyundai',
    model: 'Tucson',
    variant: 'Elite',
    year: 2022,
    age: 2,
    price: 31500,
    tradePrice: 29800,
    retailPrice: 34200,
    overTrade: 4400,
    location: 'Melbourne',
    suburb: 'Footscray',
    state: 'VIC',
    mileage: 18000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'SUV',
    color: 'Grey',
    dealer: 'Melbourne Auto Traders',
    dealerName: 'DriveMaster_AU',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: true,
    featured: false,
    imageKey: 'hyundai-tucson',
    backgroundImageIndex: 5,
  },
  {
    id: '6',
    make: 'Tesla',
    model: 'Model 3',
    variant: 'Long Range',
    year: 2023,
    age: 1,
    price: 65000,
    tradePrice: 62000,
    retailPrice: 70000,
    overTrade: 8000,
    location: 'Brisbane',
    suburb: 'Southbank',
    state: 'QLD',
    mileage: 5000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'electric',
    bodyType: 'Sedan',
    color: 'Pearl White',
    dealer: 'Brisbane Vehicle Solutions',
    dealerName: 'SpeedTrader_77',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: false,
    featured: true,
    imageKey: 'tesla-model3',
    backgroundImageIndex: 6,
  },
  {
    id: '7',
    make: 'BMW',
    model: '3 Series',
    variant: '330i M Sport',
    year: 2022,
    age: 2,
    price: 58000,
    tradePrice: 54500,
    retailPrice: 62000,
    overTrade: 7500,
    location: 'Sydney',
    suburb: 'Liverpool',
    state: 'NSW',
    mileage: 25000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Sedan',
    color: 'Alpine White',
    dealer: 'Sydney Premium Motors',
    dealerName: 'VehicleVault',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: true,
    featured: true,
    imageKey: 'bmw-3series',
    backgroundImageIndex: 7,
  },
  {
    id: '8',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    variant: 'C300',
    year: 2023,
    age: 1,
    price: 72000,
    tradePrice: 68000,
    retailPrice: 78000,
    overTrade: 10000,
    location: 'Melbourne',
    suburb: 'St Kilda',
    state: 'VIC',
    mileage: 12000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Sedan',
    color: 'Obsidian Black',
    dealer: 'Melbourne Auto Traders',
    dealerName: 'GearHead_Pro',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: false,
    featured: false,
    imageKey: 'mercedes-cclass',
    backgroundImageIndex: 8,
  },
  {
    id: '9',
    make: 'Audi',
    model: 'A4',
    variant: '45 TFSI Quattro',
    year: 2022,
    age: 2,
    price: 55000,
    tradePrice: 51500,
    retailPrice: 59000,
    overTrade: 7500,
    location: 'Brisbane',
    suburb: 'Toowoomba',
    state: 'QLD',
    mileage: 20000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Sedan',
    color: 'Glacier White',
    dealer: 'Brisbane Vehicle Solutions',
    dealerName: 'TurboTrader_X',
    sellerType: 'Wholesaler',
    verified: true,
    hasLogbook: true,
    featured: false,
    imageKey: 'audi-a4',
    backgroundImageIndex: 9,
  },
  {
    id: '10',
    make: 'Volkswagen',
    model: 'Golf',
    variant: 'GTI',
    year: 2023,
    age: 1,
    price: 52000,
    tradePrice: 48500,
    retailPrice: 56000,
    overTrade: 7500,
    location: 'Sydney',
    suburb: 'Penrith',
    state: 'NSW',
    mileage: 8000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Hatch',
    color: 'Tornado Red',
    dealer: 'Sydney Premium Motors',
    dealerName: 'AutoNinja_88',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: false,
    featured: false,
    imageKey: 'volkswagen-golf',
    backgroundImageIndex: 10,
  },
  {
    id: '11',
    make: 'Porsche',
    model: '911',
    variant: 'Carrera',
    year: 2021,
    age: 3,
    price: 185000,
    tradePrice: 175000,
    retailPrice: 198000,
    overTrade: 23000,
    location: 'Melbourne',
    suburb: 'Brunswick',
    state: 'VIC',
    mileage: 15000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Coupe',
    color: 'Guards Red',
    dealer: 'Melbourne Auto Traders',
    dealerName: 'CarBoss_VIP',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: true,
    featured: true,
    imageKey: 'porsche-911',
    backgroundImageIndex: 11,
  },
  {
    id: '12',
    make: 'Lexus',
    model: 'RX',
    variant: '350 F Sport',
    year: 2022,
    age: 2,
    price: 78000,
    tradePrice: 73000,
    retailPrice: 85000,
    overTrade: 12000,
    location: 'Brisbane',
    suburb: 'Cairns',
    state: 'QLD',
    mileage: 22000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'SUV',
    color: 'Sonic Silver',
    dealer: 'Brisbane Vehicle Solutions',
    dealerName: 'WheelWizard',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: false,
    featured: false,
    imageKey: 'lexus-rx',
    backgroundImageIndex: 12,
  },
  {
    id: '13',
    make: 'Subaru',
    model: 'Outback',
    variant: 'AWD Premium',
    year: 2023,
    age: 1,
    price: 48000,
    tradePrice: 44500,
    retailPrice: 52000,
    overTrade: 7500,
    location: 'Sydney',
    suburb: 'Blacktown',
    state: 'NSW',
    mileage: 10000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Wagon',
    color: 'Crystal White',
    dealer: 'Sydney Premium Motors',
    dealerName: 'MotorMax_AU',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: true,
    featured: false,
    imageKey: 'subaru-outback',
    backgroundImageIndex: 13,
  },
  {
    id: '14',
    make: 'Kia',
    model: 'Sportage',
    variant: 'GT-Line',
    year: 2023,
    age: 1,
    price: 45000,
    tradePrice: 41500,
    retailPrice: 49000,
    overTrade: 7500,
    location: 'Melbourne',
    suburb: 'Dandenong',
    state: 'VIC',
    mileage: 12000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'hybrid',
    bodyType: 'SUV',
    color: 'Snow White',
    dealer: 'Melbourne Auto Traders',
    dealerName: 'DriveForce_X',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: false,
    featured: false,
    imageKey: 'kia-sportage',
    backgroundImageIndex: 14,
  },
  {
    id: '15',
    make: 'Nissan',
    model: 'X-Trail',
    variant: 'Ti',
    year: 2022,
    age: 2,
    price: 42000,
    tradePrice: 38500,
    retailPrice: 46000,
    overTrade: 7500,
    location: 'Brisbane',
    suburb: 'Gold Coast',
    state: 'QLD',
    mileage: 28000,
    condition: 'good',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'SUV',
    color: 'Gun Metallic',
    dealer: 'Brisbane Vehicle Solutions',
    dealerName: 'AutoAce_Elite',
    sellerType: 'Wholesaler',
    verified: true,
    hasLogbook: true,
    featured: false,
    imageKey: 'nissan-xtrail',
    backgroundImageIndex: 15,
  },
  {
    id: '16',
    make: 'Jeep',
    model: 'Wrangler',
    variant: 'Rubicon',
    year: 2022,
    age: 2,
    price: 75000,
    tradePrice: 70000,
    retailPrice: 82000,
    overTrade: 12000,
    location: 'Sydney',
    suburb: 'Hornsby',
    state: 'NSW',
    mileage: 18000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: '4WD',
    color: 'Sarge Green',
    dealer: 'Sydney Premium Motors',
    dealerName: 'SpeedKing_Pro',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: false,
    featured: true,
    imageKey: 'jeep-wrangler',
    backgroundImageIndex: 16,
  },
  {
    id: '17',
    make: 'Land Rover',
    model: 'Range Rover',
    variant: 'Sport HSE',
    year: 2023,
    age: 1,
    price: 145000,
    tradePrice: 138000,
    retailPrice: 158000,
    overTrade: 20000,
    location: 'Melbourne',
    suburb: 'Frankston',
    state: 'VIC',
    mileage: 8000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'diesel',
    bodyType: 'SUV',
    color: 'Santorini Black',
    dealer: 'Melbourne Auto Traders',
    dealerName: 'CarMaster_99',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: true,
    featured: true,
    imageKey: 'range-rover',
    backgroundImageIndex: 17,
  },
  {
    id: '18',
    make: 'Ford',
    model: 'Mustang',
    variant: 'GT 5.0 V8',
    year: 2022,
    age: 2,
    price: 68000,
    tradePrice: 63000,
    retailPrice: 75000,
    overTrade: 12000,
    location: 'Brisbane',
    suburb: 'Sunshine Coast',
    state: 'QLD',
    mileage: 15000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Coupe',
    color: 'Race Red',
    dealer: 'Brisbane Vehicle Solutions',
    dealerName: 'WheelPro_VIP',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: false,
    featured: true,
    imageKey: 'mustang-gt',
    backgroundImageIndex: 18,
  },
  {
    id: '19',
    make: 'Chevrolet',
    model: 'Camaro',
    variant: 'SS',
    year: 2021,
    age: 3,
    price: 72000,
    tradePrice: 66000,
    retailPrice: 79000,
    overTrade: 13000,
    location: 'Sydney',
    suburb: 'Sutherland',
    state: 'NSW',
    mileage: 20000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Coupe',
    color: 'Bright Yellow',
    dealer: 'Sydney Premium Motors',
    dealerName: 'MotorTrade_X',
    sellerType: 'Private',
    verified: false,
    hasLogbook: true,
    featured: false,
    imageKey: 'chevrolet-camaro',
    backgroundImageIndex: 19,
  },
  {
    id: '20',
    make: 'Lamborghini',
    model: 'Huracan',
    variant: 'EVO',
    year: 2022,
    age: 2,
    price: 420000,
    tradePrice: 395000,
    retailPrice: 450000,
    overTrade: 55000,
    location: 'Melbourne',
    suburb: 'Box Hill',
    state: 'VIC',
    mileage: 5000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Supercar',
    color: 'Arancio Borealis',
    dealer: 'Melbourne Auto Traders',
    dealerName: 'GearPro_Elite',
    sellerType: 'Dealer',
    verified: true,
    hasLogbook: true,
    featured: true,
    imageKey: 'lamborghini-huracan',
    backgroundImageIndex: 20,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format price to compact form (e.g., $30.5k)
 */
export const formatCompactPrice = (price: number): string => {
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${price}`;
};

/**
 * Format price with full number (e.g., $30,500)
 */
export const formatFullPrice = (price: number): string => {
  return `$${price.toLocaleString('en-AU')}`;
};

/**
 * Format mileage with full number (e.g., 15,000 km)
 */
export const formatMileage = (mileage: number): string => {
  return `${mileage.toLocaleString('en-AU')} km`;
};
