/**
 * Icon Atomic Component
 * 
 * Wrapper around @expo/vector-icons with brand-consistent sizing.
 * 
 * @example
 * <Icon name="car" size="md" color="primary" />
 * <Icon name="checkmark-circle" family="Ionicons" size="lg" color="success" />
 */

import React from 'react';
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
  FontAwesome5,
  Feather,
  AntDesign,
  Entypo,
} from '@expo/vector-icons';
import { Colors, IconSizes } from '../primitives';

type IconFamily =
  | 'Ionicons'
  | 'MaterialIcons'
  | 'MaterialCommunityIcons'
  | 'FontAwesome'
  | 'FontAwesome5'
  | 'Feather'
  | 'AntDesign'
  | 'Entypo';

type IconSize = keyof typeof IconSizes | number;
type ColorKey = keyof typeof Colors;

export interface IconProps {
  /** Icon name from the chosen family */
  name: string;
  /** Icon family (default: Ionicons) */
  family?: IconFamily;
  /** Size preset or custom number */
  size?: IconSize;
  /** Color from theme or custom hex */
  color?: ColorKey | string;
  /** Custom style */
  style?: any;
}

/**
 * Icon component with standardized sizing
 * 
 * Sizes:
 * - xs: 16px
 * - sm: 20px
 * - md: 24px (default)
 * - lg: 32px
 * - xl: 48px
 */
export const Icon: React.FC<IconProps> = ({
  name,
  family = 'Ionicons',
  size = 'md',
  color = 'text',
  style,
}) => {
  const IconComponent = getIconComponent(family);
  const iconSize = typeof size === 'number' ? size : IconSizes[size];
  const iconColor = color in Colors ? Colors[color as ColorKey] : color;

  return (
    <IconComponent
      name={name as any}
      size={iconSize}
      color={iconColor}
      style={style}
    />
  );
};

/**
 * Get the appropriate icon component based on family
 */
function getIconComponent(family: IconFamily) {
  switch (family) {
    case 'Ionicons':
      return Ionicons;
    case 'MaterialIcons':
      return MaterialIcons;
    case 'MaterialCommunityIcons':
      return MaterialCommunityIcons;
    case 'FontAwesome':
      return FontAwesome;
    case 'FontAwesome5':
      return FontAwesome5;
    case 'Feather':
      return Feather;
    case 'AntDesign':
      return AntDesign;
    case 'Entypo':
      return Entypo;
    default:
      return Ionicons;
  }
}

export default Icon;
