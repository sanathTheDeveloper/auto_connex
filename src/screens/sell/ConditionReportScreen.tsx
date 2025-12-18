/**
 * ConditionReportScreen
 *
 * Step 4 of the Sell Vehicle flow.
 * Allows users to add pros, cons, and defects with severity levels.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';

// Design System
import { Text, Spacer, Button } from '../../design-system';
import { Colors, Spacing, BorderRadius, Shadows } from '../../design-system/primitives';

// Context
import { useSell, ConditionItem, ConditionReport, generateId } from '../../contexts/SellContext';

type ConditionReportScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ConditionReport'
>;

type ConditionReportScreenRouteProp = RouteProp<RootStackParamList, 'ConditionReport'>;

interface ConditionReportScreenProps {
  navigation: ConditionReportScreenNavigationProp;
  route: ConditionReportScreenRouteProp;
}

export const ConditionReportScreen: React.FC<ConditionReportScreenProps> = ({ navigation, route }) => {
  const { listingData, setConditionReport } = useSell();
  const fromReview = route.params?.fromReview ?? false;

  // Local state for the form
  const [pros, setPros] = useState<ConditionItem[]>(listingData.conditionReport.pros);
  const [cons, setCons] = useState<ConditionItem[]>(listingData.conditionReport.cons);

  // Input states
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  // Add handlers
  const addPro = useCallback(() => {
    if (newPro.trim()) {
      setPros((prev) => [...prev, { id: generateId(), description: newPro.trim() }]);
      setNewPro('');
    }
  }, [newPro]);

  const addCon = useCallback(() => {
    if (newCon.trim()) {
      setCons((prev) => [...prev, { id: generateId(), description: newCon.trim() }]);
      setNewCon('');
    }
  }, [newCon]);

  // Remove handlers
  const removePro = useCallback((id: string) => {
    setPros((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const removeCon = useCallback((id: string) => {
    setCons((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Handle continue
  const handleContinue = useCallback(() => {
    const report: ConditionReport = { pros, cons, defects: [] };
    setConditionReport(report);
    if (fromReview) {
      navigation.goBack();
    } else {
      navigation.navigate('AfterMarketExtras');
    }
  }, [pros, cons, setConditionReport, navigation, fromReview]);

  // Handle back
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Render item with remove button
  const renderItem = (
    item: ConditionItem,
    onRemove: (id: string) => void
  ) => (
    <View key={item.id} style={styles.listItem}>
      <View style={styles.listItemContent}>
        <Text variant="bodySmall" style={styles.listItemText}>
          {item.description}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons name="close-circle" size={22} color={Colors.accent} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" style={styles.headerTitle}>
          Condition Report
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Indicator - Hidden when editing from review */}
          {!fromReview && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '57%' }]} />
              </View>
              <Text variant="caption" color="textMuted" style={styles.stepText}>
                Step 4 of 7
              </Text>
            </View>
          )}

          {!fromReview && <Spacer size="xs" />}

          {/* Icon */}
          <View style={styles.iconWrapper}>
            <Ionicons name="clipboard-outline" size={36} color={Colors.primary} />
          </View>

          <Spacer size="md" />

          {/* Title */}
          <Text variant="bodySmall" weight="bold" align="center">
            Vehicle Condition
          </Text>
          <Spacer size="xs" />
          <Text variant="label" color="textSecondary" align="center">
            Add details about your vehicle's condition
          </Text>

          <Spacer size="lg" />

          {/* Pros Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrapper, { backgroundColor: Colors.success + '15' }]}>
                <Ionicons name="thumbs-up" size={16} color={Colors.success} />
              </View>
              <Text variant="bodySmall" weight="semibold">
                Pros / Highlights
              </Text>
            </View>

            <Spacer size="md" />

            {/* Pros List */}
            {pros.length > 0 && (
              <View style={styles.listContainer}>
                {pros.map((item) => renderItem(item, removePro))}
              </View>
            )}

            {/* Add Pro Input */}
            <View style={styles.multilineInputContainer}>
              <TextInput
                style={styles.multilineTextInput}
                placeholder="Describe a highlight or positive aspect of your vehicle..."
                placeholderTextColor={Colors.textTertiary}
                value={newPro}
                onChangeText={setNewPro}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity
              style={[styles.addButtonOutside, styles.addButtonSuccess, !newPro.trim() && styles.addButtonDisabled]}
              onPress={addPro}
              disabled={!newPro.trim()}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color={Colors.white} />
              <Text variant="caption" weight="semibold" style={styles.addButtonText}>
                Add Highlight
              </Text>
            </TouchableOpacity>
          </View>

          <Spacer size="lg" />

          {/* Cons Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrapper, { backgroundColor: Colors.warning + '15' }]}>
                <Ionicons name="thumbs-down" size={16} color={Colors.warning} />
              </View>
              <Text variant="bodySmall" weight="semibold">
                Cons / Issues
              </Text>
            </View>

            <Spacer size="md" />

            {/* Cons List */}
            {cons.length > 0 && (
              <View style={styles.listContainer}>
                {cons.map((item) => renderItem(item, removeCon))}
              </View>
            )}

            {/* Add Con Input */}
            <View style={styles.multilineInputContainer}>
              <TextInput
                style={styles.multilineTextInput}
                placeholder="Describe an issue or drawback of your vehicle..."
                placeholderTextColor={Colors.textTertiary}
                value={newCon}
                onChangeText={setNewCon}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity
              style={[styles.addButtonOutside, styles.addButtonWarning, !newCon.trim() && styles.addButtonDisabled]}
              onPress={addCon}
              disabled={!newCon.trim()}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color={Colors.white} />
              <Text variant="caption" weight="semibold" style={styles.addButtonText}>
                Add Issue
              </Text>
            </TouchableOpacity>
          </View>

          <Spacer size="xl" />

          {/* Continue/Done Button */}
          <Button
            variant="primary"
            size="md"
            fullWidth
            onPress={handleContinue}
            iconRight={fromReview ? 'checkmark' : 'arrow-forward'}
          >
            {fromReview ? 'Done' : 'Continue'}
          </Button>

          <Spacer size="2xl" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
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
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text,
  },
  headerSpacer: {
    width: 44,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['xs'],
  },

  // Progress
  progressContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  stepText: {
    letterSpacing: 0.5,
  },

  // Icon
  iconWrapper: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary + '20',
    ...Shadows.md,
  },

  // Section Card
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List
  listContainer: {
    marginBottom: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderColor: Colors.primary,
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  listItemContent: {
    flex: 1,
    flexDirection: 'column',
    gap: Spacing.xs,
  },
  listItemText: {
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 20,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  removeButton: {
    padding: Spacing.xs,
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  inputIconWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '12',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.text,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  addButtonSuccess: {
    backgroundColor: Colors.success,
  },
  addButtonWarning: {
    backgroundColor: Colors.warning,
  },
  addButtonError: {
    backgroundColor: Colors.accent,
  },
  addButtonDisabled: {
    backgroundColor: Colors.greyscale300,
    elevation: 0,
    shadowOpacity: 0,
  },
  addButtonOutside: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },

  // Multiline Input
  multilineInputContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  multilineTextInput: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    fontSize: 14,
    color: Colors.text,
    minHeight: 80,
    lineHeight: 20,
  },
  addButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    color: Colors.white,
  },

  // Severity
  severitySelector: {
    gap: Spacing.sm,
  },
  labelText: {
    letterSpacing: 1,
    fontSize: 11,
  },
  severityOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  severityOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },

});

export default ConditionReportScreen;
