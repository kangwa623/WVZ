import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing } from '@/theme';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import { CreateBookingRequest } from '@/types';
import bookingService from '@/services/booking';
import vehicleService from '@/services/vehicles';
import { Vehicle } from '@/types';

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
              onPress={() => setShowStartPicker(true)}
              variant="outline"
              size="small"
              fullWidth
            />
          </View>
          <View style={styles.dateInput}>
            <Text style={styles.dateLabel}>End Date & Time</Text>
            <Button
              title={endDate.toLocaleString()}
              onPress={() => setShowEndPicker(true)}
              variant="outline"
              size="small"
              fullWidth
            />
          </View>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowStartPicker(false);
              if (date) setStartDate(date);
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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

        <Input
          label="Project Code *"
          placeholder="Enter project code"
          value={projectCode}
          onChangeText={setProjectCode}
          icon="code"
        />

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
});

export default BookingForm;
