/**
 * BudgetSettingsModal Component
 *
 * Simple modal for setting weekly purchase budget.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../design-system/atoms/Text';
import { Button } from '../design-system/atoms/Button';
import { Spacer } from '../design-system/atoms/Spacer';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

interface BudgetSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  currentBudget: number;
  onSaveBudget: (budget: number) => void;
}

const PRESET_BUDGETS = [50000, 100000, 150000, 200000];

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
  visible,
  onClose,
  currentBudget,
  onSaveBudget,
}) => {
  const [budget, setBudget] = useState(currentBudget.toString());

  useEffect(() => {
    if (visible) {
      setBudget(currentBudget.toString());
    }
  }, [visible, currentBudget]);

  const handlePresetSelect = (amount: number) => {
    setBudget(amount.toString());
  };

  const handleCustomBudgetChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setBudget(numericValue);
  };

  const handleSave = () => {
    const budgetValue = parseInt(budget, 10);
    if (budgetValue > 0) {
      onSaveBudget(budgetValue);
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const isPresetSelected = (amount: number) => {
    return parseInt(budget, 10) === amount;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={styles.modalContainer}>
                {/* Header */}
                <View style={styles.header}>
                  <Text variant="h4" weight="regular" style={styles.title}>
                    Weekly Budget
                  </Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <Spacer size="lg" />

                {/* Budget Input */}
                <View style={styles.inputContainer}>
                  <Text variant="h4" weight="semibold" style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.input}
                    value={budget}
                    onChangeText={handleCustomBudgetChange}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <Spacer size="lg" />

                {/* Preset Amounts */}
                <View style={styles.presetsContainer}>
                  {PRESET_BUDGETS.map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.presetButton,
                        isPresetSelected(amount) && styles.presetButtonActive,
                      ]}
                      onPress={() => handlePresetSelect(amount)}
                    >
                      <Text
                        variant="bodySmall"
                        weight="semibold"
                        style={[
                          styles.presetText,
                          isPresetSelected(amount) && styles.presetTextActive,
                        ]}
                      >
                        {formatCurrency(amount)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Spacer size="xl" />

                {/* Action Buttons */}
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onPress={handleSave}
                  disabled={!budget || parseInt(budget, 10) <= 0}
                >
                  Save Budget
                </Button>

                <Spacer size="sm" />

                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onPress={onClose}
                >
                  Cancel
                </Button>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 340,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: Colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  currencySymbol: {
    color: Colors.primary,
  },
  input: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    minWidth: 100,
    textAlign: 'center',
  },
  presetsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  presetButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: Colors.primary,
  },
  presetText: {
    color: Colors.textMuted,
  },
  presetTextActive: {
    color: Colors.white,
  },
});

export default BudgetSettingsModal;
