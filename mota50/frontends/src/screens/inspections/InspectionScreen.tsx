import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import InspectionChecklist from '@/components/inspections/InspectionChecklist';
import inspectionService from '@/services/inspections';
import { InspectionItem, InspectionType, CreateInspectionRequest } from '@/types';

interface InspectionScreenProps {
  vehicleId: string;
  tripId?: string;
  type: InspectionType;
  onComplete?: () => void;
}

const InspectionScreen: React.FC<InspectionScreenProps> = ({
  vehicleId,
  tripId,
  type,
  onComplete,
}) => {
  const [items, setItems] = useState<InspectionItem[]>(getDefaultItems());
  const [defects, setDefects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  function getDefaultItems(): InspectionItem[] {
    const baseItems = [
      { id: '1', name: 'Tires', category: 'Exterior', isChecked: false },
      { id: '2', name: 'Brakes', category: 'Safety', isChecked: false },
      { id: '3', name: 'Lights', category: 'Exterior', isChecked: false },
      { id: '4', name: 'Horn', category: 'Safety', isChecked: false },
      { id: '5', name: 'Mirrors', category: 'Exterior', isChecked: false },
      { id: '6', name: 'Fluids', category: 'Engine', isChecked: false },
      { id: '7', name: 'Fuel Level', category: 'Fuel', isChecked: false },
      { id: '8', name: 'Safety Kit', category: 'Safety', isChecked: false },
    ];
    return baseItems;
  }

  const handleSubmit = async () => {
    const uncheckedItems = items.filter((item) => !item.isChecked);
    if (uncheckedItems.length > 0 && defects.length === 0) {
      Alert.alert(
        'Incomplete Inspection',
        'Please check all items or add defects for unchecked items.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      const inspectionData: CreateInspectionRequest = {
        vehicleId,
        type,
        items: items.map(({ id, ...item }) => item),
        defects: defects.map(({ id, workOrderCreated, ...defect }) => defect),
      };

      if (tripId) {
        inspectionData.tripId = tripId;
      }

      await inspectionService.createInspection(inspectionData);
      Alert.alert('Success', 'Inspection submitted successfully');
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit inspection');
    } finally {
      setLoading(false);
    }
  };

  const allChecked = items.every((item) => item.isChecked);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Text style={styles.title}>
          {type === 'pre_trip' ? 'Pre-Trip' : 'Post-Trip'} Inspection
        </Text>
        <Text style={styles.subtitle}>
          Please check all items before {type === 'pre_trip' ? 'starting' : 'completing'} the trip
        </Text>
      </Card>

      <InspectionChecklist
        items={items}
        onItemsChange={setItems}
        onDefectsChange={setDefects}
      />

      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items Checked:</Text>
          <Text style={styles.summaryValue}>
            {items.filter((i) => i.isChecked).length} / {items.length}
          </Text>
        </View>
        {defects.length > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Defects Found:</Text>
            <Text style={[styles.summaryValue, { color: colors.semantic.error }]}>
              {defects.length}
            </Text>
          </View>
        )}
      </Card>

      <Button
        title={allChecked ? 'Submit Inspection' : 'Submit with Defects'}
        onPress={handleSubmit}
        loading={loading}
        fullWidth
        icon="check-circle"
        style={styles.submitButton}
        disabled={!allChecked && defects.length === 0}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  headerCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  summaryCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  summaryLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  submitButton: {
    margin: spacing[4],
  },
});

export default InspectionScreen;
