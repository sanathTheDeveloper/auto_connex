# Purchases and Offers Feature - Complete Implementation Plan

## 📋 Executive Summary

**Feature Name**: Purchases and Offers Management System  
**Branch**: `purchaseAndOffer`  
**Design Pattern**: 4-tab animated interface (matching WelcomeScreen tab switcher)  
**User Access**: All users (Dealers & Wholesalers see all tabs)  
**Primary Goal**: Centralized hub for managing all purchase/offer transactions

### Key Decisions:
✅ **No Invoice Generation** - Simplified flow, just navigate to Messages  
✅ **No Counter Offers** - Binary Approve/Decline only  
✅ **No Time Expiry** - Offers remain active until actioned  
✅ **Badge Notifications** - Show pending count in drawer menu  
✅ **Universal Access** - All users see all 4 tabs  
✅ **Tab Design** - Use WelcomeScreen's animated tab switcher pattern

---

## 🎯 Feature Requirements (From Flowchart Analysis)

### User Flow:
```
Purchases and Offers Screen
├── Tab 1: Incoming Offers (offers received on your listings)
│   ├── List of offers from buyers
│   ├── Per-item actions:
│   │   ├── Approve → Navigate to Messages with approved flag
│   │   ├── Decline → Mark as declined, remove from active list
│   │   └── View Listing → Navigate to VehicleDetails of the listing
│   └── Empty state: "No incoming offers yet"
│
├── Tab 2: Offers Sent (offers you made on other vehicles)
│   ├── List of offers you submitted
│   ├── Status indicators: Pending, Approved, Declined
│   ├── Tap to view details → Navigate to Messages thread
│   └── Empty state: "You haven't made any offers yet"
│
├── Tab 3: Purchases (confirmed purchases you made)
│   ├── List of vehicles purchased (purchase confirmed via payment)
│   ├── Shows: Vehicle details, purchase date, amount paid
│   ├── Tap to view → Navigate to Messages for transaction history
│   └── Empty state: "No purchases yet"
│
└── Tab 4: Sold List (vehicles from your listings that sold)
    ├── List of your listings that sold (status='sold' from MyListingsContext)
    ├── Shows: Vehicle details, sold date, final price
    ├── Tap to view → Navigate to Messages for sale history
    └── Empty state: "No sold vehicles yet"
```

---

---

## 🏗️ Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     App.tsx                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         PurchasesOffersProvider (NEW)                   │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  AuthProvider → SellProvider → FavoritesProvider  │  │ │
│  │  │  → MyListingsProvider                             │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Navigation Stack                            │
├─────────────────────────────────────────────────────────────┤
│  Home → VehicleDetails → [Make Offer/Purchase]              │
│    ↓                           ↓                             │
│  DrawerMenu → [Purchases & Offers] → PurchasesOffersScreen  │
│    ↓                                      ↓                  │
│  Badge Count (pending)            4 Tabs with Actions       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Data Flow & Persistence                         │
├─────────────────────────────────────────────────────────────┤
│  AsyncStorage (@auto_connex:purchases_offers)               │
│  ├── offersSent[]                                           │
│  ├── offersReceived[]                                       │
│  ├── purchases[]                                            │
│  └── soldVehicles[]                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Component 1: PurchasesOffersContext

**Location**: `src/contexts/PurchasesOffersContext.tsx`  
**Purpose**: Global state management for all purchase and offer transactions  
**Storage Key**: `@auto_connex:purchases_offers`

### Data Models (TypeScript Interfaces):
```typescript
// Offer sent by a user on another vehicle
export interface OfferSent {
  offerId: string;
  vehicleId: string;
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    imageKey: VehicleImageKey;
  };
  sellerId: string;
  sellerName: string;
  offerAmount: number;
  askingPrice: number;
  message?: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  updatedAt: string;
}

// Offer received on user's listing
export interface OfferReceived {
  offerId: string;
  listingId: string;
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    imageKey: VehicleImageKey;
  };
  buyerId: string;
  buyerName: string;
  offerAmount: number;
  askingPrice: number;
  message?: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  updatedAt: string;
}

// Confirmed purchase
export interface Purchase {
  purchaseId: string;
  vehicleId: string;
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    imageKey: VehicleImageKey;
  };
  sellerId: string;
  sellerName: string;
  purchaseAmount: number;
  purchaseDate: string;
  paymentMethod: string;
}

// Sold vehicle (from user's listings)
export interface SoldVehicle {
  soldId: string;
  listingId: string;
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    imageKey: VehicleImageKey;
  };
  buyerId: string;
  buyerName: string;
  saleAmount: number;
  saleDate: string;
}
```

**Context Methods**:
```typescript
interface PurchasesOffersContextValue {
  // State
  offersSent: OfferSent[];
  offersReceived: OfferReceived[];
  purchases: Purchase[];
  soldVehicles: SoldVehicle[];
  isLoading: boolean;
  
  // Offers Sent Actions
  addOfferSent: (offer: Omit<OfferSent, 'offerId' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<string>;
  
  // Offers Received Actions
  addOfferReceived: (offer: Omit<OfferReceived, 'offerId' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<string>;
  approveOffer: (offerId: string) => Promise<void>;
  declineOffer: (offerId: string) => Promise<void>;
  
  // Purchase Actions
  addPurchase: (purchase: Omit<Purchase, 'purchaseId' | 'purchaseDate'>) => Promise<string>;
  
  // Sold Vehicle Actions
  addSoldVehicle: (sold: Omit<SoldVehicle, 'soldId' | 'saleDate'>) => Promise<string>;
  
  // Getters
  getPendingOffersReceivedCount: () => number;
  getPendingOffersSentCount: () => number;
  getOfferById: (offerId: string) => OfferSent | OfferReceived | null;
  
  // Refresh
  refreshData: () => Promise<void>;
}
```

---

---

## 📦 Component 2: PurchasesOffersScreen

**Location**: `src/screens/PurchasesOffersScreen.tsx`  
**Design Pattern**: 4-tab animated interface (matching WelcomeScreen)  
**Layout**: SafeAreaView → ScrollView → Tab Switcher → Animated Content

### Screen Structure

```tsx
<SafeAreaView style={styles.container}>
  <View style={styles.innerContainer}>
    {/* Fixed Header */}
    <View style={styles.header}>
      <Text variant="h2" weight="bold">Purchases & Offers</Text>
    </View>
    
    <Spacer size="md" />
    
    {/* Tab Switcher - matching WelcomeScreen pattern */}
    <View style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tabBackground}>
          <Animated.View style={[styles.tabIndicator, { transform: [{ translateX }] }]} />
          
          <TabButton label="Incoming" badge={pendingIncomingCount} isActive={activeTab === 0} />
          <TabButton label="Sent" badge={pendingSentCount} isActive={activeTab === 1} />
          <TabButton label="Purchases" isActive={activeTab === 2} />
          <TabButton label="Sold" isActive={activeTab === 3} />
        </View>
      </ScrollView>
    </View>
    
    <Spacer size="lg" />
    
    {/* Animated Content Area */}
    <Animated.View style={[{ opacity: contentFade, transform: [{ translateX: contentSlide }] }]}>
      <ScrollView contentContainerStyle={styles.contentArea}>
        {activeTab === 0 && <IncomingOffersTab />}
        {activeTab === 1 && <OffersSentTab />}
        {activeTab === 2 && <PurchasesTab />}
        {activeTab === 3 && <SoldListTab />}
      </ScrollView>
    </Animated.View>
  </View>
</SafeAreaView>
```

### Tab Switcher Animation Logic

**Key Animation Values** (matching WelcomeScreen):
```typescript
const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
const contentFadeAnim = useRef(new Animated.Value(1)).current;
const contentSlideAnim = useRef(new Animated.Value(0)).current;

// Calculate tab width dynamically
const tabWidth = (containerWidth - spacingXl * 2 - spacingXs * 2 - 8) / 4; // 4 tabs

// Indicator position interpolation
const indicatorTranslateX = tabIndicatorAnim.interpolate({
  inputRange: [0, 1, 2, 3],
  outputRange: [0, tabWidth, tabWidth * 2, tabWidth * 3],
});

// Tab change animation sequence
const handleTabChange = (newTab: number) => {
  // 1. Fade out current content
  Animated.parallel([
    Animated.timing(contentFadeAnim, { toValue: 0, duration: 150 }),
    Animated.timing(contentSlideAnim, { toValue: newTab > activeTab ? -20 : 20, duration: 150 }),
  ]).start(() => {
    // 2. Switch content
    setActiveTab(newTab);
    
    // 3. Fade in new content
    Animated.parallel([
      Animated.timing(contentFadeAnim, { toValue: 1, duration: 200 }),
      Animated.spring(contentSlideAnim, { toValue: 0, tension: 120, friction: 14 }),
    ]).start();
  });
  
  // 4. Slide tab indicator
  Animated.spring(tabIndicatorAnim, {
    toValue: newTab,
    tension: 120,
    friction: 14,
  }).start();
};
```

### UI Components Breakdown

**1. Header Component**:
```tsx
interface HeaderProps {
  onMenuPress: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuPress }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
      <Ionicons name="menu-outline" size={24} color={Colors.text} />
    </TouchableOpacity>
    <Text variant="h2" weight="bold">Purchases & Offers</Text>
    <View style={styles.headerSpacer} /> {/* Balance layout */}
  </View>
);
```

**2. Tab Button Component**:
```tsx
interface TabButtonProps {
  label: string;
  badge?: number;
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, badge, isActive, onPress }) => (
  <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.8}>
    <Text
      variant="bodySmall"
      weight="semibold"
      style={isActive ? styles.tabTextActive : styles.tabText}
    >
      {label}
    </Text>
    {badge !== undefined && badge > 0 && (
      <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
        <Text variant="caption" style={styles.tabBadgeText}>
          {badge}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);
```

**3. Tab Switcher Design** (responsive for 4 tabs):
```tsx
// 4-tab layout with scrollable tabs if needed on small screens
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  <View style={styles.tabBackground}>
    <Animated.View style={[styles.tabIndicator, { transform: [{ translateX }] }]} />
    
    <TabButton label="Incoming" badge={pendingIncomingCount} />
    <TabButton label="Sent" badge={pendingSentCount} />
    <TabButton label="Purchases" />
    <TabButton label="Sold" />
  </View>
</ScrollView>
```

**Card Designs**:

**Incoming Offer Card**:
```
┌─────────────────────────────────────┐
│ [Vehicle Image]  2024 Toyota Camry  │
│                  Year • Mileage     │
│                                     │
│ Offer: $42,000                      │
│ Asking: $45,000                     │
│ From: John's Wholesale              │
│                                     │
│ "Interested in quick purchase..."   │
│                                     │
│ [Approve] [Decline] [View Listing]  │
│                                     │
│ Received 2 hours ago                │
└─────────────────────────────────────┘
```

**Offer Sent Card**:
```
┌─────────────────────────────────────┐
│ [Vehicle Image]  2024 Honda Accord  │
│                  Year • Mileage     │
│                                     │
│ Your Offer: $38,000                 │
│ Status: [Pending Badge]             │
│ To: ABC Motors                      │
│                                     │
│ Sent 1 day ago                      │
│                                     │
│ [Tap to view conversation]          │
└─────────────────────────────────────┘
```

**Purchase Card**:
```
┌─────────────────────────────────────┐
│ [Vehicle Image]  2024 Mazda CX-5    │
│                  Year • Mileage     │
│                                     │
│ Purchased: $52,000                  │
│ From: Premier Wholesale             │
│ Date: 3 Jan 2026                    │
│                                     │
│ [View Transaction]                  │
└─────────────────────────────────────┘
```

**Sold Card**:
```
┌─────────────────────────────────────┐
│ [Vehicle Image]  2023 Tesla Model 3 │
│                  Year • Mileage     │
│                                     │
│ Sold for: $58,000                   │
│ To: City Dealers                    │
│ Date: 1 Jan 2026                    │
│                                     │
│ [View Transaction]                  │
└─────────────────────────────────────┘
```

---

---

## 🎴 Card Component Designs

### Card Component Architecture

**Base Card Component**:
```tsx
interface BaseCardProps {
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    imageKey: VehicleImageKey;
    mileage?: number;
  };
  children: React.ReactNode;
  onPress: () => void;
}

const BaseCard: React.FC<BaseCardProps> = ({ vehicleDetails, children, onPress }) => {
  const imageSource = getVehicleImage(vehicleDetails.imageKey);
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.98}>
      <View style={styles.cardContent}>
        {/* Vehicle Image */}
        <Image source={imageSource} style={styles.cardImage} />
        
        {/* Vehicle Info */}
        <View style={styles.cardInfo}>
          <Text variant="body" weight="semibold" numberOfLines={1}>
            {vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model}
          </Text>
          {vehicleDetails.mileage && (
            <Text variant="caption" color="textMuted">
              {formatMileage(vehicleDetails.mileage)}
            </Text>
          )}
          
          {/* Card-specific content */}
          {children}
        </View>
      </View>
    </TouchableOpacity>
  );
};
```

---

## 🔌 Integration Points

#### A. **VehicleDetailsScreen Updates**
Location: `src/screens/VehicleDetailsScreen.tsx`

**Changes Needed**:
```typescript
// Import context
import { usePurchasesOffers } from '../contexts/PurchasesOffersContext';

// In component
const { addOfferSent, addPurchase } = usePurchasesOffers();

// Update handlePaymentSuccess (line ~268)
const handlePaymentSuccess = useCallback(async (paymentData: PaymentData) => {
  if (!vehicle) return;
  setSubscriptionCardVisible(false);

  if (paymentActionType === 'purchase') {
    // Record purchase in context
    await addPurchase({
      vehicleId: vehicle.id,
      vehicleDetails: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        mileage: vehicle.mileage,
        imageKey: vehicle.imageKey,
      },
      sellerId: vehicle.dealer,
      sellerName: vehicle.dealerName,
      purchaseAmount: displayPrice,
      paymentMethod: paymentData.method,
    });
    
    // Navigate to messages
    navigation.navigate('Messages', {
      vehicleId: vehicle.id,
      isPurchase: true,
      purchaseMessage: purchaseMessage || undefined,
    });
  } else {
    // Record offer sent in context
    await addOfferSent({
      vehicleId: vehicle.id,
      vehicleDetails: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        imageKey: vehicle.imageKey,
      },
      sellerId: vehicle.dealer,
      sellerName: vehicle.dealerName,
      offerAmount: displayPrice,
      askingPrice: askingPrice,
      message: offerMessage || undefined,
    });
    
    // Navigate to messages
    navigation.navigate('Messages', {
      vehicleId: vehicle.id,
      offerAmount: displayPrice,
      offerMessage: offerMessage || undefined,
    });
  }
  
  // Reset states...
}, [vehicle, navigation, paymentActionType, displayPrice, offerMessage, purchaseMessage, addPurchase, addOfferSent, askingPrice]);
```

#### B. **DrawerMenu Updates**
Location: `src/components/DrawerMenu.tsx`

**Add Menu Item**:
```typescript
const MENU_ITEMS: MenuItem[] = [
  { id: 'marketplace', label: 'Marketplace', icon: 'car-sport-outline', screen: 'Home' },
  { id: 'sell-vehicle', label: 'Sell Vehicle', icon: 'pricetag-outline', screen: 'RegoLookup' },
  { id: 'my-listings', label: 'My Listings', icon: 'list-outline', screen: 'MyListings' },
  
  // NEW ITEM
  { 
    id: 'purchases-offers', 
    label: 'Purchases & Offers', 
    icon: 'receipt-outline', 
    screen: 'PurchasesOffers',
    badge: pendingOffersCount, // Dynamic badge
  },
  
  { id: 'saved', label: 'Favorites', icon: 'heart-outline', screen: 'SavedVehicles' },
  { id: 'messages', label: 'Messages', icon: 'chatbubbles-outline', screen: 'ConversationList', badge: 5, dividerAfter: true },
  // ... rest
];

// Add badge count calculation
const { getPendingOffersReceivedCount } = usePurchasesOffers();
const pendingOffersCount = getPendingOffersReceivedCount();
```

#### C. **Navigation Updates**
Location: `src/navigation/index.tsx`

**Add Route**:
```typescript
export type RootStackParamList = {
  // ... existing routes
  PurchasesOffers: undefined;
};

// In navigator
import PurchasesOffersScreen from '../screens/PurchasesOffersScreen';

<Stack.Screen 
  name="PurchasesOffers" 
  component={PurchasesOffersScreen}
  options={{ headerShown: false }}
/>
```

#### D. **Context Provider Setup**
Location: `App.tsx`

**Wrap with Provider**:
```tsx
import { PurchasesOffersProvider } from './src/contexts/PurchasesOffersContext';

// In App component
<PurchasesOffersProvider>
  <AuthProvider>
    <SellProvider>
      <FavoritesProvider>
        <MyListingsProvider>
          {/* ... */}
        </MyListingsProvider>
      </FavoritesProvider>
    </SellProvider>
  </AuthProvider>
</PurchasesOffersProvider>
```

---

## 🎨 Design System Compliance

### Typography:
- **Tab Labels**: `bodySmall` variant (Vesper Libre)
- **Card Titles**: `h4` variant (Vesper Libre Bold)
- **Vehicle Names**: `body` variant (Vesper Libre Semibold)
- **Prices**: `h3` variant (Volkhov Bold) - data-heavy
- **Status Text**: `caption` variant (Vesper Libre)
- **Empty State**: `body` + `caption` variants

### Colors:
- **Primary Actions** (Approve): `Colors.success` (#08605D)
- **Destructive Actions** (Decline): `Colors.accent` (#FF3864)
- **Neutral Actions** (View): `Colors.secondary` (#008985)
- **Status Badges**:
  - Pending: `Colors.warning` (#FF9500)
  - Approved: `Colors.success` (#08605D)
  - Declined: `Colors.textMuted` (#6B7280)
- **Tab Indicator**: `Colors.primary` (#0ABAB5)
- **Card Background**: `Colors.white`
- **Screen Background**: `#EBEEF2` (matches HomeScreen)

### Spacing:
- Use `Spacing` / `SpacingMobile` tokens from primitives
- Apply responsive spacing: `getResponsiveSpacing(size, viewportWidth)`
- Card padding: `Spacing.lg` (20px mobile)
- Tab padding: `Spacing.md` (16px mobile)
- Card gaps: `Spacing.md` (16px mobile)

### Components to Use:
- `<Text>` from design-system (never raw React Native)
- `<Button>` with variants: `primary`, `success`, `accent`, `outline`
- `<Spacer>` for consistent spacing
- `<Badge>` for status indicators
- `<Card>` (or custom styled View with shadows)
- `SafeAreaView` wrapper (always)
- `Platform.OS === 'web' ? 480 : '100%'` for max width constraint

---

## 📱 Responsive Behavior

### Mobile (≤480px):
- Full-width cards with `SpacingMobile` padding
- Stacked action buttons (vertical)
- 2-line truncation for messages
- Tab labels may wrap or use icons only if space constrained

### Web/Tablet (>480px):
- Max width 480px, centered
- Horizontal action buttons
- Full message preview
- Tab labels always visible

### Dimension Tracking:
```typescript
const [viewportWidth, setViewportWidth] = useState(() => Dimensions.get('window').width);

useEffect(() => {
  const subscription = Dimensions.addEventListener('change', ({ window }) => {
    setViewportWidth(window.width);
  });
  return () => subscription?.remove();
}, []);
```

---

## 🔄 State Management Flow

### Offer Flow:
```
User makes offer on VehicleDetailsScreen
  ↓
VehicleDetailsScreen.handlePaymentSuccess() calls addOfferSent()
  ↓
PurchasesOffersContext adds to offersSent array + persists to AsyncStorage
  ↓
Seller sees offer in PurchasesOffersScreen > Incoming Offers tab
  ↓
Seller taps "Approve" → approveOffer(offerId)
  ↓
Context updates offer status to 'approved' in offersReceived
  ↓
Context finds matching offerSent and updates status to 'approved'
  ↓
Navigate to Messages with approved flag
  ↓
(Future: Convert approved offer to Purchase when payment confirmed)
```

### Purchase Flow:
```
User taps "Purchase Now" on VehicleDetailsScreen
  ↓
VehicleDetailsScreen.handlePaymentSuccess() calls addPurchase()
  ↓
PurchasesOffersContext adds to purchases array + persists
  ↓
User sees purchase in PurchasesOffersScreen > Purchases tab
  ↓
(Future: Update seller's soldVehicles when purchase confirmed)
```

---

## 🧪 Mock Data Strategy

Since this is a prototype with mock backend, populate with realistic sample data:

**Location**: `src/contexts/PurchasesOffersContext.tsx`

```typescript
const MOCK_OFFERS_SENT: OfferSent[] = [
  {
    offerId: 'offer-sent-1',
    vehicleId: 'tesla-model3',
    vehicleDetails: {
      make: 'Tesla',
      model: 'Model 3',
      year: 2024,
      imageKey: 'tesla-model3',
    },
    sellerId: 'seller-1',
    sellerName: 'Premier Wholesale',
    offerAmount: 58000,
    askingPrice: 62000,
    message: 'Interested in quick purchase if we can agree on price.',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Add 2-3 more samples
];

const MOCK_OFFERS_RECEIVED: OfferReceived[] = [
  {
    offerId: 'offer-recv-1',
    listingId: 'listing-1',
    vehicleDetails: {
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      imageKey: 'toyota-camry',
    },
    buyerId: 'buyer-1',
    buyerName: 'City Motors',
    offerAmount: 42000,
    askingPrice: 45000,
    message: 'Can you do $42k? Cash buyer ready to collect this week.',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  // Add 2-3 more samples
];

// Initialize with mock data in development
const [state, setState] = useState({
  offersSent: __DEV__ ? MOCK_OFFERS_SENT : [],
  offersReceived: __DEV__ ? MOCK_OFFERS_RECEIVED : [],
  purchases: __DEV__ ? MOCK_PURCHASES : [],
  soldVehicles: __DEV__ ? MOCK_SOLD_VEHICLES : [],
  isLoading: false,
});
```

---

---

## ✅ Implementation Checklist (Step-by-Step)

### 🏗️ Phase 1: Foundation Setup (Day 1)

**1.1 Create Context Structure**
```bash
# Create new context file
touch src/contexts/PurchasesOffersContext.tsx
```

**Tasks**:
- [ ] Copy context template structure from `MyListingsContext.tsx`
- [ ] Define TypeScript interfaces: `OfferSent`, `OfferReceived`, `Purchase`, `SoldVehicle`
- [ ] Define context state interface: `PurchasesOffersContextState`
- [ ] Define context actions interface: `PurchasesOffersContextActions`
- [ ] Create context: `const PurchasesOffersContext = createContext<...>()`
- [ ] Add storage key: `const STORAGE_KEY = '@auto_connex:purchases_offers'`

**1.2 Implement Context Provider**

**Tasks**:
- [ ] Create `PurchasesOffersProvider` component
- [ ] Initialize state with empty arrays and `isLoading: true`
- [ ] Implement `loadData()` method with AsyncStorage.getItem()
- [ ] Implement `saveData()` method with AsyncStorage.setItem()
- [ ] Add `useEffect` to call `loadData()` on mount
- [ ] Create mock data constants: `MOCK_OFFERS_SENT`, `MOCK_OFFERS_RECEIVED`, `MOCK_PURCHASES`, `MOCK_SOLD_VEHICLES`
- [ ] Use mock data in development: `__DEV__ ? MOCK_DATA : []`

**1.3 Implement Context Methods**

**Tasks**:
- [ ] `addOfferSent()`: Generate ID, set status='pending', add to array, save
- [ ] `addOfferReceived()`: Generate ID, set status='pending', add to array, save
- [ ] `approveOffer()`: Find offer, update status to 'approved', save
- [ ] `declineOffer()`: Find offer, update status to 'declined', save
- [ ] `addPurchase()`: Generate ID, set purchaseDate, add to array, save
- [ ] `addSoldVehicle()`: Generate ID, set saleDate, add to array, save
- [ ] `getPendingOffersReceivedCount()`: Filter and count pending received offers
- [ ] `getPendingOffersSentCount()`: Filter and count pending sent offers
- [ ] `getOfferById()`: Search both offersSent and offersReceived by ID
- [ ] `refreshData()`: Reload from AsyncStorage

**1.4 Export Hook**

**Tasks**:
- [ ] Create `usePurchasesOffers()` hook
- [ ] Add error handling for context undefined
- [ ] Export hook and provider

**1.5 Integrate Provider**

**Tasks**:
- [ ] Import `PurchasesOffersProvider` in `App.tsx`
- [ ] Wrap existing providers (place above AuthProvider for highest level)
- [ ] Verify app still runs without errors

**Verification**:
```bash
npx expo start --clear
# App should load without errors
# Check console for "[PurchasesOffersContext] Loaded data" logs (if you add them)
```

---

### 📱 Phase 2: Screen Creation (Day 2)

**2.1 Create Screen File**
```bash
touch src/screens/PurchasesOffersScreen.tsx
```

**Tasks**:
- [ ] Create functional component with TypeScript: `export const PurchasesOffersScreen: React.FC<Props>`
- [ ] Import navigation types: `NativeStackNavigationProp`, `RootStackParamList`
- [ ] Import design system: `Text`, `Button`, `Spacer` from `@/design-system`
- [ ] Import primitives: `Colors`, `Spacing`, `SpacingMobile`, `BorderRadius`, `Shadows`
- [ ] Import context hook: `usePurchasesOffers()`
- [ ] Set up SafeAreaView container with responsive max-width constraint

**2.2 Implement State Management**

**Tasks**:
- [ ] Add state: `const [activeTab, setActiveTab] = useState<number>(0)`
- [ ] Add state: `const [viewportWidth, setViewportWidth] = useState(Dimensions.get('window').width)`
- [ ] Add animation refs: `tabIndicatorAnim`, `contentFadeAnim`, `contentSlideAnim`
- [ ] Add Dimensions event listener in useEffect
- [ ] Calculate responsive values: `containerWidth`, `tabWidth`, `responsiveSpacing`

**2.3 Build Tab Switcher UI**

**Tasks**:
- [ ] Create `TabButton` sub-component (inside same file or separate)
- [ ] Implement tab container with ScrollView (horizontal)
- [ ] Add `tabBackground` view with border and shadow
- [ ] Add animated tab indicator: `Animated.View` with translateX interpolation
- [ ] Add 4 tab buttons: "Incoming", "Sent", "Purchases", "Sold"
- [ ] Add badge counts to "Incoming" and "Sent" tabs
- [ ] Style active/inactive states (text color, background)

**2.4 Implement Tab Animation**

**Tasks**:
- [ ] Create `handleTabChange(newTab: number)` function
- [ ] Implement fade-out animation (150ms)
- [ ] Update activeTab state
- [ ] Implement fade-in animation (200ms with spring)
- [ ] Implement tab indicator slide animation (spring)
- [ ] Test smooth transitions between all tabs

**2.5 Create Tab Content Components**

**Tasks**:
- [ ] Create `IncomingOffersTab` component (render list or empty state)
- [ ] Create `OffersSentTab` component (render list or empty state)
- [ ] Create `PurchasesTab` component (render list or empty state)
- [ ] Create `SoldListTab` component (render list or empty state)
- [ ] Implement conditional rendering based on `activeTab`
- [ ] Wrap content in Animated.View with opacity and translateX

**2.6 Build Empty States**

**Tasks**:
- [ ] Create reusable `EmptyState` component
- [ ] Props: `icon`, `title`, `description`
- [ ] Style with center alignment, icon (Ionicons), text (design system)
- [ ] Use in all 4 tab components when data array is empty

**Verification**:
```typescript
// Add to navigation temporarily for testing
<Stack.Screen name="PurchasesOffers" component={PurchasesOffersScreen} />

// Navigate from HomeScreen
navigation.navigate('PurchasesOffers');
```

---

### 🎴 Phase 3: Card Components (Day 3)

**3.1 Create Base Card Component**

**Tasks**:
- [ ] Create `BaseCard` component (reusable wrapper)
- [ ] Props: `vehicleDetails`, `children`, `onPress`
- [ ] Add vehicle image: `getVehicleImage(imageKey)`
- [ ] Add vehicle title: Year Make Model
- [ ] Add mileage if available
- [ ] Style with white background, border radius, shadow
- [ ] Add TouchableOpacity wrapper with activeOpacity={0.98}

**3.2 Build IncomingOfferCard**

**Tasks**:
- [ ] Extend `BaseCard` with offer-specific fields
- [ ] Display offer amount vs asking price
- [ ] Display buyer name ("From: ...")
- [ ] Display message (truncate to 2 lines with numberOfLines={2})
- [ ] Add 3 action buttons: Approve (success), Decline (accent), View Listing (outline)
- [ ] Display relative timestamp ("5 hours ago")
- [ ] Add `Spacer` between sections

**3.3 Build OfferSentCard**

**Tasks**:
- [ ] Extend `BaseCard` with sent offer fields
- [ ] Display offer amount
- [ ] Add status badge component (Pending/Approved/Declined)
- [ ] Display seller name ("To: ...")
- [ ] Display relative timestamp
- [ ] Make entire card tappable (navigate to Messages)
- [ ] Add right chevron icon indicator

**3.4 Build PurchaseCard**

**Tasks**:
- [ ] Extend `BaseCard` with purchase fields
- [ ] Display purchase amount (use h3 variant, Volkhov font)
- [ ] Display seller name
- [ ] Display formatted date (e.g., "3 Jan 2026")
- [ ] Add "View Transaction" button
- [ ] Style with success color accent

**3.5 Build SoldCard**

**Tasks**:
- [ ] Extend `BaseCard` with sold vehicle fields
- [ ] Display sale amount (use h3 variant, Volkhov font)
- [ ] Display buyer name
- [ ] Display formatted date
- [ ] Add "View Transaction" button
- [ ] Style with primary color accent

**3.6 Integrate Cards into Tabs**

**Tasks**:
- [ ] Import cards into `PurchasesOffersScreen`
- [ ] Map `offersReceived` to `IncomingOfferCard` components in tab 0
- [ ] Map `offersSent` to `OfferSentCard` components in tab 1
- [ ] Map `purchases` to `PurchaseCard` components in tab 2
- [ ] Map `soldVehicles` to `SoldCard` components in tab 3
- [ ] Add spacing between cards (use `gap` or `marginBottom`)
- [ ] Wrap in ScrollView with contentContainerStyle

**Verification**:
- Mock data should display as cards
- Scrolling should work smoothly
- Empty states should show when arrays are empty

---

### ⚡ Phase 4: Actions & Navigation (Day 4)

**4.1 Implement Approve Action**

**Tasks**:
- [ ] Create `handleApprove(offerId: string)` function
- [ ] Call `approveOffer(offerId)` from context
- [ ] Show success feedback (Alert or toast)
- [ ] Navigate to Messages: `navigation.navigate('Messages', { offerApproved: true })`
- [ ] Update UI optimistically (remove from pending list)

**4.2 Implement Decline Action**

**Tasks**:
- [ ] Create `handleDecline(offerId: string)` function
- [ ] Show confirmation Alert: "Are you sure you want to decline this offer?"
- [ ] On confirm, call `declineOffer(offerId)` from context
- [ ] Show feedback message
- [ ] Remove from pending list (status changes to 'declined')

**4.3 Implement View Listing Action**

**Tasks**:
- [ ] Create `handleViewListing(listingId: string)` function
- [ ] Navigate to VehicleDetails: `navigation.navigate('VehicleDetails', { vehicleId })`
- [ ] Pass vehicleId from offer data

**4.4 Implement Card Tap Navigation**

**Tasks**:
- [ ] OfferSentCard: Navigate to Messages with offer context
- [ ] PurchaseCard: Navigate to Messages with purchase context
- [ ] SoldCard: Navigate to Messages with sale context
- [ ] Pass relevant IDs and flags in navigation params

**4.5 Add Loading States**

**Tasks**:
- [ ] Show activity indicator while `isLoading` from context
- [ ] Disable buttons during async operations
- [ ] Add loading spinner to action buttons when processing

**Verification**:
- Tap each button type and verify correct navigation
- Check console logs for context method calls
- Verify AsyncStorage updates persist (reload app)

---

### 🔗 Phase 5: Integration (Day 5)

**5.1 Update VehicleDetailsScreen**

**File**: `src/screens/VehicleDetailsScreen.tsx`

**Tasks**:
- [ ] Import `usePurchasesOffers` hook at top of file
- [ ] Destructure methods: `const { addOfferSent, addPurchase } = usePurchasesOffers()`
- [ ] Locate `handlePaymentSuccess` function (around line 268)
- [ ] Add `addPurchase()` call in purchase branch
- [ ] Add `addOfferSent()` call in offer branch
- [ ] Extract vehicle details from `vehicle` object
- [ ] Pass all required fields to context methods
- [ ] Test: Make offer → should appear in Purchases & Offers screen

**Code Location**:
```typescript
// Find this function around line 268
const handlePaymentSuccess = useCallback(async (paymentData: PaymentData) => {
  // ADD CONTEXT CALLS HERE
}, [/* dependencies */]);
```

**5.2 Update Navigation**

**File**: `src/navigation/index.tsx`

**Tasks**:
- [ ] Import `PurchasesOffersScreen` at top
- [ ] Add to `RootStackParamList`: `PurchasesOffers: undefined;`
- [ ] Add Stack.Screen in navigator (after MyListings)
- [ ] Set `headerShown: false` option
- [ ] Test: Can navigate to screen from any location

**5.3 Update DrawerMenu**

**File**: `src/components/DrawerMenu.tsx`

**Tasks**:
- [ ] Import `usePurchasesOffers` hook
- [ ] Call `getPendingOffersReceivedCount()` to get badge count
- [ ] Locate `MENU_ITEMS` array (around line 64)
- [ ] Add new menu item after "My Listings":
  ```typescript
  {
    id: 'purchases-offers',
    label: 'Purchases & Offers',
    icon: 'receipt-outline',
    screen: 'PurchasesOffers',
    badge: pendingOffersCount,
  }
  ```
- [ ] Verify badge updates when offers change
- [ ] Test: Tap menu item → navigates to screen

**5.4 Add to Index Exports** (Optional)

**File**: `src/screens/index.ts` (if it exists)

**Tasks**:
- [ ] Export `PurchasesOffersScreen` for cleaner imports
- [ ] Update other files to use centralized import

**Verification**:
```bash
# Test complete flow:
1. Navigate to Home
2. Open drawer menu
3. See "Purchases & Offers" with badge count
4. Tap to open screen
5. See 4 tabs with mock data
6. Navigate to VehicleDetails
7. Make an offer
8. Go back to Purchases & Offers
9. See new offer in "Offers Sent" tab
10. Check AsyncStorage persistence (reload app)
```

---

### 🎨 Phase 6: Design Polish (Day 6)

**6.1 Typography Audit**

**Tasks**:
- [ ] Header: Use `h2` variant (Volkhov Bold 40px)
- [ ] Tab labels: Use `bodySmall` variant (Vesper Libre 20px)
- [ ] Card titles: Use `body` or `h4` variant (Vesper Libre Bold)
- [ ] Prices: Use `h3` variant (Volkhov Bold 35px) - data-heavy
- [ ] Status text: Use `caption` variant (Vesper Libre 14px)
- [ ] Empty state title: Use `body` variant
- [ ] Empty state description: Use `caption` variant
- [ ] Never use inline fontSize - always use Text variant prop

**6.2 Color Audit**

**Tasks**:
- [ ] Approve buttons: `Colors.success` (#08605D)
- [ ] Decline buttons: `Colors.accent` (#FF3864)
- [ ] View buttons: `Colors.secondary` (#008985) or `outline` variant
- [ ] Tab indicator: `Colors.primary` (#0ABAB5)
- [ ] Active tab text: `Colors.white`
- [ ] Inactive tab text: `Colors.text`
- [ ] Pending badge: `Colors.warning` (#FF9500)
- [ ] Approved badge: `Colors.success` (#08605D)
- [ ] Declined badge: `Colors.textMuted` (#6B7280)
- [ ] Screen background: `#EBEEF2` (matches HomeScreen)
- [ ] Card background: `Colors.white`
- [ ] Never hardcode colors - always import from `theme.ts`

**6.3 Spacing Audit**

**Tasks**:
- [ ] Use `Spacing` constants: `xs`, `sm`, `md`, `lg`, `xl`, `xxl`
- [ ] Apply responsive spacing: `getResponsiveSpacing(size, viewportWidth)`
- [ ] Mobile (≤480px): Use `SpacingMobile` values
- [ ] Web (>480px): Use `Spacing` values
- [ ] Card padding: `Spacing.lg` (20px mobile, 24px desktop)
- [ ] Card gaps: `Spacing.md` (16px mobile, 20px desktop)
- [ ] Header padding: `Spacing.xl` horizontal
- [ ] Tab padding: `Spacing.md` horizontal
- [ ] Content padding: `Spacing.xl` horizontal

**6.4 Responsive Layout**

**Tasks**:
- [ ] Add max-width constraint: `Platform.OS === 'web' ? 480 : '100%'`
- [ ] Center container: `alignSelf: 'center'`
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px) - should still max at 480px
- [ ] Test orientation change (portrait ↔ landscape)
- [ ] Verify Dimensions listener updates layout correctly
- [ ] Check tab indicator position recalculates on resize

**6.5 Shadows & Borders**

**Tasks**:
- [ ] Cards: Use `Shadows.sm` from primitives
- [ ] Tab background: Use subtle border `Colors.border` + `Shadows.xs`
- [ ] Tab indicator: No shadow, just colored background
- [ ] Empty state: No shadow
- [ ] Action buttons: Standard button shadows (from Button component)

**6.6 Animations**

**Tasks**:
- [ ] Tab indicator slide: Spring animation (tension: 120, friction: 14)
- [ ] Content fade: Timing animation (150ms out, 200ms in)
- [ ] Content slide: Spring animation (tension: 120, friction: 14)
- [ ] All animations use `useNativeDriver: true` for performance
- [ ] Test at 60fps (no janky animations)
- [ ] Verify smooth transitions on low-end devices

**Verification Checklist**:
- [ ] Compare side-by-side with WelcomeScreen tab animations
- [ ] Check color contrast ratios (WCAG AA compliance)
- [ ] Verify text is readable at all sizes
- [ ] Test with long vehicle names (should truncate with ellipsis)
- [ ] Test with large offer counts (badge should not overflow)

---

### 🧪 Phase 7: Testing & QA (Day 7)

**7.1 Functional Testing**

**Tasks**:
- [ ] Test tab switching: All 4 tabs load correctly
- [ ] Test empty states: Show when no data
- [ ] Test with mock data: Cards display correctly
- [ ] Test approve action: Updates status, navigates to Messages
- [ ] Test decline action: Shows confirmation, updates status
- [ ] Test view listing: Navigates to VehicleDetails
- [ ] Test card taps: Navigate to correct destinations
- [ ] Test badge counts: Update when offers added/approved/declined
- [ ] Test AsyncStorage: Data persists after app restart
- [ ] Test offer creation: VehicleDetails → Offer → Appears in list

**7.2 Edge Cases**

**Tasks**:
- [ ] Test with 0 offers in all tabs
- [ ] Test with 100+ offers (scrolling performance)
- [ ] Test with extremely long vehicle names (truncation)
- [ ] Test with $0 offer amount (should display correctly)
- [ ] Test with very large prices ($999,999,999)
- [ ] Test rapid tab switching (should not crash)
- [ ] Test approve/decline spam clicking (should debounce)
- [ ] Test offline behavior (AsyncStorage should still work)

**7.3 Responsive Testing**

**Tasks**:
- [ ] Test on iPhone SE (375px width)
- [ ] Test on iPhone 14 Pro (393px width)
- [ ] Test on iPhone 14 Pro Max (428px width)
- [ ] Test on iPad Mini (768px) - should constrain to 480px
- [ ] Test on web browser (1920px) - should constrain to 480px
- [ ] Test orientation change on mobile
- [ ] Test browser zoom levels (50%, 100%, 150%)
- [ ] Test with accessibility text size (Settings → Display → Text Size)

**7.4 Navigation Flow Testing**

**Test Scenarios**:
```
Scenario 1: Make Offer Flow
1. Home → VehicleDetails → Make Offer → Payment → Messages
2. Go back to Home → Drawer Menu → Purchases & Offers
3. Verify offer appears in "Offers Sent" tab
4. Tap offer card → Should navigate back to Messages

Scenario 2: Receive & Approve Offer
1. Open Purchases & Offers
2. Go to "Incoming Offers" tab
3. Tap "Approve" on an offer
4. Confirm navigation to Messages
5. Go back → Offer should be removed from pending list

Scenario 3: Purchase Flow
1. Home → VehicleDetails → Purchase Now → Payment → Messages
2. Drawer Menu → Purchases & Offers → "Purchases" tab
3. Verify purchase appears with correct details
4. Tap card → Should navigate to Messages

Scenario 4: Sold Vehicle
1. My Listings → Listing with status="sold"
2. Drawer Menu → Purchases & Offers → "Sold List" tab
3. Verify sold vehicle appears (if integrated with MyListingsContext)
4. Tap card → Should show transaction details
```

**7.5 Performance Testing**

**Tasks**:
- [ ] Check FlatList vs ScrollView performance with large lists
- [ ] Verify no memory leaks (use React DevTools Profiler)
- [ ] Check animation frame rates (should be 60fps)
- [ ] Test AsyncStorage read/write times (<100ms)
- [ ] Monitor bundle size impact (run `npx expo export`)
- [ ] Test on low-end Android device (e.g., Android 9)

**7.6 Accessibility Testing**

**Tasks**:
- [ ] Test with VoiceOver (iOS) / TalkBack (Android)
- [ ] Verify all buttons have accessible labels
- [ ] Check color contrast ratios (use accessibility inspector)
- [ ] Test with large text sizes enabled
- [ ] Verify keyboard navigation works on web
- [ ] Add semantic HTML roles (web only)

**7.7 Bug Fixes**

**Common Issues to Watch**:
- [ ] Tab indicator position incorrect after orientation change
- [ ] Badge counts not updating immediately
- [ ] AsyncStorage race conditions (use await properly)
- [ ] Navigation params not passing correctly
- [ ] Animations stuttering (check useNativeDriver)
- [ ] Images not loading (check require paths)
- [ ] Text truncation not working (add numberOfLines)
- [ ] Shadows not showing on Android (use elevation)

**Verification**:
```bash
# Run complete regression test
npx expo start --clear
# Test on iOS simulator
npx expo start --ios
# Test on Android emulator
npx expo start --android
# Test on web
npx expo start --web
```

---

## 📊 Mock Data Examples

**Location**: `src/contexts/PurchasesOffersContext.tsx` (bottom of file, before export)

### Sample Mock Data for Development

```typescript
// ============================================================================
// MOCK DATA FOR DEVELOPMENT
// ============================================================================

const MOCK_OFFERS_SENT: OfferSent[] = [
  {
    offerId: 'offer-sent-1',
    vehicleId: 'tesla-model3',
    vehicleDetails: {
      make: 'Tesla',
      model: 'Model 3',
      year: 2024,
      imageKey: 'tesla-model3',
    },
    sellerId: 'seller-premier',
    sellerName: 'Premier Wholesale',
    offerAmount: 58000,
    askingPrice: 62000,
    message: 'Interested in quick purchase if we can agree on price.',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    offerId: 'offer-sent-2',
    vehicleId: 'mazda-cx5',
    vehicleDetails: {
      make: 'Mazda',
      model: 'CX-5',
      year: 2023,
      imageKey: 'mazda-cx5',
    },
    sellerId: 'seller-abc',
    sellerName: 'ABC Motors',
    offerAmount: 38000,
    askingPrice: 42000,
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // Approved 4 days ago
  },
  {
    offerId: 'offer-sent-3',
    vehicleId: 'bmw-3series',
    vehicleDetails: {
      make: 'BMW',
      model: '3 Series',
      year: 2023,
      imageKey: 'bmw-3series',
    },
    sellerId: 'seller-luxury',
    sellerName: 'Luxury Auto Group',
    offerAmount: 52000,
    askingPrice: 58000,
    message: 'Can you meet me halfway? Cash buyer.',
    status: 'declined',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_OFFERS_RECEIVED: OfferReceived[] = [
  {
    offerId: 'offer-recv-1',
    listingId: 'listing-camry-1',
    vehicleDetails: {
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      imageKey: 'toyota-camry',
    },
    buyerId: 'buyer-city',
    buyerName: 'City Motors',
    offerAmount: 42000,
    askingPrice: 45000,
    message: 'Can you do $42k? Cash buyer ready to collect this week.',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    offerId: 'offer-recv-2',
    listingId: 'listing-accord-1',
    vehicleDetails: {
      make: 'Honda',
      model: 'Accord',
      year: 2023,
      imageKey: 'honda-accord',
    },
    buyerId: 'buyer-metro',
    buyerName: 'Metro Dealers',
    offerAmount: 36000,
    askingPrice: 38000,
    message: 'Looking to purchase today if price is right.',
    status: 'pending',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    offerId: 'offer-recv-3',
    listingId: 'listing-ranger-1',
    vehicleDetails: {
      make: 'Ford',
      model: 'Ranger',
      year: 2024,
      imageKey: 'ford-ranger',
    },
    buyerId: 'buyer-outback',
    buyerName: 'Outback Auto Sales',
    offerAmount: 48000,
    askingPrice: 52000,
    status: 'approved',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Approved 2 days ago
  },
];

const MOCK_PURCHASES: Purchase[] = [
  {
    purchaseId: 'purchase-1',
    vehicleId: 'lexus-rx',
    vehicleDetails: {
      make: 'Lexus',
      model: 'RX 350',
      year: 2024,
      mileage: 8500,
      imageKey: 'lexus-rx',
    },
    sellerId: 'seller-premier',
    sellerName: 'Premier Wholesale',
    purchaseAmount: 68000,
    purchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    paymentMethod: 'Credit Card',
  },
  {
    purchaseId: 'purchase-2',
    vehicleId: 'mercedes-cclass',
    vehicleDetails: {
      make: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2023,
      mileage: 12000,
      imageKey: 'mercedes-cclass',
    },
    sellerId: 'seller-luxury',
    sellerName: 'Luxury Auto Group',
    purchaseAmount: 55000,
    purchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    paymentMethod: 'Bank Transfer',
  },
];

const MOCK_SOLD_VEHICLES: SoldVehicle[] = [
  {
    soldId: 'sold-1',
    listingId: 'listing-hyundai-1',
    vehicleDetails: {
      make: 'Hyundai',
      model: 'Tucson',
      year: 2024,
      mileage: 5000,
      imageKey: 'hyundai-tucson',
    },
    buyerId: 'buyer-coastal',
    buyerName: 'Coastal Auto Sales',
    saleAmount: 42000,
    saleDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
  },
  {
    soldId: 'sold-2',
    listingId: 'listing-subaru-1',
    vehicleDetails: {
      make: 'Subaru',
      model: 'Outback',
      year: 2023,
      mileage: 18000,
      imageKey: 'subaru-outback',
    },
    buyerId: 'buyer-summit',
    buyerName: 'Summit Motors',
    saleAmount: 38000,
    saleDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
  },
];
```

---

## 🎨 Design System Reference (Quick Reference)

### Typography Mapping

| Element | Variant | Font Family | Size (Mobile) | Weight | Usage |
|---------|---------|-------------|---------------|--------|-------|
| Screen Title | `h2` | Volkhov | 40px | Bold | "Purchases & Offers" |
| Tab Labels | `bodySmall` | Vesper Libre | 20px | Semibold | "Incoming", "Sent", etc. |
| Card Title | `body` | Vesper Libre | 24px | Semibold | Vehicle name |
| Price | `h3` | Volkhov | 35px | Bold | Offer/purchase amounts |
| Secondary Info | `caption` | Vesper Libre | 14px | Regular | Timestamps, mileage |
| Status Badge | `caption` | Vesper Libre | 14px | Medium | "Pending", "Approved" |
| Empty State Title | `body` | Vesper Libre | 24px | Semibold | "No offers yet" |
| Empty State Desc | `caption` | Vesper Libre | 14px | Regular | Explanation text |

### Color Palette

| Element | Color Token | Hex Value | Usage |
|---------|-------------|-----------|-------|
| Primary CTA | `Colors.primary` | #0ABAB5 | Tab indicator, primary buttons |
| Success Action | `Colors.success` | #08605D | Approve button, approved badge |
| Destructive Action | `Colors.accent` | #FF3864 | Decline button |
| Secondary Action | `Colors.secondary` | #008985 | View listing button |
| Warning Badge | `Colors.warning` | #FF9500 | Pending status |
| Text Primary | `Colors.text` | #050505 | Main text |
| Text Secondary | `Colors.textMuted` | #6B7280 | Timestamps, secondary info |
| Background | `#EBEEF2` | #EBEEF2 | Screen background |
| Card Background | `Colors.white` | #FFFFFF | Card backgrounds |
| Border | `Colors.border` | #E5E7EB | Card borders |

### Spacing Scale

| Token | Mobile (≤480px) | Desktop (>480px) | Usage |
|-------|-----------------|------------------|-------|
| `xs` | 4px | 6px | Tiny gaps |
| `sm` | 8px | 10px | Small gaps |
| `md` | 16px | 20px | Standard gaps, card padding |
| `lg` | 20px | 24px | Large gaps, section padding |
| `xl` | 24px | 32px | Screen padding |
| `xxl` | 32px | 48px | Major sections |

---

## 🚀 Deployment & Launch

### Pre-Launch Checklist

**Code Quality**:
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] No ESLint errors: `npx eslint src/`
- [ ] No console.log statements (use proper logging)
- [ ] All async functions have try/catch
- [ ] All navigation params are typed correctly

**Performance**:
- [ ] AsyncStorage operations are async/await
- [ ] Images use require() for bundling
- [ ] No memory leaks (check with Profiler)
- [ ] Animations use useNativeDriver: true
- [ ] FlatList virtualization for large lists (if applicable)

**Accessibility**:
- [ ] All buttons have accessibilityLabel
- [ ] Images have accessibilityLabel or accessibilityIgnoresInvertColors
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Touch targets are ≥44x44pt
- [ ] Screen reader navigation works

**Documentation**:
- [ ] Update README.md with new feature
- [ ] Add JSDoc comments to context methods
- [ ] Document navigation flow in comments
- [ ] Add feature description to App Store listing

### Build Commands

```bash
# Development
npx expo start --clear        # Clear cache and start
npx expo start --ios          # iOS simulator
npx expo start --android      # Android emulator
npx expo start --web          # Web browser

# Production Build
npm run build:web             # Build for web → dist/
npm run deploy                # Deploy to Vercel

# Native Builds (if needed)
eas build --platform ios      # iOS build
eas build --platform android  # Android build
```

---

## 🔮 Future Enhancements (Post-MVP)

### Phase 2 Features (Next Sprint)

1. **Counter Offers**:
   - Add "Counter Offer" button to incoming offers
   - New modal for counter price input
   - Notification to original buyer

2. **Offer Expiry**:
   - Add `expiresAt` field to offers
   - Show countdown timer ("Expires in 2 days")
   - Auto-decline expired offers

3. **Bulk Actions**:
   - Checkbox selection for multiple offers
   - "Approve All" / "Decline All" buttons
   - Confirmation modal with list

4. **Filters & Search**:
   - Filter by status (pending/approved/declined)
   - Filter by date range (last 7 days, 30 days, etc.)
   - Search by vehicle make/model
   - Sort by date, amount, status

5. **Real-time Updates**:
   - WebSocket connection for instant notifications
   - Push notifications for new offers (iOS/Android)
   - In-app notification banner

### Phase 3 Features (Future)

6. **Analytics Dashboard**:
   - Offer acceptance rate
   - Average negotiation time
   - Price trends (offers vs asking prices)
   - Most popular vehicles

7. **Export & Reporting**:
   - Export purchase history as PDF
   - Export to CSV for accounting
   - Generate tax invoices
   - Monthly summary reports

8. **Advanced Messaging**:
   - Reply to offer directly from card
   - Attach images/documents
   - Read receipts
   - Typing indicators

9. **Smart Notifications**:
   - Digest emails (daily/weekly)
   - SMS notifications for urgent offers
   - Custom notification preferences
   - Snooze/mute options

10. **Integration with MyListings**:
    - Auto-update listing status when sold
    - Link sold vehicles to original listing
    - Show offer history on listing details
    - Performance metrics per listing

---

## 📚 Reference Materials

### Similar Patterns in Codebase

**For Context Implementation**:
- Reference: `src/contexts/MyListingsContext.tsx`
- Learn: AsyncStorage persistence, state management, CRUD operations

**For Tab Switcher UI**:
- Reference: `src/screens/auth/WelcomeScreen.tsx`
- Learn: Animated tab indicator, smooth transitions, responsive calculation

**For Card Design**:
- Reference: `src/screens/MyListingsScreen.tsx`
- Learn: ImageBackground, TouchableOpacity, card actions, status badges

**For Navigation Integration**:
- Reference: `src/navigation/index.tsx`
- Learn: Type-safe navigation, parameter passing

**For Menu Integration**:
- Reference: `src/components/DrawerMenu.tsx`
- Learn: Menu items, badge counts, navigation

### Documentation Links

- [Copilot Instructions](../.github/copilot-instructions.md)
- [Design System](../DESIGN_SYSTEM.md)
- [Typography Guide](../src/constants/TYPOGRAPHY_GUIDE.md)
- [README](../README.md)
- [CLAUDE.md](../CLAUDE.md)

---

## ❓ FAQ & Troubleshooting

### Q: Why aren't my animations smooth?
**A**: Make sure all animations use `useNativeDriver: true`. Check that you're not animating layout properties (width, height, margin, padding). Use transform and opacity only.

### Q: Why isn't AsyncStorage persisting data?
**A**: Check that you're using `await` with AsyncStorage.setItem(). Verify the storage key matches exactly. Check for JSON.stringify/parse errors.

### Q: Why aren't badge counts updating in the drawer menu?
**A**: Make sure DrawerMenu is re-rendering when context state changes. Check that `usePurchasesOffers()` is called inside DrawerMenu component. Verify `getPendingOffersReceivedCount()` filters correctly.

### Q: Why is the tab indicator position wrong after screen rotation?
**A**: Ensure you're using Dimensions.addEventListener to listen for changes. Recalculate `tabWidth` when `containerWidth` changes. Check that animation values are updated correctly.

### Q: Why aren't images loading?
**A**: Verify image paths use `require()` syntax, not ES imports. Check that `imageKey` values match actual files in `assets/images/vehiclesWithBackground/`. Use `getVehicleImage()` helper function.

### Q: How do I debug navigation issues?
**A**: Enable navigation dev tools: Add `import { enableFreeze } from "react-native-screens"` and `enableFreeze(false)`. Check console for navigation errors. Verify `RootStackParamList` types match exactly.

---

## ✅ Success Criteria (Definition of Done)

### Functional Requirements
✅ All 4 tabs display correctly with smooth animations  
✅ Users can view incoming offers with full details  
✅ Users can approve offers → navigates to Messages  
✅ Users can decline offers → shows confirmation, updates status  
✅ Users can view vehicle listings from offers  
✅ Users can see their sent offers with status badges  
✅ Users can see their purchase history  
✅ Users can see their sold vehicles  
✅ Badge count shows pending offers in drawer menu  
✅ All data persists across app restarts (AsyncStorage)  

### Design Requirements
✅ Typography matches brand guidelines (Volkhov for data, Vesper Libre for UI)  
✅ Colors use exact brand values (#0ABAB5, #08605D, #FF3864, etc.)  
✅ Spacing uses responsive tokens (Spacing/SpacingMobile)  
✅ Layout constrains to 480px max on web, centered  
✅ Tab animations match WelcomeScreen quality (smooth, 60fps)  
✅ Empty states are clear and helpful  
✅ Text truncates gracefully (vehicle names, messages)  

### Technical Requirements
✅ TypeScript: No errors, all types defined  
✅ Performance: 60fps animations, fast AsyncStorage  
✅ Responsive: Works on mobile, tablet, web  
✅ Navigation: Type-safe, correct param passing  
✅ Context: Proper state management, no prop drilling  
✅ Code Quality: Clean, commented, follows existing patterns  

### Testing Requirements
✅ Tested on iOS simulator  
✅ Tested on Android emulator  
✅ Tested on web browser  
✅ Tested with mock data (all 4 tabs populated)  
✅ Tested with empty states (0 items in tabs)  
✅ Tested complete user flows (offer → approve → messages)  
✅ Tested responsive behavior (resize, orientation)  
✅ Tested AsyncStorage persistence (reload app)  

---

## 🎯 Implementation Timeline

**Estimated Duration**: 7 days (1 developer)

| Phase | Duration | Completion Criteria |
|-------|----------|---------------------|
| Phase 1: Foundation | 1 day | Context created, integrated, mock data working |
| Phase 2: Screen Creation | 1 day | Screen renders, tabs switch, empty states show |
| Phase 3: Card Components | 1 day | All 4 card types display correctly |
| Phase 4: Actions & Navigation | 1 day | Approve/decline work, navigation flows complete |
| Phase 5: Integration | 1 day | VehicleDetails, DrawerMenu, Navigation updated |
| Phase 6: Design Polish | 1 day | Typography, colors, spacing perfected |
| Phase 7: Testing & QA | 1 day | All tests pass, bugs fixed, ready to merge |

**Total**: 7 days + buffer for unexpected issues

---

## 📝 Final Notes

### Key Decisions Summary

1. **No Invoice Generation**: Simplified MVP - just navigate to Messages
2. **No Counter Offers**: Binary approve/decline only (future enhancement)
3. **No Time Expiry**: Offers remain active until manually actioned
4. **Universal Access**: All users see all 4 tabs (not role-based)
5. **Tab Design**: Match WelcomeScreen's animated tab switcher (brand consistency)
6. **Badge Notifications**: Show pending count in drawer menu (like Messages)

### What Makes This Plan Different

✅ **Step-by-step checklist**: Actionable tasks, not just concepts  
✅ **Code examples**: Real TypeScript snippets to copy/adapt  
✅ **Design compliance**: Explicit typography, color, spacing rules  
✅ **Mock data included**: Ready-to-use sample data for development  
✅ **Testing scenarios**: Real user flows to verify  
✅ **Troubleshooting guide**: Common issues and solutions  
✅ **Timeline estimate**: Realistic 7-day implementation plan  

### Communication with Team

- **Daily standups**: Report progress against phase checklist
- **Design reviews**: Compare with WelcomeScreen side-by-side
- **Code reviews**: Check TypeScript types, design system usage
- **Demo**: Show working feature at end of each phase

---

**Ready to implement!** 🚀

This comprehensive plan provides everything needed to build the Purchases & Offers feature with strict adherence to Auto Connex brand guidelines, design system, and existing architectural patterns.
