/**
 * Components Index
 *
 * Central export for reusable components across the app.
 * These are higher-level components built from the design system.
 */

export { default as Header } from './Header';
export type { HeaderProps } from './Header';

export { default as DrawerMenu } from './DrawerMenu';
export type { DrawerMenuProps } from './DrawerMenu';

export { default as FilterModal } from './FilterModal';
export type { FilterModalProps, FilterOptions } from './FilterModal';
export { DEFAULT_FILTERS } from './FilterModal';

export { default as PaymentModal } from './PaymentModal';
export type { PaymentModalProps, PaymentData, VehicleInfo } from './PaymentModal';

export { default as WeeklyPurchaseProgress } from './WeeklyPurchaseProgress';
export { WeeklyPurchaseProgress as WeeklyPurchaseProgressComponent } from './WeeklyPurchaseProgress';

export { default as SearchBar } from './SearchBar';
export type { SearchBarProps } from './SearchBar';

export { default as SubscriptionCard } from './SubscriptionCard';
export type { SubscriptionCardProps, PaymentData as SubscriptionPaymentData } from './SubscriptionCard';
