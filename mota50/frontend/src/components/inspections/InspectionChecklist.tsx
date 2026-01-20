import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Icon from '@/components/common/Icon';
import { InspectionItem, Defect, DefectSeverity } from '@/types';

interface InspectionChecklistProps {
  items: InspectionItem[];
  onItemsChange: (items: InspectionItem[]) => void;
  onDefectsChange?: (defects: Defect[]) => void;
  vehicleType?: string;
}

const InspectionChecklist: React.FC<InspectionChecklistProps> = ({
  items,
  onItemsChange,
  onDefectsChange,
  vehicleType,
}) => {
  const [defects, setDefects] = useState<Defect[]>([]);

  const handleItemToggle = (itemId: string) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    );
    onItemsChange(updatedItems);
  };

  const handleAddDefect = async (itemId: string) => {
    Alert.prompt(
      'Add Defect',
      'Describe the defect:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (description) => {
            if (!description) return;

            // Request camera permission
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Camera permission is required');
              return;
            }

            // Take photo
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              const newDefect: Defect = {
                id: Date.now().toString(),
                itemId,
                description,
                severity: 'minor',
                photos: [result.assets[0].uri],
                workOrderCreated: false,
              };

              const updatedDefects = [...defects, newDefect];
              setDefects(updatedDefects);
              if (onDefectsChange) {
                onDefectsChange(updatedDefects);
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleSeverityChange = (defectId: string, severity: DefectSeverity) => {
    const updatedDefects = defects.map((defect) =>
      defect.id === defectId ? { ...defect, severity } : defect
    );
    setDefects(updatedDefects);
    if (onDefectsChange) {
      onDefectsChange(updatedDefects);
    }
  };

  const getSeverityColor = (severity: DefectSeverity) => {
    switch (severity) {
      case 'critical':
        return colors.semantic.error;
      case 'major':
        return colors.semantic.warning;
      case 'minor':
        return colors.semantic.info;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {items.map((item) => (
        <Card key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleItemToggle(item.id)}
            >
              <Icon
                name={item.isChecked ? 'check-circle' : 'radio-button-unchecked'}
                size="medium"
                color={item.isChecked ? 'success' : 'textTertiary'}
              />
            </TouchableOpacity>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
            </View>
            {!item.isChecked && (
              <Button
                title="Defect"
                onPress={() => handleAddDefect(item.id)}
                variant="outline"
                size="small"
                icon="warning"
              />
            )}
          </View>

          {item.notes && (
            <Text style={styles.itemNotes}>{item.notes}</Text>
          )}

          {defects
            .filter((d) => d.itemId === item.id)
            .map((defect) => (
              <View key={defect.id} style={styles.defectContainer}>
                <View style={styles.defectHeader}>
                  <Text style={styles.defectDescription}>{defect.description}</Text>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(defect.severity) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        { color: getSeverityColor(defect.severity) },
                      ]}
                    >
                      {defect.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.severityButtons}>
                  <Button
                    title="Minor"
                    onPress={() => handleSeverityChange(defect.id, 'minor')}
                    variant={defect.severity === 'minor' ? 'primary' : 'outline'}
                    size="small"
                  />
                  <Button
                    title="Major"
                    onPress={() => handleSeverityChange(defect.id, 'major')}
                    variant={defect.severity === 'major' ? 'primary' : 'outline'}
                    size="small"
                  />
                  <Button
                    title="Critical"
                    onPress={() => handleSeverityChange(defect.id, 'critical')}
                    variant={defect.severity === 'critical' ? 'primary' : 'outline'}
                    size="small"
                  />
                </View>
              </View>
            ))}
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemCard: {
    margin: spacing[2],
    padding: spacing[3],
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: spacing[3],
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  itemCategory: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  itemNotes: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[2],
    fontStyle: 'italic',
  },
  defectContainer: {
    marginTop: spacing[3],
    padding: spacing[2],
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
  },
  defectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  defectDescription: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 8,
    marginLeft: spacing[2],
  },
  severityText: {
    ...typography.styles.caption,
    fontWeight: typography.fontWeight.semibold,
  },
  severityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing[2],
  },
});

export default InspectionChecklist;
