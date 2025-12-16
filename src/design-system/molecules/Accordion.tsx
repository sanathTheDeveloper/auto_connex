/**
 * Accordion Component
 *
 * Expandable/collapsible section component for organizing content.
 * Features smooth animations, icons, badges, and brand-compliant styling.
 *
 * @example
 * <Accordion
 *   title="Vehicle Details"
 *   icon="car-sport-outline"
 *   expanded={true}
 * >
 *   <Text>Content here</Text>
 * </Accordion>
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../atoms/Text';
import { Badge } from './Badge';
import { Colors, Spacing, BorderRadius, Shadows } from '../primitives';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================================================
// TYPES
// ============================================================================

export interface AccordionProps {
  /** Title text displayed in the header */
  title: string;
  /** Optional icon name (Ionicons) */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Optional badge text (e.g., "5 Extras", "✓ Verified") */
  badgeText?: string;
  /** Badge variant for styling */
  badgeVariant?: 'success' | 'warning' | 'info' | 'error';
  /** Initially expanded state */
  defaultExpanded?: boolean;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Callback when expand/collapse toggles */
  onToggle?: (expanded: boolean) => void;
  /** Content to display when expanded */
  children: React.ReactNode;
  /** Disable the accordion */
  disabled?: boolean;
  /** Custom test ID for testing */
  testID?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const Accordion: React.FC<AccordionProps> = ({
  title,
  icon,
  badgeText,
  badgeVariant = 'info',
  defaultExpanded = false,
  expanded: controlledExpanded,
  onToggle,
  children,
  disabled = false,
  testID,
}) => {
  // Internal state for uncontrolled mode
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  // Handle toggle with animation
  const handleToggle = useCallback(() => {
    if (disabled) return;

    // Configure smooth animation
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        250,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );

    const newExpandedState = !isExpanded;

    // Update state
    if (controlledExpanded === undefined) {
      setInternalExpanded(newExpandedState);
    }

    // Call callback
    onToggle?.(newExpandedState);
  }, [disabled, isExpanded, controlledExpanded, onToggle]);

  return (
    <View
      style={[
        styles.container,
        isExpanded && styles.containerExpanded,
        disabled && styles.containerDisabled,
      ]}
      testID={testID}
    >
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={handleToggle}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${isExpanded ? 'expanded' : 'collapsed'}`}
        accessibilityState={{ expanded: isExpanded, disabled }}
      >
        {/* Left side: Icon + Title */}
        <View style={styles.headerLeft}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={isExpanded ? Colors.primary : Colors.textTertiary}
              style={styles.headerIcon}
            />
          )}
          <Text
            variant="bodySmall"
            weight="medium"
            color="text"
            style={styles.headerTitle}
          >
            {title}
          </Text>
        </View>

        {/* Right side: Badge + Chevron */}
        <View style={styles.headerRight}>
          {badgeText && (
            <Badge
              variant={badgeVariant}
              size="sm"
              label={badgeText}
              style={styles.badge}
            />
          )}
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={isExpanded ? Colors.primary : Colors.textTertiary}
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>

      {/* Content */}
      {isExpanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  containerExpanded: {
    borderColor: Colors.primary + '30',
    backgroundColor: Colors.backgroundAlt,
    ...Shadows.md,
  },
  containerDisabled: {
    opacity: 0.5,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginLeft: Spacing.md,
  },
  badge: {
    flexShrink: 0,
  },
  chevron: {
    flexShrink: 0,
  },

  // Content
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
});

export default Accordion;
