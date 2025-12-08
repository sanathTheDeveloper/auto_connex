import React from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Spacing } from '../constants/theme';
import { Text, Card, Spacer, Button } from '../design-system';

/**
 * Home Screen
 * 
 * Refactored to use design system components instead of manual styling.
 * Demonstrates Text variants, Card, Spacer, and Button usage.
 */
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" align="center">
          Welcome to Auto Connex
        </Text>
        
        <Spacer size="md" />
        
        <Text variant="h3" align="center" color="textSecondary">
          High-fidelity mobile prototype
        </Text>
        
        <Spacer size="xl" />
        
        <Text variant="body" align="center" color="textSecondary">
          Start building your Figma design here.{'\n'}
          Use the design system components for brand consistency.
        </Text>

        <Spacer size="2xl" />

        <Card variant="elevated" padding="lg" style={styles.card}>
          <Text variant="h3">🎨 Quick Start</Text>
          
          <Spacer size="md" />
          
          <Text variant="bodySmall" color="textSecondary">
            1. Add screens in src/screens/{'\n'}
            2. Create components in src/components/{'\n'}
            3. Use design system from src/design-system/{'\n'}
            4. Update theme in src/constants/theme.ts
          </Text>
          
          <Spacer size="lg" />
          
          <Button 
            variant="primary" 
            size="md"
            fullWidth
            onPress={() => console.log('Explore Design System')}
          >
            Explore Design System
          </Button>
          
          <Spacer size="sm" />
          
          <Button 
            variant="outline" 
            size="md"
            fullWidth
            onPress={() => console.log('View Documentation')}
          >
            View Documentation
          </Button>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? Spacing.md : Spacing.lg,
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? '100%' : 400,
  },
});
