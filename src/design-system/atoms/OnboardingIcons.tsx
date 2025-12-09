/**
 * OnboardingIcons Component
 *
 * High-fidelity SVG-based icons for onboarding slides.
 * Custom-designed illustrations using Auto Connex brand colors.
 * Optimized for mobile display with clean, modern aesthetics.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Path, Circle, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../primitives';

interface IconProps {
  size?: number;
}

/**
 * Browse Icon - Modern car with magnifying glass concept
 * Represents browsing nationwide vehicle inventory
 */
export const BrowseIcon: React.FC<IconProps> = ({ size = 180 }) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <Svg width={size} height={size} viewBox="0 0 180 180" fill="none">
      <Defs>
        <SvgLinearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={Colors.white} stopOpacity="0.95" />
          <Stop offset="100%" stopColor={Colors.white} stopOpacity="0.85" />
        </SvgLinearGradient>
      </Defs>

      {/* Car Body - Modern sedan shape */}
      <Path
        d="M50 95 L65 75 L115 75 L130 95 L50 95Z"
        fill="url(#carGradient)"
        stroke={Colors.white}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <Rect
        x="45"
        y="95"
        width="90"
        height="25"
        rx="4"
        fill="url(#carGradient)"
        stroke={Colors.white}
        strokeWidth="3"
      />

      {/* Car Windows */}
      <Path
        d="M70 80 L75 80 L75 92 L70 92 Z"
        fill={`${Colors.tealDark}40`}
        stroke={Colors.white}
        strokeWidth="2"
      />
      <Path
        d="M105 80 L110 80 L110 92 L105 92 Z"
        fill={`${Colors.tealDark}40`}
        stroke={Colors.white}
        strokeWidth="2"
      />

      {/* Wheels */}
      <Circle cx="65" cy="120" r="12" fill={Colors.white} stroke={Colors.white} strokeWidth="2" />
      <Circle cx="115" cy="120" r="12" fill={Colors.white} stroke={Colors.white} strokeWidth="2" />
      <Circle cx="65" cy="120" r="6" fill={`${Colors.tealDark}60`} />
      <Circle cx="115" cy="120" r="6" fill={`${Colors.tealDark}60`} />

      {/* Magnifying Glass - Search concept */}
      <Circle cx="125" cy="55" r="18" fill="none" stroke={Colors.white} strokeWidth="4" />
      <Circle cx="125" cy="55" r="12" fill={`${Colors.white}40`} />
      <Path
        d="M138 68 L150 80"
        stroke={Colors.white}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

/**
 * Verify Icon - Shield with checkmark concept
 * Represents built-in verification (PPSR, ABN, License)
 */
export const VerifyIcon: React.FC<IconProps> = ({ size = 180 }) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <Svg width={size} height={size} viewBox="0 0 180 180" fill="none">
      <Defs>
        <SvgLinearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={Colors.white} stopOpacity="0.95" />
          <Stop offset="100%" stopColor={Colors.white} stopOpacity="0.85" />
        </SvgLinearGradient>
      </Defs>

      {/* Shield Shape */}
      <Path
        d="M90 45 C90 45, 120 50, 120 75 C120 100, 105 120, 90 135 C75 120, 60 100, 60 75 C60 50, 90 45, 90 45 Z"
        fill="url(#shieldGradient)"
        stroke={Colors.white}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Checkmark */}
      <Path
        d="M75 85 L85 95 L105 70"
        stroke={Colors.white}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Small verification badges around shield */}
      <Circle cx="55" cy="65" r="8" fill={Colors.white} opacity="0.8" />
      <Circle cx="125" cy="65" r="8" fill={Colors.white} opacity="0.8" />
      <Circle cx="90" cy="140" r="8" fill={Colors.white} opacity="0.8" />

      {/* Check icons in badges */}
      <Path d="M52 65 L54 67 L58 63" stroke={`${Colors.tealDark}80`} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M122 65 L124 67 L128 63" stroke={`${Colors.tealDark}80`} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M87 140 L89 142 L93 138" stroke={`${Colors.tealDark}80`} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </Svg>
  </View>
);

/**
 * Speed Icon - Lightning bolt with dollar sign concept
 * Represents lower fees and faster deals
 */
export const SpeedIcon: React.FC<IconProps> = ({ size = 180 }) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <Svg width={size} height={size} viewBox="0 0 180 180" fill="none">
      <Defs>
        <SvgLinearGradient id="boltGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={Colors.white} stopOpacity="0.95" />
          <Stop offset="100%" stopColor={Colors.white} stopOpacity="0.85" />
        </SvgLinearGradient>
      </Defs>

      {/* Lightning Bolt */}
      <Path
        d="M100 40 L70 90 L85 90 L75 140 L115 80 L95 80 L100 40 Z"
        fill="url(#boltGradient)"
        stroke={Colors.white}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Dollar Sign Circle */}
      <Circle cx="65" cy="60" r="20" fill={Colors.white} opacity="0.9" />
      <Path
        d="M65 50 L65 70"
        stroke={`${Colors.tealDark}90`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Path
        d="M60 54 C60 52, 62 50, 65 50 C68 50, 70 52, 70 54 C70 56, 68 57, 65 57 C62 57, 60 58, 60 60 C60 62, 62 64, 65 64 C68 64, 70 66, 70 68"
        stroke={`${Colors.tealDark}90`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Speed Lines */}
      <Path d="M50 75 L40 75" stroke={Colors.white} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <Path d="M55 85 L45 85" stroke={Colors.white} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <Path d="M50 95 L35 95" stroke={Colors.white} strokeWidth="3" strokeLinecap="round" opacity="0.7" />

      {/* Percentage Symbol */}
      <Circle cx="125" cy="110" r="4" fill={Colors.white} opacity="0.8" />
      <Circle cx="135" cy="120" r="4" fill={Colors.white} opacity="0.8" />
      <Path d="M123 112 L137 122" stroke={Colors.white} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default {
  BrowseIcon,
  VerifyIcon,
  SpeedIcon,
};
