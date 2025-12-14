/**
 * Auto Connex Design System
 * Extracted from Figma brand guidelines
 * Fonts: Google Fonts (Volkhov, Vesper Libre)
 */

import { Platform, Dimensions } from 'react-native';

export const Colors = {
  // Brand colors (Auto Connex) - From Figma brand_Identity Main
  primary: '#0ABAB5',        // Primary teal - official brand color (fill_NI9CDF)
  secondary: '#008985',      // Secondary dark teal 
  accent: '#FF3864',         // Accent pink/coral for CTAs
  
  // Neutral palette
  background: '#FFFFFF',     // Main background
  backgroundAlt: '#F5F1E3',  // Alternative background (beige/cream from Figma)
  surface: '#F2F2F7',        // Card/surface background
  
  // Text colors
  text: '#000000',           // Primary text (pure black for maximum readability)
  textSecondary: '#374151',  // Secondary text (darker gray - better contrast)
  textMuted: '#6B7280',      // Muted text (medium gray for subtle info)
  textTertiary: '#334155',   // Tertiary text (greyscale700 - better readability on white backgrounds)
  
  // Border colors
  border: '#E7E7E7',         // Default border
  borderLight: '#F2F2F7',    // Light border
  borderDark: '#C6C6C8',     // Dark border
  
  // Semantic colors
  success: '#08605D',        // Success states (dark teal green from Figma)
  warning: '#FF9500',        // Warning states (orange from Figma)
  error: '#FF3864',          // Error states (pink accent)
  info: '#1AC8FC',           // Info states (bright cyan from Figma gradients)
  
  // Supporting palette
  tealLight: '#51EAEA',      // Light teal from Figma gradients
  tealMedium: '#1AC8FC',     // Medium cyan from Figma
  tealDark: '#08605D',       // Dark teal
  bgAlt: '#F5F1E3',          // Beige/cream alternative background
  
  // Greyscale
  greyscale900: '#1C1B17',   // Darkest
  greyscale700: '#334155',
  greyscale500: '#64748B',
  greyscale300: '#CBD5E1',
  greyscale100: '#F1F5F9',   // Lightest
  
  // Others
  white: '#FFFFFF',
  black: '#000000',
};

export const Typography = {
  // Font families - Google Fonts (Auto Connex Brand)
  fontFamily: {
    // Volkhov - Modern and professional typeface for high-volume automotive data
    // Ideal for dealer dashboards and quick decision-making moments
    volkhov: Platform.select({
      ios: 'Volkhov',
      android: 'Volkhov',
      web: '"Volkhov", serif',
      default: 'System',
    }),
    
    // Vesper Libre - Clean, smooth typeface for simple communication
    // Ideal for listings and transactional interfaces
    vesperLibre: Platform.select({
      ios: 'VesperLibre',
      android: 'VesperLibre',
      web: '"Vesper Libre", serif',
      default: 'System',
    }),
    
    // System fallback
    system: 'System',
  },
  
  // Font sizes (from Figma brand guidelines)
  fontSize: {
    xs: 12,      // Small labels, captions
    sm: 14,      // Secondary text, metadata  
    base: 16,    // Body text, default
    lg: 20,      // Emphasized body text
    xl: 24,      // Small headings (24.10px from Figma)
    '2xl': 29,   // Section headings (29.07px from Figma)
    '3xl': 35,   // Page headings (34.71px from Figma)
    '4xl': 40,   // Hero headings (39.64px from Figma)
    '5xl': 48,   // Display headings (48px from Figma)
    '6xl': 73,   // Large display (73.47px from Figma logo)
  },
  
  // Mobile-optimized font sizes (optimized for 375px-428px viewport)
  fontSizeMobile: {
    xs: 10,      // Small labels, captions
    sm: 12,      // Secondary text, metadata  
    base: 13,    // Body text, default
    lg: 14,      // Emphasized body text
    xl: 15,      // Body text (main)
    '2xl': 17,   // Section headings
    '3xl': 20,   // Page headings
    '4xl': 24,   // Hero headings
    '5xl': 28,   // Display headings
    '6xl': 34,   // Large display
  },
  
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,      // Headings
    snug: 1.25,      // Tight text
    normal: 1.5,     // Body text
    relaxed: 1.75,   // Loose text
  },
};

export const Spacing = {
  xs: 4,       // Tiny spacing
  sm: 8,       // Small spacing
  md: 16,      // Medium spacing (base)
  lg: 24,      // Large spacing
  xl: 32,      // Extra large
  '2xl': 48,   // 2x extra large
  '3xl': 64,   // 3x extra large
  '4xl': 120,  // 4x extra large (from Figma frames)
};

// Mobile-optimized spacing (slightly reduced for better screen utilization)
export const SpacingMobile = {
  xs: 4,       // Tiny spacing (same)
  sm: 6,       // Small spacing
  md: 12,      // Medium spacing (base)
  lg: 18,      // Large spacing
  xl: 24,      // Extra large
  '2xl': 36,   // 2x extra large
  '3xl': 48,   // 3x extra large
  '4xl': 80,   // 4x extra large
};

export const BorderRadius = {
  none: 0,     // No radius
  sm: 4,       // Small elements
  md: 8,       // Buttons, inputs
  lg: 12,      // Cards, containers
  xl: 16,      // Large cards, modals
  '2xl': 24,   // Extra rounded
  full: 9999,  // Pills, circular
};

export const Shadows = {
  // Small shadow - subtle elevation (iOS/Web optimized)
  sm: Platform.select({
    android: {
      elevation: 1,
    },
    default: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
    },
  }),

  // Medium shadow - card elevation (iOS/Web optimized)
  md: Platform.select({
    android: {
      elevation: 3,
    },
    default: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
  }),

  // Large shadow - modal/popup elevation (iOS/Web optimized)
  lg: Platform.select({
    android: {
      elevation: 6,
    },
    default: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
    },
  }),

  // Extra large shadow - prominent elevation (iOS/Web optimized)
  xl: Platform.select({
    android: {
      elevation: 12,
    },
    default: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
    },
  }),
};

// Icon sizes (based on Figma 24x24 base)
export const IconSizes = {
  xs: 16,
  sm: 20,
  md: 24,   // Base size from Figma
  lg: 32,
  xl: 48,
};

// Layout utilities
export const Layout = {
  window: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  isSmallDevice: Dimensions.get('window').width < 375,
  isMediumDevice: Dimensions.get('window').width >= 375 && Dimensions.get('window').width < 768,
  isLargeDevice: Dimensions.get('window').width >= 768,
};

/**
 * Responsive utilities for web and mobile
 * CRITICAL: Uses viewport width (not Platform.OS) for web mobile responsiveness
 */
export const responsive = {
  // Check if running on web
  isWeb: Platform.OS === 'web',
  
  // Check if mobile viewport (works on web AND native mobile)
  // This ensures mobile styles apply in browser mobile viewports too
  isMobileViewport: () => Dimensions.get('window').width <= 480,
  
  // Check if small mobile device (iPhone SE, iPhone 12 Mini, etc.)
  isSmallMobile: Dimensions.get('window').width < 375,
  
  // Check if standard mobile device (based on viewport, not Platform)
  isMobile: Dimensions.get('window').width < 768,

  // Get responsive padding based on viewport width
  getContentPadding: () => {
    const width = Dimensions.get('window').width;
    if (width <= 480) return SpacingMobile.lg; // Mobile viewport (web or native)
    if (width < 375) return SpacingMobile.md; // Small mobile
    return Spacing.md; // Desktop
  },
  
  // Get responsive spacing based on viewport width
  getSpacing: (size: keyof typeof Spacing) => {
    const width = Dimensions.get('window').width;
    // Use mobile spacing for all viewports <= 480px (web mobile + native)
    if (width <= 480) {
      return SpacingMobile[size];
    }
    return Spacing[size];
  },
  
  // Get responsive font size based on viewport width
  getFontSize: (size: keyof typeof Typography.fontSize) => {
    const width = Dimensions.get('window').width;
    // Use mobile fonts for all viewports <= 480px (web mobile + native)
    if (width <= 480) {
      return Typography.fontSizeMobile[size];
    }
    return Typography.fontSize[size];
  },

  // Get responsive maxWidth for containers
  getMaxWidth: (defaultWidth: number | string = 400) => {
    const width = Dimensions.get('window').width;
    // Constrain to 480px on web for mobile viewport simulation
    if (Platform.OS === 'web' && width > 480) {
      return 480;
    }
    return '100%';
  },

  // Get screen dimensions
  screen: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
};
