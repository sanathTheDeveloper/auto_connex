/**
 * Modal Component
 * 
 * Reusable modal dialog with animations.
 * Supports success, error, info, and custom variants.
 * Uses spring physics for slide-up entrance and fade backdrop.
 * 
 * @example
 * <Modal
 *   visible={showModal}
 *   onClose={() => setShowModal(false)}
 *   variant="success"
 *   title="Welcome!"
 *   message="Your account has been created successfully."
 * />
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Modal as RNModal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { Spacer } from '../atoms/Spacer';
import { Icon } from '../atoms/Icon';
import { Colors, Spacing, BorderRadius, Shadows } from '../primitives';

const { height } = Dimensions.get('window');

export type ModalVariant = 'success' | 'error' | 'info' | 'warning';

export interface ModalProps {
  /** Whether modal is visible */
  visible: boolean;
  
  /** Callback when modal is closed */
  onClose: () => void;
  
  /** Modal variant (success, error, info, warning) */
  variant?: ModalVariant;
  
  /** Modal title */
  title?: string;
  
  /** Modal message/description */
  message?: string;
  
  /** Optional icon name (from @expo/vector-icons MaterialIcons) */
  iconName?: string;
  
  /** Primary action button text */
  primaryAction?: string;
  
  /** Secondary action button text */
  secondaryAction?: string;
  
  /** Primary action callback */
  onPrimaryAction?: () => void;
  
  /** Secondary action callback */
  onSecondaryAction?: () => void;
  
  /** Custom content (overrides title/message) */
  children?: React.ReactNode;
  
  /** Disable backdrop tap to close */
  disableBackdropClose?: boolean;
  
  /** Auto-close after duration (milliseconds) */
  autoCloseDuration?: number;
}

/**
 * Modal
 * 
 * Animated modal with backdrop, slide-up entrance, and variant styles.
 * Use for success messages, errors, confirmations, or custom content.
 */
export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  variant = 'info',
  title,
  message,
  iconName,
  primaryAction,
  secondaryAction,
  onPrimaryAction,
  onSecondaryAction,
  children,
  disableBackdropClose = false,
  autoCloseDuration,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-close timer
      if (autoCloseDuration) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseDuration);
        return () => clearTimeout(timer);
      }
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, autoCloseDuration]);

  /**
   * Handle backdrop press
   */
  const handleBackdropPress = () => {
    if (!disableBackdropClose) {
      onClose();
    }
  };

  /**
   * Get variant color
   */
  const getVariantColor = (): string => {
    switch (variant) {
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      case 'warning':
        return Colors.warning;
      case 'info':
      default:
        return Colors.primary;
    }
  };

  /**
   * Get default icon for variant
   */
  const getDefaultIcon = (): string => {
    if (iconName) return iconName;
    
    switch (variant) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: Colors.greyscale900,
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            ]}
          />
        </TouchableOpacity>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={[
            styles.modal,
            variant === 'success' && styles.modalSuccess
          ]}>
            {/* Icon */}
            {(title || message || variant) && (
              <View style={[
                styles.iconContainer, 
                variant === 'success' 
                  ? { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                  : { backgroundColor: `${getVariantColor()}20` }
              ]}>
                <Icon
                  name={getDefaultIcon()}
                  size={48}
                  color={variant === 'success' ? Colors.white : getVariantColor()}
                />
              </View>
            )}

            {/* Content */}
            {children ? (
              <View style={styles.content}>{children}</View>
            ) : (
              <View style={styles.content}>
                {title && (
                  <>
                    <Text 
                      variant="h3" 
                      weight="bold" 
                      align="center"
                      color={variant === 'success' ? 'white' : 'text'}
                    >
                      {title}
                    </Text>
                    <Spacer size="sm" />
                  </>
                )}
                
                {message && (
                  <Text 
                    variant="body" 
                    color={variant === 'success' ? 'white' : 'textSecondary'} 
                    align="center"
                    style={variant === 'success' && { opacity: 0.9 }}
                  >
                    {message}
                  </Text>
                )}
              </View>
            )}

            {/* Actions */}
            {(primaryAction || secondaryAction) && (
              <>
                <Spacer size="lg" />
                <View style={styles.actions}>
                  {secondaryAction && (
                    <Button
                      variant="ghost"
                      size="md"
                      onPress={onSecondaryAction || onClose}
                      style={styles.actionButton}
                    >
                      {secondaryAction}
                    </Button>
                  )}
                  
                  {primaryAction && (
                    <Button
                      variant="primary"
                      size="md"
                      onPress={onPrimaryAction || onClose}
                      style={styles.actionButton}
                    >
                      {primaryAction}
                    </Button>
                  )}
                </View>
              </>
            )}

            {/* Close button (if no actions) */}
            {!primaryAction && !secondaryAction && (
              <>
                <Spacer size="lg" />
                <Button
                  variant="primary"
                  size="md"
                  onPress={onClose}
                >
                  OK
                </Button>
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
  },
  modal: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  modalSuccess: {
    backgroundColor: Colors.primary,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  content: {
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

export default Modal;
