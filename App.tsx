import { StatusBar } from 'expo-status-bar';
import Navigation from './src/navigation';

/**
 * Auto Connex - High-Fidelity Mobile Prototype
 * 
 * Main app entry point with navigation setup.
 * Start implementing your Figma designs in src/screens/
 */

export default function App() {
  return (
    <>
      <Navigation />
      <StatusBar style="auto" />
    </>
  );
}
