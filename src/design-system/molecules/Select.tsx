/**
 * Select/Dropdown Molecular Component
 *
 * Custom dropdown selector with Auto Connex brand styling.
 * Works on both web and mobile with native-like behavior.
 *
 * @example
 * <Select
 *   label="State"
 *   value={state}
 *   onChange={setState}
 *   options={[
 *     { label: 'New South Wales', value: 'NSW' },
 *     { label: 'Victoria', value: 'VIC' }
 *   ]}
 * />
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../primitives';
import { Text } from '../atoms/Text';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  /** Select label */
  label?: string;
  /** Current selected value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Options array */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Custom container style */
  containerStyle?: ViewStyle;
}

/**
 * Select component with dropdown menu
 *
 * - Native-like dropdown behavior
 * - Scrollable options list
 * - Teal selection highlight
 * - Keyboard accessible
 */
export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select',
  error,
  containerStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectorRef = useRef<View>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  const measureAndOpen = () => {
    if (selectorRef.current) {
      selectorRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPosition({
          top: y + height,
          left: x,
          width: width,
        });
        setIsOpen(true);
      });
    } else {
      setIsOpen(true);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  const renderOption = ({ item }: { item: SelectOption }) => {
    const isSelected = item.value === value;
    
    return (
      <TouchableOpacity
        style={[
          styles.option,
          isSelected && styles.optionSelected,
        ]}
        onPress={() => handleSelect(item.value)}
        activeOpacity={0.7}
      >
        <Text 
          variant="caption" 
          weight={isSelected ? 'semibold' : 'regular'}
          style={[
            styles.optionText,
            isSelected && styles.optionTextSelected
          ]}
        >
          {item.label}
        </Text>
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="caption" weight="regular" color="text" style={styles.label}>
          {label}
        </Text>
      )}

      <View ref={selectorRef} collapsable={false}>
        <TouchableOpacity
          style={[
            styles.selector,
            error && styles.selectorError,
            isOpen && styles.selectorOpen,
          ]}
          onPress={measureAndOpen}
          activeOpacity={0.7}
        >
          <Text
            variant="caption"
            style={[
              styles.selectorText,
              !value && styles.selectorPlaceholder
            ]}
          >
            {displayText}
          </Text>
          <Text style={[styles.arrow, isOpen && styles.arrowUp]}>▾</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu - Using Modal for proper layering */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[
              styles.dropdown,
              {
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              },
            ]}
          >
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </Pressable>
      </Modal>

      {error && (
        <Text variant="caption" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  label: {
    marginBottom: 8,
    color: Colors.text,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    minHeight: 36,
  },
  selectorError: {
    borderColor: Colors.error,
  },
  selectorOpen: {
    borderColor: Colors.primary,
  },
  selectorText: {
    flex: 1,
    color: Colors.text,
  },
  selectorPlaceholder: {
    color: Colors.textTertiary,
  },
  arrow: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginLeft: 8,
  },
  arrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    maxHeight: 150,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  dropdownList: {
    maxHeight: 150,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.greyscale300 + '30',
    backgroundColor: Colors.white,
  },
  optionSelected: {
    backgroundColor: Colors.primary + '10',
  },
  optionText: {
    color: Colors.text,
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  error: {
    color: Colors.error,
    marginTop: 4,
  },
});
