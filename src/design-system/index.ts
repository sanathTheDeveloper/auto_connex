/**
 * Auto Connex Design System
 * 
 * Reusable component library following Atomic Design methodology.
 * All components are brand-compliant with Figma guidelines.
 * 
 * @example
 * // Import primitives
 * import { Colors, Typography, Spacing } from '@/design-system/primitives';
 * 
 * // Import components
 * import { Text, Button, Card } from '@/design-system';
 * 
 * // Use in your screens
 * <Card variant="elevated">
 *   <Text variant="h1">AutoConnex</Text>
 *   <Text variant="body">Trusted Deals Faster</Text>
 *   <Button variant="primary">View Inventory</Button>
 * </Card>
 */

// ============ Primitives ============
export {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  IconSizes,
  ImageSizes,
  Opacity,
  ZIndex,
  Layout,
  responsive,
} from './primitives';

// ============ Atoms ============
export { Text } from './atoms/Text';
export type { TextComponentProps } from './atoms/Text';

export { Button } from './atoms/Button';
export type { ButtonProps } from './atoms/Button';

export { PillButton } from './atoms/PillButton';
export type { PillButtonProps } from './atoms/PillButton';

export { Icon } from './atoms/Icon';
export type { IconProps } from './atoms/Icon';

export { Spacer } from './atoms/Spacer';
export type { SpacerProps } from './atoms/Spacer';

export { Divider } from './atoms/Divider';
export type { DividerProps } from './atoms/Divider';

// ============ Molecules ============
export { Card } from './molecules/Card';
export type { CardProps } from './molecules/Card';

export { Input } from './molecules/Input';
export type { InputProps } from './molecules/Input';

export { Select } from './molecules/Select';
export type { SelectProps, SelectOption } from './molecules/Select';

export { Badge } from './molecules/Badge';
export type { BadgeProps } from './molecules/Badge';

export { Avatar } from './molecules/Avatar';
export type { AvatarProps } from './molecules/Avatar';

export { Modal } from './molecules/Modal';
export type { ModalProps, ModalVariant } from './molecules/Modal';

export { VerificationBadge } from './molecules/VerificationBadge';
export type { VerificationBadgeProps } from './molecules/VerificationBadge';

// ============ Auth Molecules ============
export {
  PhoneInput,
  EmailInput,
  PasswordInput,
  ABNInput,
  LicenseInput,
  validateAustralianPhone,
  validateEmail,
  validatePassword,
  validateABN,
  validateLicense,
  getPasswordStrength,
  formatABNForDisplay,
} from './molecules/auth';
export type {
  PhoneInputProps,
  EmailInputProps,
  PasswordInputProps,
  ABNInputProps,
  LicenseInputProps,
} from './molecules/auth';

// ============ Organisms ============
export { OnboardingSlide } from './organisms/OnboardingSlide';
export type { OnboardingSlideProps } from './organisms/OnboardingSlide';

export { OnboardingPagination } from './organisms/OnboardingPagination';
export type { OnboardingPaginationProps } from './organisms/OnboardingPagination';

export { OnboardingActions } from './organisms/OnboardingActions';
export type { OnboardingActionsProps } from './organisms/OnboardingActions';

/**
 * Design System Documentation
 * 
 * ## Color System (from Figma brand_Identity Main)
 * - Primary: #0ABAB5 (teal) - Main brand color
 * - Secondary: #008985 (dark teal) - Secondary actions
 * - Accent: #FF3864 (pink) - CTAs, emphasis
 * - Success: #08605D - Positive states
 * - Warning: #FF9500 - Caution states
 * - Error: #FF3864 - Negative states
 * - Info: #1AC8FC - Informational states
 * 
 * ## Typography (Google Fonts)
 * - Volkhov: Data-heavy content, dashboards, headers
 * - Vesper Libre: Listings, transactions, body text
 * 
 * ## Component Variants
 * 
 * ### Text
 * - display: 73px Volkhov Bold (logos, hero)
 * - h1: 48px Volkhov Bold (page titles)
 * - h2: 40px Volkhov Bold (section headers)
 * - h3: 35px Vesper Libre (subsections)
 * - h4: 29px Vesper Libre (small headers)
 * - body: 24px Vesper Libre (default text)
 * - caption: 16px Vesper Libre (metadata)
 * - label: 14px Vesper Libre Medium (form labels)
 * 
 * ### Button
 * - primary: Teal #0ABAB5 (main actions)
 * - secondary: Dark teal #008985 (secondary actions)
 * - accent: Pink #FF3864 (CTAs)
 * - outline: Bordered transparent
 * - ghost: Text-only
 * 
 * ### Card
 * - flat: No elevation
 * - elevated: Shadow for depth
 * - outlined: Border without shadow
 * 
 * ### Badge
 * - success: Dark teal #08605D
 * - warning: Orange #FF9500
 * - error: Pink #FF3864
 * - info: Cyan #1AC8FC
 * 
 * ## Spacing Scale (8pt grid)
 * - xs: 4px
 * - sm: 8px
 * - md: 16px
 * - lg: 24px
 * - xl: 32px
 * - 2xl: 48px
 * - 3xl: 64px
 * 
 * ## Icon Sizes
 * - xs: 16px
 * - sm: 20px
 * - md: 24px (default)
 * - lg: 32px
 * - xl: 48px
 */
