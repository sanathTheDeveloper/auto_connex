import { StatusBar } from 'expo-status-bar';
import { Platform, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Volkhov_400Regular,
  Volkhov_400Regular_Italic,
  Volkhov_700Bold,
  Volkhov_700Bold_Italic,
} from '@expo-google-fonts/volkhov';
import {
  VesperLibre_400Regular,
  VesperLibre_500Medium,
  VesperLibre_700Bold,
  VesperLibre_900Black,
} from '@expo-google-fonts/vesper-libre';
import Navigation from './src/navigation';
import { Colors, Spacing } from './src/constants/theme';
import { Text } from './src/design-system';

/**
 * Auto Connex - High-Fidelity Mobile Prototype
 *
 * Main app entry point with navigation and font loading.
 * Fonts: Volkhov (data/dashboards), Vesper Libre (listings/transactions)
 * 
 * Design System Integration:
 * - Loads brand fonts (Volkhov + Vesper Libre) from Google Fonts
 * - Shows loading screen while fonts download
 * - Applies brand colors from design system
 */

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Volkhov: Volkhov_400Regular,
    'Volkhov-Italic': Volkhov_400Regular_Italic,
    'Volkhov-Bold': Volkhov_700Bold,
    'Volkhov-BoldItalic': Volkhov_700Bold_Italic,
    VesperLibre: VesperLibre_400Regular,
    'VesperLibre-Medium': VesperLibre_500Medium,
    'VesperLibre-Bold': VesperLibre_700Bold,
    'VesperLibre-Black': VesperLibre_900Black,
  });

  // Handle font loading error
  if (fontError) {
    return (
      <View style={[styles.appContainer, styles.loadingContainer]}>
        <Text variant="h4" align="center" color="error">
          Font Loading Error
        </Text>
        <Text variant="caption" align="center" color="textSecondary" style={{ marginTop: Spacing.sm }}>
          Please restart the app
        </Text>
      </View>
    );
  }

  // Show loading screen while fonts load
  if (!fontsLoaded) {
    return (
      <View style={[styles.appContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text variant="body" align="center" color="textSecondary" style={{ marginTop: Spacing.lg }}>
          Loading fonts...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      <Navigation />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignSelf: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
