import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colors, typography, spacing } from '@/theme';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import { CreateBookingRequest } from '@/types';
import bookingService from '@/services/booking';
import vehicleService from '@/services/vehicles';
import { Vehicle } from '@/types';

// Project codes with 2-digit suffixes
const PROJECT_CODES = [
  { code: 'CP23', label: 'Child Protection' },
  { code: 'LT45', label: 'Literacy' },
  { code: 'RL67', label: 'Resilience & Livelihoods' },
  { code: 'WS89', label: 'Water Sanitation & Hygiene (WASH)' },
  { code: 'ER12', label: 'Emergency Response' },
];

interface BookingFormProps {
  onSubmit: (booking: CreateBookingRequest) => void;
  initialData?: Partial<CreateBookingRequest>;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, initialData }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [purpose, setPurpose] = useState('');
  const [destination, setDestination] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [showProjectCodePicker, setShowProjectCodePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getVehicles();
      setVehicles(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load vehicles');
    }
  };

  const handleStartDatePress = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: startDate,
        mode: 'date',
        onChange: (event, date) => {
          if (event.type === 'set' && date) {
            // After date is selected, open time picker
            DateTimePickerAndroid.open({
              value: date,
              mode: 'time',
              onChange: (timeEvent, timeDate) => {
                if (timeEvent.type === 'set' && timeDate) {
                  // Combine date and time
                  const combinedDate = new Date(date);
                  combinedDate.setHours(timeDate.getHours());
                  combinedDate.setMinutes(timeDate.getMinutes());
                  setStartDate(combinedDate);
                }
              },
            });
          }
        },
      });
    } else {
      setShowStartPicker(true);
    }
  };

  const handleEndDatePress = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: endDate,
        mode: 'date',
        onChange: (event, date) => {
          if (event.type === 'set' && date) {
            // After date is selected, open time picker
            DateTimePickerAndroid.open({
              value: date,
              mode: 'time',
              onChange: (timeEvent, timeDate) => {
                if (timeEvent.type === 'set' && timeDate) {
                  // Combine date and time
                  const combinedDate = new Date(date);
                  combinedDate.setHours(timeDate.getHours());
                  combinedDate.setMinutes(timeDate.getMinutes());
                  setEndDate(combinedDate);
                }
              },
            });
          }
        },
      });
    } else {
      setShowEndPicker(true);
    }
  };

  const handleSubmit = async () => {
    if (!selectedVehicleId || !purpose || !destination || !costCenter || !projectCode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      const bookingData: CreateBookingRequest = {
        vehicleId: selectedVehicleId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        purpose,
        destination,
        costCenter,
        projectCode,
      };
      onSubmit(bookingData);
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Create Booking</Text>

        <Input
          label="Vehicle"
          placeholder="Select vehicle"
          value={vehicles.find(v => v.id === selectedVehicleId)?.registrationNumber || ''}
          editable={false}
          icon="local-shipping"
        />

        <View style={styles.dateRow}>
          <View style={styles.dateInput}>
            <Text style={styles.dateLabel}>Start Date & Time</Text>
            <Button
              title={startDate.toLocaleString()}
              onPress={handleStartDatePress}
              variant="outline"
              size="small"
              fullWidth
            />
          </View>
          <View style={styles.dateInput}>
            <Text style={styles.dateLabel}>End Date & Time</Text>
            <Button
              title={endDate.toLocaleString()}
              onPress={handleEndDatePress}
              variant="outline"
              size="small"
              fullWidth
            />
          </View>
        </View>

        {/* Only show DateTimePicker on iOS */}
        {Platform.OS === 'ios' && showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="datetime"
            display="spinner"
            onChange={(event, date) => {
              setShowStartPicker(false);
              if (date) setStartDate(date);
            }}
          />
        )}

        {Platform.OS === 'ios' && showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="datetime"
            display="spinner"
            onChange={(event, date) => {
              setShowEndPicker(false);
              if (date) setEndDate(date);
            }}
          />
        )}

        <Input
          label="Purpose *"
          placeholder="Enter trip purpose"
          value={purpose}
          onChangeText={setPurpose}
          icon="description"
        />

        <Input
          label="Destination *"
          placeholder="Enter destination"
          value={destination}
          onChangeText={setDestination}
          icon="place"
        />

        <Input
          label="Cost Center *"
          placeholder="Enter cost center"
          value={costCenter}
          onChangeText={setCostCenter}
          icon="account-balance"
        />

        <View style={styles.projectCodeContainer}>
          <Text style={styles.dateLabel}>Project Code *</Text>
          <TouchableOpacity
            style={styles.projectCodeButton}
            onPress={() => setShowProjectCodePicker(true)}
          >
            <View style={styles.projectCodeButtonContent}>
              <Icon
                name="code"
                size="small"
                color={projectCode ? colors.text.primary : colors.text.tertiary}
                iconSet="MaterialIcons"
              />
              <Text
                style={[
                  styles.projectCodeButtonText,
                  !projectCode && styles.projectCodeButtonTextPlaceholder,
                ]}
              >
                {projectCode
                  ? PROJECT_CODES.find((p) => p.code === projectCode)?.label || projectCode
                  : 'Select project code'}
              </Text>
              <Icon
                name="keyboard-arrow-down"
                size="small"
                color={colors.text.secondary}
                iconSet="MaterialIcons"
              />
            </View>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showProjectCodePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowProjectCodePicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowProjectCodePicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Project Code</Text>
                <TouchableOpacity onPress={() => setShowProjectCodePicker(false)}>
                  <Icon name="close" size="medium" color={colors.text.primary} iconSet="MaterialIcons" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {PROJECT_CODES.map((project) => (
                  <TouchableOpacity
                    key={project.code}
                    style={[
                      styles.projectCodeOption,
                      projectCode === project.code && styles.projectCodeOptionSelected,
                    ]}
                    onPress={() => {
                      setProjectCode(project.code);
                      setShowProjectCodePicker(false);
                    }}
                  >
                    <View style={styles.projectCodeOptionContent}>
                      <Text
                        style={[
                          styles.projectCodeOptionCode,
                          projectCode === project.code && styles.projectCodeOptionCodeSelected,
                        ]}
                      >
                        {project.code}
                      </Text>
                      <Text
                        style={[
                          styles.projectCodeOptionLabel,
                          projectCode === project.code && styles.projectCodeOptionLabelSelected,
                        ]}
                      >
                        {project.label}
                      </Text>
                    </View>
                    {projectCode === project.code && (
                      <Icon
                        name="check"
                        size="small"
                        color={colors.primary.main}
                        iconSet="MaterialIcons"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        <Button
          title="Create Booking"
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          icon="add"
          style={styles.submitButton}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  card: {
    margin: spacing[4],
    padding: spacing[4],
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  dateInput: {
    flex: 1,
    marginHorizontal: spacing[1],
  },
  dateLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontWeight: typography.fontWeight.medium,
  },
  submitButton: {
    marginTop: spacing[4],
  },
  projectCodeContainer: {
    marginBottom: spacing[4],
  },
  projectCodeButton: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    minHeight: 48,
    justifyContent: 'center',
  },
  projectCodeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  projectCodeButtonText: {
    ...typography.styles.body,
    color: colors.text.primary,
    flex: 1,
    marginLeft: spacing[2],
  },
  projectCodeButtonTextPlaceholder: {
    color: colors.text.tertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: spacing[4],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  projectCodeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  projectCodeOptionSelected: {
    backgroundColor: colors.primary.main + '10',
  },
  projectCodeOptionContent: {
    flex: 1,
  },
  projectCodeOptionCode: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  projectCodeOptionCodeSelected: {
    color: colors.primary.main,
  },
  projectCodeOptionLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  projectCodeOptionLabelSelected: {
    color: colors.text.primary,
  },
});

export default BookingForm;
