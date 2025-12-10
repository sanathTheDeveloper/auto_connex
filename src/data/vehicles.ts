/**
 * Vehicle Data
 *
 * Mock vehicle data for the Auto Connex marketplace.
 * Images are loaded from assets/images/vehicles/ with transparent backgrounds.
 */

// ============================================================================
// TYPES
// ============================================================================

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
  state: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair';
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  bodyType: string;
  color: string;
  dealer: string;
  sellerType: 'Dealer' | 'Wholesaler' | 'Private';
  verified: boolean;
  featured?: boolean;
  imageKey: VehicleImageKey;
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

// Static image imports (React Native requires static requires)
export const VEHICLE_IMAGES: Record<VehicleImageKey, any> = {
  'toyota-camry': require('../../assets/images/vehicles/toyota-camry.png'),
  'honda-accord': require('../../assets/images/vehicles/honda-accord.png'),
  'mazda-cx5': require('../../assets/images/vehicles/mazda-cx5.png'),
  'ford-ranger': require('../../assets/images/vehicles/red-sports-car.png'),
  'hyundai-tucson': require('../../assets/images/vehicles/hyundai-tucson.png'),
  'tesla-model3': require('../../assets/images/vehicles/tesla-model3.png'),
  'bmw-3series': require('../../assets/images/vehicles/bmw-3series.png'),
  'mercedes-cclass': require('../../assets/images/vehicles/mercedes-cclass.png'),
  'audi-a4': require('../../assets/images/vehicles/audi-a4.png'),
  'volkswagen-golf': require('../../assets/images/vehicles/volkswagen-golf.png'),
  'porsche-911': require('../../assets/images/vehicles/porsche-911.png'),
  'lexus-rx': require('../../assets/images/vehicles/lexus-rx.png'),
  'subaru-outback': require('../../assets/images/vehicles/subaru-outback.png'),
  'kia-sportage': require('../../assets/images/vehicles/kia-sportage.png'),
  'nissan-xtrail': require('../../assets/images/vehicles/nissan-xtrail.png'),
  'jeep-wrangler': require('../../assets/images/vehicles/jeep-wrangler.png'),
  'range-rover': require('../../assets/images/vehicles/range-rover.png'),
  'mustang-gt': require('../../assets/images/vehicles/mustang-gt.png'),
  'chevrolet-camaro': require('../../assets/images/vehicles/chevrolet-camaro.png'),
  'lamborghini-huracan': require('../../assets/images/vehicles/lamborghini-huracan.png'),
};

// Fallback image
export const DEFAULT_VEHICLE_IMAGE = require('../../assets/images/vehicles/red-sports-car.png');

/**
 * Get vehicle image by key with fallback
 */
export const getVehicleImage = (imageKey: VehicleImageKey): any => {
  return VEHICLE_IMAGES[imageKey] || DEFAULT_VEHICLE_IMAGE;
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
    price: 32500,
    tradePrice: 30500,
    retailPrice: 34500,
    overTrade: 4000,
    location: 'Sydney',
    state: 'NSW',
    mileage: 15000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'hybrid',
    bodyType: 'Sedan',
    color: 'Silver',
    dealer: 'Sydney Premium Motors',
    sellerType: 'Dealer',
    verified: true,
    featured: true,
    imageKey: 'toyota-camry',
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
    state: 'VIC',
    mileage: 22000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Sedan',
    color: 'Black',
    dealer: 'Melbourne Auto Traders',
    sellerType: 'Wholesaler',
    verified: true,
    featured: false,
    imageKey: 'honda-accord',
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
    state: 'QLD',
    mileage: 8500,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'SUV',
    color: 'Soul Red',
    dealer: 'Brisbane Vehicle Solutions',
    sellerType: 'Dealer',
    verified: true,
    featured: false,
    imageKey: 'mazda-cx5',
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
    state: 'NSW',
    mileage: 35000,
    condition: 'good',
    transmission: 'automatic',
    fuelType: 'diesel',
    bodyType: 'Ute',
    color: 'White',
    dealer: 'Sydney Premium Motors',
    sellerType: 'Private',
    verified: false,
    featured: false,
    imageKey: 'ford-ranger',
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
    state: 'VIC',
    mileage: 18000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'SUV',
    color: 'Grey',
    dealer: 'Melbourne Auto Traders',
    sellerType: 'Dealer',
    verified: true,
    featured: false,
    imageKey: 'hyundai-tucson',
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
    state: 'QLD',
    mileage: 5000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'electric',
    bodyType: 'Sedan',
    color: 'Pearl White',
    dealer: 'Brisbane Vehicle Solutions',
    sellerType: 'Dealer',
    verified: true,
    featured: true,
    imageKey: 'tesla-model3',
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
    state: 'NSW',
    mileage: 25000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Sedan',
    color: 'Alpine White',
    dealer: 'Sydney Premium Motors',
    sellerType: 'Dealer',
    verified: true,
    featured: true,
    imageKey: 'bmw-3series',
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
    state: 'VIC',
    mileage: 12000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Sedan',
    color: 'Obsidian Black',
    dealer: 'Melbourne Auto Traders',
    sellerType: 'Dealer',
    verified: true,
    featured: false,
    imageKey: 'mercedes-cclass',
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
    state: 'QLD',
    mileage: 20000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Sedan',
    color: 'Glacier White',
    dealer: 'Brisbane Vehicle Solutions',
    sellerType: 'Wholesaler',
    verified: true,
    featured: false,
    imageKey: 'audi-a4',
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
    state: 'NSW',
    mileage: 8000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Hatch',
    color: 'Tornado Red',
    dealer: 'Sydney Premium Motors',
    sellerType: 'Dealer',
    verified: true,
    featured: false,
    imageKey: 'volkswagen-golf',
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
    state: 'VIC',
    mileage: 15000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Coupe',
    color: 'Guards Red',
    dealer: 'Melbourne Auto Traders',
    sellerType: 'Dealer',
    verified: true,
    featured: true,
    imageKey: 'porsche-911',
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
    state: 'QLD',
    mileage: 22000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'SUV',
    color: 'Sonic Silver',
    dealer: 'Brisbane Vehicle Solutions',
    sellerType: 'Dealer',
    verified: true,
    featured: false,
    imageKey: 'lexus-rx',
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
    state: 'NSW',
    mileage: 10000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Wagon',
    color: 'Crystal White',
    dealer: 'Sydney Premium Motors',
    sellerType: 'Dealer',
    verified: true,
    featured: false,
    imageKey: 'subaru-outback',
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
    state: 'VIC',
    mileage: 12000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'hybrid',
    bodyType: 'SUV',
    color: 'Snow White',
    dealer: 'Melbourne Auto Traders',
    sellerType: 'Dealer',
    verified: true,
    featured: false,
    imageKey: 'kia-sportage',
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
    state: 'QLD',
    mileage: 28000,
    condition: 'good',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'SUV',
    color: 'Gun Metallic',
    dealer: 'Brisbane Vehicle Solutions',
    sellerType: 'Wholesaler',
    verified: true,
    featured: false,
    imageKey: 'nissan-xtrail',
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
    state: 'NSW',
    mileage: 18000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: '4WD',
    color: 'Sarge Green',
    dealer: 'Sydney Premium Motors',
    sellerType: 'Dealer',
    verified: true,
    featured: true,
    imageKey: 'jeep-wrangler',
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
    state: 'VIC',
    mileage: 8000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'diesel',
    bodyType: 'SUV',
    color: 'Santorini Black',
    dealer: 'Melbourne Auto Traders',
    sellerType: 'Dealer',
    verified: true,
    featured: true,
    imageKey: 'range-rover',
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
    state: 'QLD',
    mileage: 15000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Coupe',
    color: 'Race Red',
    dealer: 'Brisbane Vehicle Solutions',
    sellerType: 'Dealer',
    verified: true,
    featured: true,
    imageKey: 'mustang-gt',
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
    state: 'NSW',
    mileage: 20000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Coupe',
    color: 'Bright Yellow',
    dealer: 'Sydney Premium Motors',
    sellerType: 'Private',
    verified: false,
    featured: false,
    imageKey: 'chevrolet-camaro',
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
    state: 'VIC',
    mileage: 5000,
    condition: 'excellent',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Supercar',
    color: 'Arancio Borealis',
    dealer: 'Melbourne Auto Traders',
    sellerType: 'Dealer',
    verified: true,
    featured: true,
    imageKey: 'lamborghini-huracan',
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
 * Format mileage (e.g., 15k km)
 */
export const formatMileage = (mileage: number): string => {
  return `${(mileage / 1000).toFixed(0)}k km`;
};
