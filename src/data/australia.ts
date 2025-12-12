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
 * License types for dealer registration
 */
export const LICENSE_TYPES: SelectOption[] = [
  { label: 'Motor Dealer', value: 'dealer' },
  { label: 'Wholesaler', value: 'wholesaler' },
  { label: 'Auto Dismantler', value: 'wrecker' },
];
