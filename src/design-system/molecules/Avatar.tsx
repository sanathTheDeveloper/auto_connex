/**
 * Avatar Molecular Component
 * 
 * User avatar with Auto Connex brand styling.
 * Supports images, initials fallback, and badge indicators.
 * 
 * @example
 * <Avatar source={{ uri: userImage }} size="md" />
 * <Avatar name="John Smith" size="lg" />
 * <Avatar name="Jane Doe" size="sm" badge={<Badge variant="success" dot />} />
 */

import React from 'react';
import {
  View,
  Image,
  ImageSourcePropType,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  Platform,
} from 'react-native';
import { Colors, BorderRadius } from '../primitives';
import { Text } from '../atoms/Text';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  /** Image source */
  source?: ImageSourcePropType;
  /** Name for initials fallback */
  name?: string;
  /** Avatar size */
  size?: AvatarSize;
  /** Badge component (e.g., status indicator) */
  badge?: React.ReactNode;
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * Avatar component for user profiles
 * 
 * Sizes:
 * - sm: 32px
 * - md: 48px (default)
 * - lg: 64px
 * - xl: 96px
 * 
 * Falls back to initials with Volkhov Bold font if no image
 */
export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  badge,
  style,
}) => {
  const sizeStyle = sizeStyles[size];
  const initials = getInitials(name);
  const textVariant = size === 'sm' ? 'caption' : size === 'md' ? 'body' : 'h3';

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.avatar, sizeStyle]}>
        {source ? (
          <Image source={source} style={[styles.image, sizeStyle]} />
        ) : (
          <View style={[styles.initialsContainer, sizeStyle]}>
            <Text variant={textVariant} color="white" weight="bold">
              {initials}
            </Text>
          </View>
        )}
      </View>

      {badge && <View style={[styles.badge, getBadgePosition(size)]}>{badge}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    borderRadius: BorderRadius.full,
    borderWidth: Platform.OS === 'android' ? 2 : 2.5,
    borderColor: Colors.primary,
    overflow: 'hidden',
    ...(Platform.OS === 'android' ? {
      elevation: 1,
    } : {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
  },
});

/**
 * Size-specific styles
 */
const sizeStyles: Record<AvatarSize, ImageStyle> = {
  sm: {
    width: 32,
    height: 32,
  },
  md: {
    width: 48,
    height: 48,
  },
  lg: {
    width: 64,
    height: 64,
  },
  xl: {
    width: 96,
    height: 96,
  },
};

/**
 * Badge positioning based on avatar size
 */
function getBadgePosition(size: AvatarSize): ViewStyle {
  switch (size) {
    case 'sm':
      return { bottom: 0, right: 0 };
    case 'md':
      return { bottom: -2, right: -2 };
    case 'lg':
      return { bottom: -4, right: -4 };
    case 'xl':
      return { bottom: -6, right: -6 };
    default:
      return { bottom: -2, right: -2 };
  }
}

/**
 * Extract initials from name (max 2 characters)
 */
function getInitials(name?: string): string {
  if (!name) return '?';

  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default Avatar;
