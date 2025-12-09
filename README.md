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
- [x] Atomic Design system (Primitives, Atoms, Molecules)
- [x] Onboarding flow planning & documentation

### 🔄 In Progress
- [ ] Onboarding implementation (Splash → 3 slides → User type → Signup)
- [ ] Authentication screens with validation
- [ ] Business verification (ABN/License)

### ⏳ Planned
- [ ] Home screen with listing toggle
- [ ] Product listing components
- [ ] Vehicle detail screens
- [ ] Messaging system
- [ ] User profile & dashboard
- [ ] Search & filters

---

## � Knowledge Base: Onboarding Implementation

### Problem Statement
> *"Australia's wholesale vehicle trade is fragmented and costly. Dealers must use multiple platforms and manual processes to find verified stock, leading to slow deals, higher fees, and limited nationwide access."*

### Mission Statement
> *"AutoConnex provides a trusted digital marketplace where licensed dealers and wholesalers can quickly list, discover, and complete wholesale vehicle transactions with lower fees, built-in verification, and streamlined logistics."*

---

### User Personas (from Figma Research)

#### 1. **Jack** - The Fast-Mover Wholesaler
- **Location**: Brisbane, QLD
- **Volume**: ~550 vehicles/month
- **Pain Points**: High auction fees ($400-700/car), manual admin, buyer ghosting
- **Wants**: Faster sale cycles, nationwide reach, lower fees, auto compliance
- **Quote**: *"I want to move stock fast with good margins — not waste time on old systems and high auction fees."*

#### 2. **Maria** - The Margin Protector (Independent Dealer)
- **Location**: Melbourne, VIC
- **Inventory**: ~40 cars on lot
- **Target Vehicles**: Small cars + affordable SUVs
- **Pain Points**: Auctions expensive, late stock alerts, unclear transport pricing
- **Wants**: Steady stock flow, nationwide sourcing, price clarity, verified sellers
- **Quote**: *"I need reliable, profitable stock without chasing 10 different wholesalers every day."*

#### 3. **Reece** - The Carrier Manager (Transport Partner)
- **Location**: Sydney, NSW
- **Fleet**: 6 trucks (NSW ↔ QLD/VIC)
- **Pain Points**: Idle trucks during low auction weeks, manual quoting, paperwork errors
- **Wants**: Continuous job flow, digital bookings, predictable scheduling
- **Quote**: *"We have capacity — we just need more steady and predictable job flow."*

---

### Competitor Analysis (Reviewed from Figma)

| Platform | Strengths | Patterns to Adopt |
|----------|-----------|-------------------|
| **Cars24** | Progressive multi-step onboarding, strong verification | Step-by-step signup with progress indicator |
| **Spinny** | Clean card-based listings, trust indicators | Verification badges, professional UI |
| **Cartrade** | User type selection upfront, tiered access | "What brings you here?" screen |
| **Pickles Auctions** | Auction-focused, bid management | Offer/counter-offer system |
| **MotorPlatform** | B2B marketplace patterns | Business verification flow |

**Key Insight**: All successful platforms prioritize **trust** (verification badges) and **user type differentiation** (dealer vs wholesaler experiences).

---

### Onboarding Flow Chart (from Figma node 174:1399)

```
Splash (2-3s)
  ↓
Onboarding Carousel (3 slides)
  ├─ Slide 1: App Preview (listings grid)
  ├─ Slide 2: Features (PPSR, Search, Quotes)
  └─ Slide 3: Benefits (Lower fees, Faster, Verified)
  ↓
Welcome Screen
  └─ "What brings you here?"
     ├─ I am a Dealer (retail focus)
     └─ I am a Wholesaler (inventory focus)
  ↓
Multi-Step Signup
  ├─ Step 1: Name + Business Email + Phone
  ├─ Step 2: ABN/ACN Verification
  ├─ Step 3: License (LMCT/QLD Dealer License)
  └─ Step 4: Payment Terms & Card Details
  ↓
Home Screen
  ├─ Toggle: Available Listings ↔ My Listings
  ├─ Search Bar + Filters
  └─ Bottom Nav: Home | Search | Sell | Notifications | Account
```

---

### Technical Specifications

#### **Onboarding Assets**
- **Approach**: Use placeholder illustrations (simple geometric shapes with brand colors)
- **Icons**: Ionicons for features (shield-checkmark, search, flash, globe)
- **Storage**: `src/assets/images/onboarding/`
- **Format**: SVG or vector icons preferred, PNG fallback for illustrations

#### **Animations**
- **Style**: iOS-style slide animations with spring physics
- **Libraries**: React Native Reanimated 2 or Animated API
- **Transitions**:
  - Onboarding slides: Horizontal swipe with parallax effect
  - Screen transitions: Slide from right (iOS pattern)
  - Modals: Scale + fade with spring bounce
  - Success states: Checkmark scale animation

#### **Validation Rules**

##### Australian Phone Number
- **Format**: `+61 4XX XXX XXX`
- **Rules**:
  - Must start with `+61` or `04`
  - Mobile numbers start with `04` (after country code becomes `4`)
  - Total 10 digits after country code
  - No spaces/dashes in submission (formatting display only)
- **Example**: `+61 412 345 678` or `0412 345 678`
- **Regex**: `/^(\+61|0)4\d{8}$/`

##### Australian Business Number (ABN)
- **Format**: `XX XXX XXX XXX` (11 digits)
- **Rules**:
  - Must be exactly 11 digits
  - Checksum validation (weighted algorithm):
    1. Subtract 1 from first digit
    2. Multiply each digit by weights [10,1,3,5,7,9,11,13,15,17,19]
    3. Sum all products
    4. Result must be divisible by 89
- **Example**: `51 824 753 556`
- **Mock Lookup**: Simulate API call with 1-2s delay, return business name/address

```typescript
// ABN Checksum Validation
function validateABN(abn: string): boolean {
  const digits = abn.replace(/\s/g, '');
  if (digits.length !== 11) return false;
  
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const firstDigit = parseInt(digits[0]) - 1;
  let sum = firstDigit * weights[0];
  
  for (let i = 1; i < 11; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }
  
  return sum % 89 === 0;
}
```

##### Email
- **Format**: RFC 5322 compliant
- **Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Additional**: Check for common typos (gamil.com, yahooo.com)

##### License Number
- **Format**: State-specific (LMCT for QLD, Dealer License for NSW/VIC)
- **Rules**: Alphanumeric, 6-12 characters
- **Example**: `LMCT123456` (Queensland)

---

### Design Decisions & Rationale

#### 1. **User Type Selection Upfront**
**Why**: Competitors like Cars24 and Cartrade do this to personalize the experience.  
**Implementation**: 
- Dealers see "Buy" focused UI (Available Listings default)
- Wholesalers see "Sell" focused UI (My Listings default)
- Store in `AuthContext` as `userType: 'dealer' | 'wholesaler'`

#### 2. **Progressive Disclosure in Signup**
**Why**: Reduces cognitive load and drop-off rates.  
**Implementation**: 4-step wizard
1. Basic info (low friction)
2. Business verification (trust building)
3. License (compliance)
4. Payment (final commitment)

#### 3. **Mock ABN Lookup**
**Why**: Real ABR API requires ABN + paid tier. Mock for MVP.  
**Implementation**:
```typescript
// Mock ABN lookup service
const mockABNLookup = async (abn: string) => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
  
  const mockData = {
    '51824753556': { name: 'Tesla Motors Australia Pty Ltd', address: 'Sydney NSW' },
    '53004085616': { name: 'Toyota Australia', address: 'Melbourne VIC' },
    // Add more mock entries
  };
  
  return mockData[abn.replace(/\s/g, '')] || null;
};
```

#### 4. **Consent Transparency**
**Why**: Figma note: *"Ensure users consent to email sharing"*  
**Implementation**: Clear checkbox with info tooltip:
> ✓ *"I understand my email will be shared with buyers after sale confirmation for invoice delivery and direct communication."*

#### 5. **iOS-Style Animations**
**Why**: iOS users represent premium segment in automotive market.  
**Implementation**:
- Spring physics for natural feel (`useNativeDriver: true`)
- Gesture-based navigation (swipe back)
- Haptic feedback on important actions
- Smooth 60fps transitions

---

### Component Architecture (Atomic Design)

```
src/design-system/
├── primitives/          ✅ Colors, Typography, Spacing, Shadows
├── atoms/               ✅ Text, Button, Icon, Spacer, Divider
├── molecules/           ✅ Card, Input, Badge, Avatar
│   └── auth/            🆕 PhoneInput, EmailInput, ABNInput, LicenseInput
├── organisms/           🆕 TO BUILD
│   ├── OnboardingSlide.tsx
│   ├── OnboardingPagination.tsx
│   ├── OnboardingActions.tsx
│   ├── UserTypeCard.tsx
│   ├── FormWizard.tsx
│   ├── BusinessVerification.tsx
│   └── VerificationBadge.tsx
└── templates/           🆕 TO BUILD
    └── AuthTemplate.tsx
```

---

### Implementation Checklist

**Phase 1: Organisms & Molecules** (2-3 hours)
- [ ] OnboardingSlide organism (image + title + description)
- [ ] OnboardingPagination (dot indicators)
- [ ] OnboardingActions (Skip/Next/Get Started)
- [ ] PhoneInput molecule (+61 country code, validation)
- [ ] EmailInput molecule (RFC 5322 validation)
- [ ] ABNInput molecule (11 digits, checksum validation)
- [ ] LicenseInput molecule (state selection, alphanumeric)
- [ ] PasswordInput molecule (toggle visibility)

**Phase 2: Screens** (3-4 hours)
- [ ] SplashScreen (logo + tagline + gradient)
- [ ] OnboardingScreen (3 slides with carousel)
- [ ] WelcomeScreen (user type selection)
- [ ] SignupScreen (4-step wizard)
- [ ] PaymentSetupScreen (card details + consent)

**Phase 3: State & Navigation** (2 hours)
- [ ] AuthContext (user state, persist to AsyncStorage)
- [ ] Mock ABN lookup service
- [ ] Validation utilities (phone, email, ABN)
- [ ] Conditional navigation (AuthStack vs AppStack)
- [ ] HomeScreen with listing toggle

**Phase 4: Polish** (1-2 hours)
- [ ] iOS-style animations (spring physics)
- [ ] Loading states & spinners
- [ ] Success modal ("Welcome to AutoConnex!")
- [ ] Error handling & toast notifications
- [ ] Accessibility (screen readers, focus)

**Total Estimated Time**: 8-11 hours

---

### API Mock Services (MVP)

```typescript
// src/services/mockAPI.ts

// ABN Lookup (simulates ABR API)
export const mockABNLookup = async (abn: string) => {
  await delay(1500);
  const cleanABN = abn.replace(/\s/g, '');
  return mockABNDatabase[cleanABN] || null;
};

// License Verification (simulates state gov API)
export const mockLicenseVerify = async (license: string, state: string) => {
  await delay(1000);
  return { valid: true, type: 'LMCT', expiryDate: '2026-12-31' };
};

// User Registration
export const mockUserSignup = async (userData: SignupData) => {
  await delay(2000);
  return {
    success: true,
    userId: generateUUID(),
    verificationStatus: 'pending',
  };
};
```

---

### Testing Scenarios

#### Happy Path
1. ✅ Splash screen loads → auto-navigates after 3s
2. ✅ Swipe through 3 onboarding slides → tap "Get Started"
3. ✅ Select "I am a Dealer" → proceeds to signup
4. ✅ Enter valid name, email, phone → validates, proceeds
5. ✅ Enter valid ABN → auto-fills business name → proceeds
6. ✅ Enter valid license → shows verified badge → proceeds
7. ✅ Enter card details + check consents → submits
8. ✅ Success modal appears → navigates to Home screen
9. ✅ Home shows "Available Listings" (dealer default)

#### Error Paths
1. ❌ Invalid phone format → shows inline error
2. ❌ Invalid email → shows inline error
3. ❌ Invalid ABN (checksum fails) → shows error
4. ❌ ABN not found in mock DB → shows "Business not found"
5. ❌ Missing required field → prevents proceeding
6. ❌ Network error simulation → shows retry option

#### Edge Cases
- Back button during signup → confirms exit (unsaved data)
- App backgrounded during signup → persists form state
- Rapid tapping "Next" button → debounced, single submission
- Pasting text with spaces → auto-formats (phone/ABN)

---

### Accessibility Considerations

- **Screen Readers**: All inputs have labels, buttons have accessible names
- **Focus Management**: Auto-focus next input on form submission
- **Color Contrast**: All text meets WCAG AA (4.5:1 ratio)
- **Tap Targets**: Minimum 44x44pt (iOS), 48x48dp (Android)
- **Error Announcements**: Screen reader announces validation errors
- **Form Labels**: Associated with inputs via `accessibilityLabel`

---

## �👨‍💻 Development Notes

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
**Onboarding Knowledge Base v1.0.0**  
**Last Updated**: December 8, 2025
