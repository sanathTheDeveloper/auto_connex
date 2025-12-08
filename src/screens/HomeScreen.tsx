import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

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
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#111827',
  },
  subtitle: {
    fontSize: 20,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
    maxWidth: 400,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  cardText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
  },
});
