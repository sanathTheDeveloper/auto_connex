/**
 * WelcomeModal Component
 * 
 * Full-screen animated welcome modal shown after successful signup.
 * Features animated gradient background with Auto Connex branding.
 * Similar to splash screen but with welcome message.
 * 
 * @example
 * <WelcomeModal visible={showWelcome} onDismiss={() => {}} />
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { Text } from '../../design-system/atoms/Text';
import { Spacer } from '../../design-system/atoms/Spacer';
import { Colors } from '../../design-system/primitives';

const { width, height } = Dimensions.get('window');

interface WelcomeModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onDismiss }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      gradientAnim.setValue(0);

      // Start animations
      Animated.parallel([
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        // Scale up logo
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        // Gradient animation loop
        Animated.loop(
          Animated.sequence([
            Animated.timing(gradientAnim, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: false,
            }),
            Animated.timing(gradientAnim, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: false,
            }),
          ])
        ),
      ]).start();

      // Auto dismiss after 2.5 seconds
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          onDismiss();
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, scaleAnim, gradientAnim, onDismiss]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* White Background */}
      <View style={styles.whiteBackground}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {/* App Icon/Logo */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Image
              source={require('../../../assets/logos/app-icon-teal.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </Animated.View>

          <Spacer size="xl" />

          {/* Welcome Message */}
          <Animated.View style={styles.messageContainer}>
            <Text variant="h1" weight="bold" style={styles.welcomeTitle}>
              Welcome!
            </Text>
            
            <Spacer size="md" />
            
            <Text variant="body" style={styles.subtitle}>
              Start exploring trusted deals
            </Text>
            <Text variant="body" style={styles.subtitle}>
              from verified dealers
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  whiteBackground: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  appIcon: {
    width: 140,
    height: 140,
  },
  messageContainer: {
    alignItems: 'center',
  },
  welcomeTitle: {
    color: Colors.primary,
    textAlign: 'center',
    fontSize: 48,
  },
  subtitle: {
    color: Colors.textTertiary,
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 28,
  },
});

export default WelcomeModal;
