/**
 * useResponsive Hook
 *
 * Provides dynamic responsive values that update on window resize.
 * Solves the issue where Dimensions.get('window') is cached at module load.
 *
 * @example
 * const { width, height, isMobileViewport, getSpacing, getFontSize } = useResponsive();
 */

import { useState, useEffect, useCallback } from 'react';
import { Dimensions, Platform, ScaledSize } from 'react-native';
import { Typography, Spacing, SpacingMobile } from '../constants/theme';

interface ResponsiveValues {
  width: number;
  height: number;
  isMobileViewport: boolean;
  isSmallMobile: boolean;
  isMobile: boolean;
  isWeb: boolean;
  getSpacing: (size: keyof typeof Spacing) => number;
  getFontSize: (size: keyof typeof Typography.fontSize) => number;
  getContentPadding: () => number;
  containerMaxWidth: number | '100%';
}

/**
 * Hook that provides responsive values with automatic updates on dimension changes
 */
export const useResponsive = (): ResponsiveValues => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const isMobileViewport = width <= 480;
  const isSmallMobile = width < 375;
  const isMobile = width < 768;
  const isWeb = Platform.OS === 'web';

  const getSpacing = useCallback((size: keyof typeof Spacing): number => {
    if (isMobileViewport) {
      return SpacingMobile[size];
    }
    return Spacing[size];
  }, [isMobileViewport]);

  const getFontSize = useCallback((size: keyof typeof Typography.fontSize): number => {
    if (isMobileViewport) {
      return Typography.fontSizeMobile[size];
    }
    return Typography.fontSize[size];
  }, [isMobileViewport]);

  const getContentPadding = useCallback((): number => {
    if (isMobileViewport) return SpacingMobile.lg;
    if (isSmallMobile) return SpacingMobile.md;
    return Spacing.md;
  }, [isMobileViewport, isSmallMobile]);

  const containerMaxWidth = isWeb ? 480 : '100%';

  return {
    width,
    height,
    isMobileViewport,
    isSmallMobile,
    isMobile,
    isWeb,
    getSpacing,
    getFontSize,
    getContentPadding,
    containerMaxWidth,
  };
};

/**
 * Get current responsive values (non-hook version for static contexts)
 * Note: This doesn't update dynamically - use useResponsive hook in components
 */
export const getResponsiveValues = () => {
  const { width, height } = Dimensions.get('window');
  const isMobileViewport = width <= 480;

  return {
    width,
    height,
    isMobileViewport,
    isSmallMobile: width < 375,
    isMobile: width < 768,
    isWeb: Platform.OS === 'web',
    getSpacing: (size: keyof typeof Spacing): number => {
      return isMobileViewport ? SpacingMobile[size] : Spacing[size];
    },
    getFontSize: (size: keyof typeof Typography.fontSize): number => {
      return isMobileViewport ? Typography.fontSizeMobile[size] : Typography.fontSize[size];
    },
  };
};

export default useResponsive;
