/**
 * Australian States and License Types
 *
 * Centralized data for Australian states/territories and dealer license types.
 * Used across signup, registration, and profile screens.
 */

import { SelectOption } from '../design-system/molecules/Select';

/**
 * Australian states/territories (short form)
 */
export const AUSTRALIAN_STATES: SelectOption[] = [
  { label: 'NSW', value: 'NSW' },
  { label: 'VIC', value: 'VIC' },
  { label: 'QLD', value: 'QLD' },
  { label: 'WA', value: 'WA' },
  { label: 'SA', value: 'SA' },
  { label: 'TAS', value: 'TAS' },
  { label: 'ACT', value: 'ACT' },
  { label: 'NT', value: 'NT' },
];

/**
 * License types for dealer registration (generic)
 */
export const LICENSE_TYPES: SelectOption[] = [
  { label: 'Motor Dealer', value: 'dealer' },
  { label: 'Wholesaler', value: 'wholesaler' },
  { label: 'Auto Dismantler', value: 'wrecker' },
];

/**
 * State-specific license types
 * Each state has different licensing authorities and license naming conventions
 */
export const STATE_LICENSE_TYPES: Record<string, SelectOption[]> = {
  NSW: [
    { label: 'Motor Dealer (MD)', value: 'MD' },
    { label: 'Motor Vehicle Repairer (MVR)', value: 'MVR' },
    { label: 'Auto Dismantler', value: 'AD' },
  ],
  VIC: [
    { label: 'Licensed Motor Car Trader (LMCT)', value: 'LMCT' },
    { label: 'Car Market Operator', value: 'CMO' },
    { label: 'Auto Dismantler', value: 'AD' },
  ],
  QLD: [
    { label: 'Motor Dealer (MD)', value: 'MD' },
    { label: 'Wholesale Dealer', value: 'WD' },
    { label: 'Auto Recycler', value: 'AR' },
  ],
  WA: [
    { label: 'Motor Vehicle Dealer (MVD)', value: 'MVD' },
    { label: 'Yard Manager', value: 'YM' },
    { label: 'Salesperson', value: 'SP' },
  ],
  SA: [
    { label: 'Second Hand Vehicle Dealer', value: 'SHVD' },
    { label: 'Motor Vehicle Trader', value: 'MVT' },
    { label: 'Auto Dismantler', value: 'AD' },
  ],
  TAS: [
    { label: 'Motor Vehicle Trader (MVT)', value: 'MVT' },
    { label: 'Auto Dismantler', value: 'AD' },
  ],
  ACT: [
    { label: 'Motor Vehicle Dealer', value: 'MVD' },
    { label: 'Auto Dismantler', value: 'AD' },
  ],
  NT: [
    { label: 'Motor Vehicle Dealer', value: 'MVD' },
    { label: 'Second Hand Dealer', value: 'SHD' },
  ],
};

/**
 * Get license types for a specific state
 */
export const getLicenseTypesForState = (state: string): SelectOption[] => {
  return STATE_LICENSE_TYPES[state] || LICENSE_TYPES;
};
