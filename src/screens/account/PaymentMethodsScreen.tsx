/**
 * PaymentMethodsScreen
 * 
 * Screen for managing payment methods (credit cards, bank accounts).
 */

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { Text, Spacer, Button } from '../../design-system';
import { Colors, Spacing } from '../../design-system/primitives';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock payment methods data
const CARD_BRANDS = ['Visa', 'Mastercard', 'American Express'];
const CARD_NUMBERS = ['4532', '5167', '3782', '4916', '5234'];

// Mock billing history data - Only transaction fees
const TRANSACTION_TYPES = [
  'Offer Acceptance Fee',
  'Offer Submission Fee',
  'Counter Offer Fee',
  'Offer Processing Fee',
];
const AMOUNTS = [25, 15, 10, 20, 30]; // Small transaction fees

const generateMockCard = () => {
  const brand = CARD_BRANDS[Math.floor(Math.random() * CARD_BRANDS.length)];
  const last4 = CARD_NUMBERS[Math.floor(Math.random() * CARD_NUMBERS.length)];
  const expMonth = Math.floor(Math.random() * 12) + 1;
  const expYear = 26 + Math.floor(Math.random() * 5);
  
  return {
    id: `card_${Date.now()}_${Math.random()}`,
    brand,
    last4,
    expMonth: expMonth.toString().padStart(2, '0'),
    expYear,
    isDefault: Math.random() > 0.5,
  };
};

const generateMockBillingHistory = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    // Generate mock vehicle details for the transaction
    const vehicleMakes = ['Toyota Camry', 'Honda Accord', 'Mazda CX-5', 'Ford Ranger', 'Hyundai i30'];
    const vehicleYears = ['2018', '2019', '2020', '2021', '2022'];
    
    return {
      id: `transaction_${i}`,
      type: TRANSACTION_TYPES[Math.floor(Math.random() * TRANSACTION_TYPES.length)],
      amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
      date: date.toISOString(),
      status: Math.random() > 0.1 ? 'completed' : 'pending',
      vehicleName: `${vehicleYears[Math.floor(Math.random() * vehicleYears.length)]} ${vehicleMakes[Math.floor(Math.random() * vehicleMakes.length)]}`,
      transactionId: `TXN${Date.now()}${i}`.slice(0, 16),
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function PaymentMethodsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);

  // Generate random data on mount
  useEffect(() => {
    const cardCount = Math.floor(Math.random() * 3) + 1; // 1-3 cards
    const cards = Array.from({ length: cardCount }, () => generateMockCard());
    setPaymentMethods(cards);

    const historyCount = Math.floor(Math.random() * 8) + 3; // 3-10 transactions
    const history = generateMockBillingHistory(historyCount);
    setBillingHistory(history);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const handleViewDetails = (transaction: any) => {
    // Navigate to PurchasesOffersScreen to view the offer details
    navigation.navigate('PurchasesOffers');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold">Payment & Billing</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Spacer size="md" />

        {/* Payment Methods List */}
        <Text variant="h4" style={styles.sectionTitle}>
          Saved Cards
        </Text>
        <Spacer size="md" />
        
        {paymentMethods.map((card, index) => (
          <View key={card.id}>
            <View style={styles.cardItem}>
              <View style={styles.cardIcon}>
                <Ionicons 
                  name="card" 
                  size={24} 
                  color={Colors.primary} 
                />
              </View>
              <View style={styles.cardDetails}>
                <View style={styles.cardRow}>
                  <Text variant="body" style={styles.cardBrand}>
                    {card.brand}
                  </Text>
                  {card.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text variant="caption" style={styles.defaultText}>
                        Default
                      </Text>
                    </View>
                  )}
                </View>
                <Text variant="bodySmall" style={styles.cardNumber}>
                  •••• •••• •••• {card.last4}
                </Text>
                <Text variant="caption" style={styles.cardExpiry}>
                  Expires {card.expMonth}/{card.expYear}
                </Text>
              </View>
              <TouchableOpacity style={styles.cardAction}>
                <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {index < paymentMethods.length - 1 && <Spacer size="sm" />}
          </View>
        ))}
        
        <Spacer size="md" />
        <Button
          variant="outline"
          fullWidth
          onPress={() => {
            console.log('Add payment method');
          }}
        >
          + Add New Card
        </Button>

        <Spacer size="xl" />

        {/* Billing History Section */}
        <Text variant="h4" style={styles.sectionTitle}>
          Billing History
        </Text>
        <Spacer size="md" />
        
        <View style={styles.billingList}>
          {billingHistory.map((transaction, index) => (
            <View key={transaction.id}>
              <View style={styles.billingItem}>
                <View style={styles.billingLeft}>
                  <Text variant="body" style={styles.billingType}>
                    {transaction.type}
                  </Text>
                  <Text variant="caption" style={styles.vehicleName}>
                    {transaction.vehicleName}
                  </Text>
                  <Text variant="caption" style={styles.billingDate}>
                    {formatDate(transaction.date)} • {transaction.transactionId}
                  </Text>
                </View>
                <View style={styles.billingRight}>
                  <Text variant="body" style={styles.billingAmount}>
                    {formatAmount(transaction.amount)}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    transaction.status === 'completed' 
                      ? styles.statusCompleted 
                      : styles.statusPending
                  ]}>
                    <Text 
                      variant="caption" 
                      style={[
                        styles.statusText,
                        transaction.status === 'completed' 
                          ? styles.statusTextCompleted 
                          : styles.statusTextPending
                      ]}
                    >
                      {transaction.status === 'completed' ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => handleViewDetails(transaction)}
              >
                <Text variant="bodySmall" style={styles.viewDetailsText}>
                  View Details
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
              {index < billingHistory.length - 1 && (
                <View style={styles.billingDivider} />
              )}
            </View>
          ))}
        </View>

        <Spacer size="xl" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBEEF2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: Spacing.lg,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  sectionTitle: {
    color: Colors.text,
  },
  // Card styles
  cardItem: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FFFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardDetails: {
    flex: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardBrand: {
    color: Colors.text,
    fontWeight: '600',
  },
  cardNumber: {
    color: Colors.textSecondary,
    marginTop: 2,
    letterSpacing: 1,
  },
  cardExpiry: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    color: Colors.white,
    fontSize: 10,
  },
  cardAction: {
    padding: Spacing.sm,
  },
  // Billing history styles
  billingList: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  billingItem: {
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billingLeft: {
    flex: 1,
  },
  billingType: {
    color: Colors.text,
    fontWeight: '600',
  },
  vehicleName: {
    color: Colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  billingDate: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  billingRight: {
    alignItems: 'flex-end',
  },
  billingAmount: {
    color: Colors.text,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  statusCompleted: {
    backgroundColor: '#E6F7F6',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextCompleted: {
    color: Colors.secondary,
  },
  statusTextPending: {
    color: '#F57C00',
  },
  billingDivider: {
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  viewDetailsText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
