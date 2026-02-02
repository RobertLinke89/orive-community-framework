import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import colors from '@/constants/colors';
import { CORE_VALUES } from '@/constants/values';

interface ValueSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (values: string[]) => void;
  initialValues?: string[];
}

export default function ValueSelectionModal({
  visible,
  onClose,
  onConfirm,
  initialValues = [],
}: ValueSelectionModalProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(initialValues);

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    } else {
      if (selectedValues.length < 3) {
        setSelectedValues([...selectedValues, value]);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedValues.length === 3) {
      onConfirm(selectedValues);
    }
  };

  const isComplete = selectedValues.length === 3;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Select Your Values</Text>
              <Text style={styles.subtitle}>
                Choose {3 - selectedValues.length} {selectedValues.length === 2 ? 'more value' : 'more values'} to explore
              </Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.progressContainer}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index < selectedValues.length && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <ScrollView
            style={styles.valuesContainer}
            contentContainerStyle={styles.valuesContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.valuesGrid}>
              {CORE_VALUES.map((value) => {
                const isSelected = selectedValues.includes(value);
                return (
                  <Pressable
                    key={value}
                    style={[
                      styles.valueChip,
                      isSelected && styles.valueChipSelected,
                    ]}
                    onPress={() => toggleValue(value)}
                  >
                    <Text
                      style={[
                        styles.valueText,
                        isSelected && styles.valueTextSelected,
                      ]}
                    >
                      {value}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkIcon}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[
                styles.confirmButton,
                !isComplete && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!isComplete}
            >
              <Text
                style={[
                  styles.confirmText,
                  !isComplete && styles.confirmTextDisabled,
                ]}
              >
                {isComplete ? 'Start Exploring' : `Select ${3 - selectedValues.length} More`}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 191, 191, 0.1)',
  },
  headerContent: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  progressDot: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(31, 191, 191, 0.2)',
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  valuesContainer: {
    flex: 1,
  },
  valuesContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  valueChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'rgba(31, 191, 191, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valueChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  valueTextSelected: {
    color: '#FFFFFF',
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(31, 191, 191, 0.3)',
    shadowOpacity: 0,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  confirmTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
