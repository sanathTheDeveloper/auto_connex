import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import { Spacing, Colors as ThemeColors } from '../constants/theme';
import { 
  Text, 
  Button, 
  Card, 
  Input, 
  Badge, 
  Avatar, 
  Icon, 
  Spacer, 
  Divider,
  Colors 
} from '../design-system';

/**
 * Design System Screen
 * 
 * Showcases all design system components with live examples.
 * Demonstrates proper usage patterns and component variants.
 */
export default function DesignSystemScreen() {
  const [inputValue, setInputValue] = React.useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={require('../assets/logos/logo-teal.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Spacer size="sm" />
          <View style={{ paddingVertical: 4 }}>
            <Text variant="h3" align="center" color="text">Auto Connex</Text>
          </View>
          <Spacer size="xs" />
          <Text variant="caption" align="center" style={{ color: '#666666' }}>
            Design System Showcase
          </Text>
        </View>

        <Spacer size="lg" />

        {/* Typography Section */}
        <View style={styles.section}>
          <View style={{ paddingVertical: 4 }}>
            <Text variant="h3" color="text">Typography</Text>
          </View>
          <Spacer size="xs" />
          <Text variant="caption" style={{ color: '#666666' }}>
            Volkhov for data, Vesper Libre for listings
          </Text>
          
          <Spacer size="md" />
          
          <Card variant="flat" padding="sm">
            <TypeRow variant="label" label="Display (73px)" sample="Aa" />
            <TypeRow variant="h1" label="Heading 1 (48px)" sample="Aa" />
            <TypeRow variant="h2" label="Heading 2 (40px)" sample="Aa" />
            <TypeRow variant="h3" label="Heading 3 (35px)" sample="Aa" />
            <TypeRow variant="h4" label="Heading 4 (29px)" sample="Aa" />
            <TypeRow variant="body" label="Body (24px)" sample="Aa" />
            <TypeRow variant="bodySmall" label="Body S (20px)" sample="Aa" />
            <TypeRow variant="caption" label="Caption (16px)" sample="Aa" />
            <TypeRow variant="label" label="Label (14px)" sample="Aa" />
          </Card>
        </View>

        <Spacer size="lg" />
        <Divider />
        <Spacer size="lg" />

        {/* Colors Section */}
        <View style={styles.section}>
          <Text variant="h3" color="text">Brand Colors</Text>
          <Spacer size="xs" />
          <Text variant="caption" style={{ color: '#666666' }}>
            From Figma brand guidelines
          </Text>
          
          <Spacer size="md" />
          
          <View style={styles.colorGrid}>
            <ColorSwatch label="Primary" color={Colors.primary} hex="#0ABAB5" />
            <ColorSwatch label="Secondary" color={Colors.secondary} hex="#008985" />
            <ColorSwatch label="Accent" color={Colors.accent} hex="#FF3864" />
            <ColorSwatch label="Success" color={Colors.success} hex="#08605D" />
            <ColorSwatch label="Warning" color={Colors.warning} hex="#FF9500" />
            <ColorSwatch label="Error" color={Colors.error} hex="#FF3864" />
          </View>
        </View>

        <Spacer size="lg" />
        <Divider />
        <Spacer size="lg" />

        {/* Buttons Section */}
        <View style={styles.section}>
          <Text variant="h3" color="text">Buttons</Text>
          <Spacer size="xs" />
          <Text variant="caption" style={{ color: '#666666' }}>
            5 variants × 3 sizes
          </Text>
          
          <Spacer size="md" />
          
          <Card variant="flat" padding="sm">
            <Text variant="label" style={{ color: '#999999' }}>VARIANTS</Text>
            <Spacer size="sm" />
            
            <Button variant="primary" onPress={() => console.log('Primary')}>
              Primary Button
            </Button>
            <Spacer size="sm" />
            
            <Button variant="secondary" onPress={() => console.log('Secondary')}>
              Secondary Button
            </Button>
            <Spacer size="sm" />
            
            <Button variant="accent" onPress={() => console.log('Accent')}>
              Accent Button
            </Button>
            <Spacer size="sm" />
            
            <Button variant="outline" onPress={() => console.log('Outline')}>
              Outline Button
            </Button>
            <Spacer size="sm" />
            
            <Button variant="ghost" onPress={() => console.log('Ghost')}>
              Ghost Button
            </Button>
            
            <Spacer size="md" />
            <Divider />
            <Spacer size="md" />
            
            <Text variant="label" style={{ color: '#999999' }}>SIZES</Text>
            <Spacer size="xs" />
            
            <Button variant="primary" size="sm" onPress={() => {}}>
              Small
            </Button>
            <Spacer size="sm" />
            
            <Button variant="primary" size="md" onPress={() => {}}>
              Medium (Default)
            </Button>
            <Spacer size="sm" />
            
            <Button variant="primary" size="lg" onPress={() => {}}>
              Large
            </Button>
            
            <Spacer size="md" />
            <Divider />
            <Spacer size="md" />
            
            <Text variant="label" style={{ color: '#999999' }}>WITH ICONS</Text>
            <Spacer size="xs" />
            
            <Button 
              variant="primary" 
              iconLeft="heart" 
              onPress={() => {}}
            >
              With Left Icon
            </Button>
            <Spacer size="sm" />
            
            <Button 
              variant="secondary" 
              iconRight="arrow-forward" 
              onPress={() => {}}
            >
              With Right Icon
            </Button>
            
            <Spacer size="md" />
            <Divider />
            <Spacer size="md" />
            
            <Text variant="label" style={{ color: '#999999' }}>STATES</Text>
            <Spacer size="xs" />
            
            <Button variant="primary" loading onPress={() => {}}>
              Loading
            </Button>
            <Spacer size="sm" />
            
            <Button variant="primary" disabled onPress={() => {}}>
              Disabled
            </Button>
          </Card>
        </View>

        <Spacer size="lg" />
        <Divider />
        <Spacer size="lg" />

        {/* Cards Section */}
        <View style={styles.section}>
          <Text variant="h3" color="text">Cards</Text>
          <Spacer size="xs" />
          <Text variant="caption" style={{ color: '#666666' }}>
            3 variants with padding
          </Text>
          
          <Spacer size="md" />
          
          <Card variant="flat" padding="sm">
            <Text variant="h4" color="text">Flat Card</Text>
            <Spacer size="xs" />
            <Text variant="body" style={{ color: '#666666' }}>
              No shadow, clean background
            </Text>
          </Card>
          
          <Spacer size="md" />
          
          <Card variant="elevated" padding="md">
            <Text variant="h4" color="text">Elevated Card</Text>
            <Spacer size="xs" />
            <Text variant="body" style={{ color: '#666666' }}>
              Medium shadow elevation
            </Text>
          </Card>
          
          <Spacer size="md" />
          
          <Card variant="outlined" padding="md">
            <Text variant="h4" color="text">Outlined Card</Text>
            <Spacer size="xs" />
            <Text variant="body" style={{ color: '#666666' }}>
              Border outline style
            </Text>
          </Card>
          
          <Spacer size="md" />
          
          <Card 
            variant="elevated" 
            padding="lg" 
            onPress={() => console.log('Card pressed')}
          >
            <View style={styles.cardHeader}>
              <Icon name="car" family="Ionicons" size="lg" color="primary" />
              <Spacer size="sm" horizontal />
              <View style={{ flex: 1 }}>
                <Text variant="h4" color="text">Touchable Card</Text>
                <Text variant="caption" style={{ color: '#666666' }}>
                  With onPress
                </Text>
              </View>
              <Icon name="chevron-forward" family="Ionicons" size="sm" color="#666666" />
            </View>
          </Card>
        </View>

        <Spacer size="lg" />
        <Divider />
        <Spacer size="lg" />

        {/* Input Section */}
        <View style={styles.section}>
          <Text variant="h3" color="text">Input Fields</Text>
          <Spacer size="xs" />
          <Text variant="caption" style={{ color: '#666666' }}>
            Form inputs with validation
          </Text>
          
          <Spacer size="md" />
          
          <Card variant="flat" padding="md">
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={inputValue}
              onChange={setInputValue}
              helperText="We'll never share your email"
              leftIcon="mail"
            />
            
            <Spacer size="lg" />
            
            <Input
              label="Password"
              placeholder="Enter password"
              value=""
              onChange={() => {}}
              secureTextEntry
              rightIcon="eye"
            />
            
            <Spacer size="lg" />
            
            <Input
              label="With Error"
              placeholder="Enter your email"
              value="invalid"
              onChange={() => {}}
              error="Invalid email address"
            />
            
            <Spacer size="lg" />
            
            <Input
              label="Search"
              placeholder="Search..."
              value=""
              onChange={() => {}}
              leftIcon="search"
            />
          </Card>
        </View>

        <Spacer size="lg" />
        <Divider />
        <Spacer size="lg" />

        {/* Badges Section */}
        <View style={styles.section}>
          <Text variant="h3" color="text">Badges</Text>
          <Spacer size="xs" />
          <Text variant="caption" style={{ color: '#666666' }}>
            Status indicators
          </Text>
          
          <Spacer size="md" />
          
          <Card variant="flat" padding="sm">
            <Text variant="label" style={{ color: '#999999' }}>LABEL MODE</Text>
            <Spacer size="sm" />
            
            <View style={styles.badgeRow}>
              <Badge variant="success" label="Available" />
              <Spacer size="sm" horizontal />
              <Badge variant="warning" label="Pending" />
              <Spacer size="sm" horizontal />
              <Badge variant="error" label="Sold" />
              <Spacer size="sm" horizontal />
              <Badge variant="info" label="New" />
            </View>
            
            <Spacer size="md" />
            <Divider />
            <Spacer size="md" />
            
            <Text variant="label" style={{ color: '#999999' }}>SIZES</Text>
            <Spacer size="xs" />
            
            <View style={styles.badgeRow}>
              <Badge variant="success" label="Small" size="sm" />
              <Spacer size="sm" horizontal />
              <Badge variant="info" label="Medium" size="md" />
              <Spacer size="sm" horizontal />
              <Badge variant="warning" label="Large" size="lg" />
            </View>
            
            <Spacer size="md" />
            <Divider />
            <Spacer size="md" />
            
            <Text variant="label" style={{ color: '#999999' }}>DOT MODE</Text>
            <Spacer size="xs" />
            
            <View style={styles.badgeRow}>
              <Badge variant="success" dot size="sm" />
              <Spacer size="sm" horizontal />
              <Badge variant="warning" dot size="md" />
              <Spacer size="sm" horizontal />
              <Badge variant="error" dot size="lg" />
            </View>
          </Card>
        </View>

        <Spacer size="lg" />
        <Divider />
        <Spacer size="lg" />

        {/* Avatar Section */}
        <View style={styles.section}>
          <Text variant="h3" color="text">Avatars</Text>
          <Spacer size="xs" />
          <Text variant="caption" style={{ color: '#666666' }}>
            Profile images & initials
          </Text>
          
          <Spacer size="md" />
          
          <Card variant="flat" padding="sm">
            <Text variant="label" style={{ color: '#999999' }}>SIZES</Text>
            <Spacer size="xs" />
            
            <View style={styles.avatarRow}>
              <Avatar name="John Doe" size="sm" />
              <Spacer size="md" horizontal />
              <Avatar name="Jane Smith" size="md" />
              <Spacer size="md" horizontal />
              <Avatar name="Bob Wilson" size="lg" />
              <Spacer size="md" horizontal />
              <Avatar name="Alice Brown" size="xl" />
            </View>
            
            <Spacer size="md" />
            <Divider />
            <Spacer size="md" />
            
            <Text variant="label" style={{ color: '#999999' }}>WITH BADGE</Text>
            <Spacer size="xs" />
            
            <View style={styles.avatarRow}>
              <Avatar 
                name="Online" 
                size="lg" 
                badge={<Badge variant="success" dot size="md" />}
              />
              <Spacer size="md" horizontal />
              <Avatar 
                name="Away" 
                size="lg" 
                badge={<Badge variant="warning" dot size="md" />}
              />
              <Spacer size="md" horizontal />
              <Avatar 
                name="Offline" 
                size="lg" 
                badge={<Badge variant="error" dot size="md" />}
              />
            </View>
          </Card>
        </View>

        <Spacer size="lg" />
        <Divider />
        <Spacer size="lg" />

        {/* Icons Section */}
        <View style={styles.section}>
          <Text variant="h3" color="text">Icons</Text>
          <Spacer size="xs" />
          <Text variant="caption" style={{ color: '#666666' }}>
            8 icon families
          </Text>
          
          <Spacer size="md" />
          
          <Card variant="flat" padding="sm">
            <Text variant="label" style={{ color: '#999999' }}>SIZES</Text>
            <Spacer size="xs" />
            
            <View style={styles.iconRow}>
              <View style={styles.iconExample}>
                <Icon name="home" family="Ionicons" size="xs" color="primary" />
                <Spacer size="xs" />
                <Text variant="caption" style={{ color: '#666666' }}>XS</Text>
              </View>
              
              <View style={styles.iconExample}>
                <Icon name="home" family="Ionicons" size="sm" color="primary" />
                <Spacer size="xs" />
                <Text variant="caption" style={{ color: '#666666' }}>SM</Text>
              </View>
              
              <View style={styles.iconExample}>
                <Icon name="home" family="Ionicons" size="md" color="primary" />
                <Spacer size="xs" />
                <Text variant="caption" style={{ color: '#666666' }}>MD</Text>
              </View>
              
              <View style={styles.iconExample}>
                <Icon name="home" family="Ionicons" size="lg" color="primary" />
                <Spacer size="xs" />
                <Text variant="caption" style={{ color: '#666666' }}>LG</Text>
              </View>
              
              <View style={styles.iconExample}>
                <Icon name="home" family="Ionicons" size="xl" color="primary" />
                <Spacer size="xs" />
                <Text variant="caption" style={{ color: '#666666' }}>XL</Text>
              </View>
            </View>
            
            <Spacer size="md" />
            <Divider />
            <Spacer size="md" />
            
            <Text variant="label" style={{ color: '#999999' }}>COMMON ICONS</Text>
            <Spacer size="xs" />
            
            <View style={styles.iconGrid}>
              <IconExample name="home" label="Home" />
              <IconExample name="search" label="Search" />
              <IconExample name="heart" label="Heart" />
              <IconExample name="person" label="User" />
              <IconExample name="car" label="Car" />
              <IconExample name="chatbubble" label="Chat" />
              <IconExample name="notifications" label="Bell" />
              <IconExample name="settings" label="Settings" />
            </View>
          </Card>
        </View>

        <Spacer size="lg" />
        <Divider />
        <Spacer size="lg" />

        {/* Spacer Section */}
        <View style={styles.section}>
          <Text variant="h3" color="text">Spacing</Text>
          <Spacer size="xs" />
          <Text variant="caption" style={{ color: '#666666' }}>
            Consistent spacing
          </Text>
          
          <Spacer size="md" />
          
          <Card variant="flat" padding="md">
            <SpacerExample label="XS (4px)" size="xs" />
            <SpacerExample label="SM (8px)" size="sm" />
            <SpacerExample label="MD (16px)" size="md" />
            <SpacerExample label="LG (24px)" size="lg" />
            <SpacerExample label="XL (32px)" size="xl" />
            <SpacerExample label="2XL (48px)" size="2xl" />
            <SpacerExample label="3XL (64px)" size="3xl" />
          </Card>
        </View>

        <Spacer size="lg" />

        {/* Footer */}
        <Card variant="elevated" padding="sm" style={styles.footer}>
          <Text variant="h4" align="center" color="text">Built with Design System</Text>
          <Spacer size="xs" />
          <Text variant="caption" align="center" style={{ color: '#666666' }}>
            All components enforce brand guidelines
          </Text>
          <Spacer size="xs" />
          <Divider />
          <Spacer size="xs" />
          <Text variant="caption" align="center" style={{ color: '#666666' }}>
            React Native • Expo • TypeScript
          </Text>
        </Card>

        <Spacer size="lg" />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
const ColorSwatch = ({ label, color, hex }: { label: string; color: string; hex: string }) => (
  <View style={styles.colorSwatchContainer}>
    <View style={[styles.colorSwatch, { backgroundColor: color }]} />
    <Spacer size="xs" />
    <Text variant="caption" weight="semibold" color="text">{label}</Text>
    <Text variant="caption" style={{ color: '#666666' }}>{hex}</Text>
  </View>
);

const IconExample = ({ name, label }: { name: string; label: string }) => (
  <View style={styles.iconExample}>
    <Icon name={name} family="Ionicons" size="lg" color="text" />
    <Spacer size="xs" />
    <Text variant="caption" style={{ color: '#666666' }}>{label}</Text>
  </View>
);

const TypeRow = ({ 
  variant, 
  label, 
  sample 
}: { 
  variant: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'label'; 
  label: string; 
  sample: string;
}) => (
  <View style={styles.typeRow}>
    <View style={styles.typeInfo}>
      <Text variant="caption" style={{ color: '#666666' }}>{label}</Text>
    </View>
    <View style={styles.typeSample}>
      <Text variant={variant}>{sample}</Text>
    </View>
  </View>
);

const SpacerExample = ({ label, size }: { label: string; size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' }) => (
  <View style={styles.spacerRow}>
    <Text variant="body" style={{ width: 120 }}>{label}</Text>
    <View style={styles.spacerBar}>
      <Spacer size={size} horizontal />
    </View>
  </View>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'], // Increased significantly to prevent text clipping
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: '#FFFFFF',
    overflow: 'visible', // Allow text to render outside bounds if needed
  },
  logo: {
    width: 60,
    height: 60,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md, // Increased top padding to prevent text clipping
    overflow: 'visible', // Allow text to render outside bounds if needed
  },
  
  // Colors
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'flex-start',
  },
  colorSwatchContainer: {
    alignItems: 'center',
    width: 90,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  
  // Badges
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  
  // Avatars
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  
  // Icons
  iconRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: Spacing.xs,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconExample: {
    alignItems: 'center',
    width: 70,
  },
  
  // Card Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Typography Row
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  typeInfo: {
    flex: 1,
  },
  typeSample: {
    alignItems: 'flex-end',
    marginLeft: Spacing.md,
  },
  
  // Spacer
  spacerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  spacerBar: {
    height: 20,
    backgroundColor: ThemeColors.primary,
    borderRadius: 4,
  },
  
  // Footer
  footer: {
    marginHorizontal: Spacing.lg,
  },
});
