# Auto Connex

> **Connect. Trade. Deliver.**

High-fidelity mobile prototype for an automotive marketplace platform. Built with React Native + Expo, deployable to iOS, Android, and Web.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development
npx expo start          # Mobile (scan QR with Expo Go)
npx expo start --web    # Web browser preview

# Deploy to Vercel
npm run deploy
```

---

## 📁 Project Structure

```
auto_connex/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/             # Screen views
│   │   ├── HomeScreen.tsx
│   │   └── DesignSystemScreen.tsx  # 👀 Design system showcase
│   ├── navigation/          # React Navigation setup
│   ├── constants/           
│   │   └── theme.ts         # ✨ Complete design system
│   ├── assets/              # Downloaded from Figma
│   │   ├── logos/          # Brand logos
│   │   ├── icons/          # 30+ icons (72x72@3x)
│   │   └── images/         # Product images
│   └── utils/              # Helper functions
├── App.tsx                  # Entry point + font loading
├── vercel.json              # Web deployment config
└── app.json                 # Expo configuration
```

---

## 🎨 Design System

### Brand Identity

**Tagline**: "Connect. Trade. Deliver."  
**Visual Language**: Modern, trustworthy, professional  
**Design Philosophy**: Clean communication meets data-driven trust

---

### 📦 Reusable Components

The design system is built using **Atomic Design methodology** for maximum reusability and consistency.

```typescript
// Import design system components
import { Text, Button, Card, Input, Badge, Avatar, Icon, Spacer, Divider } from '@/design-system';
import { Colors, Typography, Spacing } from '@/design-system/primitives';
```

#### **Quick Examples**

```tsx
// Typography with auto font selection
<Text variant="display">AutoConnex</Text>
<Text variant="h1">Dashboard</Text>
<Text variant="body">Vehicle listing details...</Text>

// Buttons with brand colors
<Button variant="primary" onPress={handleSubmit}>Submit Deal</Button>
<Button variant="accent" iconLeft="car" loading>Processing...</Button>

// Cards for content containers
<Card variant="elevated" padding="lg">
  <Text variant="h3">2024 Tesla Model 3</Text>
  <Badge variant="success" label="Available" />
</Card>

// Forms with brand styling
<Input 
  label="VIN Number"
  leftIcon="barcode"
  error="Invalid VIN"
/>

// Avatars with fallback initials
<Avatar name="John Smith" size="lg" />
```

---

### Typography

#### **Volkhov** - Data & Dashboards
- **Purpose**: Modern and professional typeface that enhances trust and clarity across high-volume automotive data
- **Usage**: Headers, dealer dashboards, data-heavy interfaces, quick decision-making moments
- **Weights**: 400 (Regular), 700 (Bold), with italic variants
- **Loaded via**: Google Fonts (`@expo-google-fonts/volkhov`)

**Variants**:
- `display`: 73px Bold - Logo, hero text
- `h1`: 48px Bold - Page titles
- `h2`: 40px Bold - Section headers

#### **Vesper Libre** - Listings & Transactions
- **Purpose**: Clean, smooth typeface crafted for simple communication in listings and transactional interfaces
- **Usage**: Body text, product listings, UI elements, ensuring every detail is easy to read and compare
- **Weights**: 400 (Regular), 500 (Medium), 700 (Bold), 900 (Black)
- **Loaded via**: Google Fonts (`@expo-google-fonts/vesper-libre`)

**Variants**:
- `h3`: 35px Regular - Subsection headers
- `h4`: 29px Regular - Small headers
- `body`: 24px Regular - Default body text (listings)
- `bodySmall`: 20px Regular - Secondary text
- `caption`: 16px Regular - Metadata, captions
- `label`: 14px Medium - Form labels, buttons

---

### Colors (from Figma brand_Identity Main)

```typescript
// Brand Colors (Auto Connex Official)
primary: '#0ABAB5'      // Primary teal - official brand color
secondary: '#008985'    // Secondary dark teal
accent: '#FF3864'       // Accent pink/coral for CTAs

// Supporting Palette
tealLight: '#51EAEA'    // Light teal from Figma gradients
tealMedium: '#1AC8FC'   // Medium cyan
tealDark: '#08605D'     // Dark teal

// Neutrals
text: '#050505'         // Primary text (near black from Figma)
textSecondary: '#F0F0F0' // Light gray ("Text Alt")
background: '#FFFFFF'   // Main background
backgroundAlt: '#F5F1E3' // Beige/cream from Figma
surface: '#F2F2F7'      // Cards, surfaces

// Semantic
success: '#08605D'      // Dark teal green (Figma)
warning: '#FF9500'      // Orange (Figma)
error: '#FF3864'        // Pink accent
info: '#1AC8FC'         // Bright cyan
```

---

### Component Variants

#### **Text** - Typography component
- `display`, `h1`, `h2`: Volkhov Bold (data-heavy content)
- `h3`, `h4`, `body`, `caption`, `label`: Vesper Libre (listings/transactions)
- Auto-applies correct font, size, weight from Figma specs

#### **Button** - Touchable actions
- `primary`: Teal #0ABAB5 (main actions)
- `secondary`: Dark teal #008985 (secondary actions)
- `accent`: Pink #FF3864 (CTAs, destructive)
- `outline`: Bordered transparent
- `ghost`: Text-only minimal
- **Sizes**: `sm`, `md`, `lg`
- **Features**: Icons, loading states, disabled states

#### **Card** - Content containers
- `flat`: No elevation
- `elevated`: Shadow for depth (default)
- `outlined`: Border without shadow
- **Padding**: `sm`, `md`, `lg`
- Optional `onPress` for touchable cards

#### **Input** - Form fields
- Vesper Libre font for readability
- Teal focus border (#0ABAB5)
- Pink error states (#FF3864)
- Icon support (left/right)
- Multiline, secure text entry support

#### **Badge** - Status indicators
- `success`: Dark teal #08605D
- `warning`: Orange #FF9500
- `error`: Pink #FF3864
- `info`: Cyan #1AC8FC
- **Sizes**: `sm`, `md`, `lg`
- **Dot mode**: Notification indicator

#### **Avatar** - User profiles
- Image or initials fallback (Volkhov Bold)
- Teal border (#0ABAB5)
- **Sizes**: `sm` (32), `md` (48), `lg` (64), `xl` (96)
- Optional badge overlay

#### **Icon** - Vector icons
- Wraps @expo/vector-icons
- **Sizes**: `xs` (16), `sm` (20), `md` (24), `lg` (32), `xl` (48)
- Integrates with brand colors

#### **Spacer** - Consistent spacing
- Eliminates hardcoded margins
- Uses theme spacing tokens

#### **Divider** - Visual separators
- Horizontal/vertical orientation
- Brand-compliant colors

---

### Spacing (8-point grid)

```
xs: 4px    sm: 8px    md: 16px   lg: 24px
xl: 32px   2xl: 48px  3xl: 64px  4xl: 120px
```

### Assets Downloaded

✅ **Brand Logos** (Teal #0ABAB5 - Official Auto Connex Brand):
- `logo-teal.png` (1117x460@3x) - Primary logo with car + handshake icon
- `app-icon-teal.png` (1688x1688@3x) - Square app icon variant
- `logo-with-tagline-teal.png` (1852x314@3x) - "AutoConnex" + "Trusted Deals Faster"
- `logo-lockup-teal.png` (1811x377@3x) - Compact lockup version
- `logo-primary.png` (1500x1500@3x) - Legacy placeholder (replace with teal variants)

✅ **Brand Colors Reference**:
- `color-swatches.png` (5526x2727@3x) - Complete color palette from Figma

✅ **Icons** (30+ icons at 72x72@3x):
- Navigation: home, search, filter, dashboard
- Actions: heart, star, check, x, plus, edit, trash
- Communication: message, bell, phone, mail
- Automotive: car, calendar, clock, map-pin
- Finance: dollar-circle, card
- UI: chevron-left, chevron-right, camera, photo, share, settings, user

**Note**: All logo variants now use the official Auto Connex teal (#0ABAB5) extracted directly from Figma brand guidelines.

---

## 🎯 Design System Demo

**View the complete design system**: Run the app and navigate to the **Design System** screen (initial route).

**Showcases**:
- ✅ Brand colors with hex values (Auto Connex teal palette)
- ✅ Typography (Volkhov for data, Vesper Libre for transactions)
- ✅ Button variants (Primary teal, Secondary, Outline)
- ✅ Icon library (30+ icons)
- ✅ Card components with shadows
- ✅ Spacing scale visualization
- ✅ Border radius examples

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native 0.81 |
| **Runtime** | Expo ~54 |
| **Language** | TypeScript |
| **Navigation** | React Navigation (Native Stack) |
| **Styling** | StyleSheet (primary) |
| **Fonts** | Google Fonts (Expo) |
| **Deployment** | Vercel (web), Expo Go (mobile) |

**Note**: NativeWind is installed but NOT actively used. This codebase uses React Native StyleSheet for all styling.

---

## 🎨 Development Workflow

### Figma-to-Code Process

This project follows a **design-first approach**:

1. **Extract Design Tokens** from Figma
   - Colors, typography, spacing → `src/constants/theme.ts`
   - Use MCP Figma to analyze design files

2. **Download Assets** from Figma
   - Logos → `src/assets/logos/`
   - Icons → `src/assets/icons/`
   - Images → `src/assets/images/`

3. **Build Components** matching Figma
   - Use StyleSheet with theme constants
   - TypeScript interfaces for all props
   - Platform-aware where needed

4. **Assemble Screens**
   - Import components
   - Match Figma layouts exactly
   - Test on mobile + web

5. **Deploy**
   - Web: `npm run deploy` (Vercel)
   - Mobile: Expo Go or EAS Build

### Component Pattern

```typescript
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ title, onPress, variant = 'primary' }: ButtonProps) {
  return (
    <TouchableOpacity style={[styles.button, styles[variant]]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  text: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
  },
});
```

---

## 📱 Platform Support

### Mobile (iOS & Android)
- **Development**: Expo Go app
- **Production**: EAS Build
- **Testing**: Scan QR code with phone camera

### Web
- **Development**: `npx expo start --web`
- **Production**: Vercel deployment
- **Build**: `npm run build:web` → `dist/`

### Platform-Specific Code

```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: Platform.OS === 'web' ? Spacing.md : Spacing.lg,
  },
});
```

---

## 🚢 Deployment

### Vercel (Web)

```bash
# Build for production
npm run build:web

# Deploy (first time)
vercel

# Deploy (subsequent)
npm run deploy
```

**Configuration**: See `vercel.json` for SPA routing setup.

### Mobile (Expo Go)

```bash
# Start development server
npx expo start

# On your phone:
# 1. Install Expo Go from App Store / Play Store
# 2. Scan QR code with camera (iOS) or Expo Go app (Android)
```

### Mobile (Production Build)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `src/constants/theme.ts` | **Complete design system** - Colors, Typography, Spacing, Shadows |
| `src/screens/DesignSystemScreen.tsx` | **Design system showcase** - Visual demo of all tokens |
| `App.tsx` | Entry point + **Google Fonts loading** |
| `src/navigation/index.tsx` | Navigation stack (React Navigation) |
| `vercel.json` | Web deployment configuration |
| `app.json` | Expo configuration (icons, splash, metadata) |

---

## 🎯 Design Principles

### 1. **Design Fidelity**
- ✅ Use exact hex colors from Figma
- ✅ Match typography (font, size, weight) precisely
- ✅ Follow 8-point grid spacing
- ✅ Pixel-perfect component matching

### 2. **Code Standards**
- ✅ **StyleSheet API** (NOT NativeWind classes)
- ✅ **Theme constants** (no hardcoded values)
- ✅ **TypeScript interfaces** for all components
- ✅ **Platform-aware** (web + mobile compatibility)

### 3. **Architecture**
- ✅ **Single codebase** for mobile + web
- ✅ **Reusable components** (DRY principle)
- ✅ **Centralized design tokens** (`theme.ts`)
- ✅ **Type-safe navigation** (TypeScript)

---

## 🧪 Testing

```bash
# Web
npx expo start --web

# iOS (simulator)
npx expo start --ios

# Android (emulator)
npx expo start --android

# Mobile (device)
npx expo start
# Scan QR code with Expo Go app
```

---

## 🔧 Troubleshooting

### Fonts not loading?
```bash
# Clear cache
npx expo start --clear

# Verify packages installed
npm list | grep google-fonts
```

### Web build fails?
```bash
# Rebuild
rm -rf dist/
npm run build:web
```

### Navigation errors?
- Ensure all screen names in `RootStackParamList` match `<Stack.Screen name="..."/>`
- Check TypeScript errors in IDE

### Assets not showing?
- Verify file paths in `require()` statements
- Check file extensions (.png, .jpg)
- Ensure files exist in `src/assets/`

---

## 📚 Resources

- **Figma File**: Auto Connex (Fk1RS9slxdVWvFOi3IQGaa)
- **React Native Docs**: https://reactnative.dev
- **Expo Docs**: https://docs.expo.dev
- **React Navigation**: https://reactnavigation.org
- **Google Fonts**: https://fonts.google.com

---

## 🏗️ Project Status

### ✅ Completed
- [x] Figma analysis via MCP
- [x] Asset download (logo + 30 icons)
- [x] Complete design system in `theme.ts`
- [x] Google Fonts integration
- [x] Design system demo screen
- [x] Navigation setup
- [x] Font loading in App.tsx

### 🔄 In Progress
- [ ] Additional icon downloads
- [ ] Product image assets
- [ ] Component library expansion

### ⏳ Planned
- [ ] Home screen implementation
- [ ] Product listing components
- [ ] Authentication screens
- [ ] Vehicle detail screens
- [ ] User profile screens

---

## 👨‍💻 Development Notes

### Adding a New Screen

1. Create screen file: `src/screens/NewScreen.tsx`
2. Add to navigation types:
```typescript
export type RootStackParamList = {
  // ...
  New: { id: string }; // Add screen with params
};
```
3. Add to stack navigator:
```typescript
<Stack.Screen name="New" component={NewScreen} />
```
4. Navigate: `navigation.navigate('New', { id: '123' })`

### Adding a New Component

1. Create: `src/components/ComponentName.tsx`
2. Import theme: `import { Colors, Typography, Spacing } from '../constants/theme';`
3. Use StyleSheet (NOT inline styles)
4. Export default and use in screens

### Updating Design Tokens

Edit `src/constants/theme.ts`:
- Colors: Add to `Colors` object
- Typography: Update `Typography.fontSize` or `fontFamily`
- Spacing: Add to `Spacing` object
- Never hardcode values in components

---

## 📄 License

Private project - All rights reserved

---

## 🤝 Contributing

Internal project - Follow these guidelines:

1. **Branch naming**: `feature/screen-name` or `fix/bug-description`
2. **Commit messages**: Clear, descriptive
3. **Code style**: Follow existing patterns
4. **Testing**: Test on iOS, Android, and Web before PR
5. **Design fidelity**: Match Figma exactly

---

**Built with ❤️ using React Native + Expo**  
**Design System v1.0.0**  
**Last Updated**: December 8, 2025
