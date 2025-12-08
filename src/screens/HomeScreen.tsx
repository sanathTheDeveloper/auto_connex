import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';

/**
 * Home Screen
 * 
 * Example screen with styled components.
 * Replace this with your Figma design implementation.
 */
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Auto Connex</Text>
        <Text style={styles.subtitle}>
          High-fidelity mobile prototype
        </Text>
        <Text style={styles.description}>
          Start building your Figma design here.
          {'\n'}Use src/constants/theme.ts for design tokens.
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎨 Quick Start</Text>
          <Text style={styles.cardText}>
            1. Add screens in src/screens/{'\n'}
            2. Create components in src/components/{'\n'}
            3. Update theme in src/constants/theme.ts
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: '700',
    marginBottom: Spacing.md,
    textAlign: 'center',
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
    marginBottom: Spacing['2xl'],
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
    width: '100%',
    maxWidth: 400,
  },
  cardTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    marginBottom: Spacing.md,
    color: Colors.text,
  },
  cardText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },
});
