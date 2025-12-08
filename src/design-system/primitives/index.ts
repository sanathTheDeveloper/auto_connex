/**
 * Design System Primitives
 * 
 * Central export for all design tokens from theme.ts.
 * Use these primitives throughout the design system components.
 * 
 * @example
 * import { Colors, Typography, Spacing } from '@/design-system/primitives';
 */

export {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  IconSizes,
  Layout,
  responsive,
} from '../../constants/theme';

/**
 * Image size presets for consistent asset scaling
 * Based on common image dimensions in the app
 */
export const ImageSizes = {
  thumbnail: { width: 60, height: 60 },
  small: { width: 120, height: 120 },
  medium: { width: 240, height: 240 },
  large: { width: 360, height: 360 },
  cover: { width: '100%', height: 200 },
  hero: { width: '100%', height: 400 },
};

/**
 * Common opacity values for consistency
 */
export const Opacity = {
  disabled: 0.4,
  hover: 0.8,
  overlay: 0.5,
  subtle: 0.6,
};

/**
 * Z-index levels for layering
 */
export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1300,
  popover: 1400,
  toast: 1500,
};
