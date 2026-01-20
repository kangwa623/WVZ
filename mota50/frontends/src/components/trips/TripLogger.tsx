import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { colors, typography, spacing } from '@/theme';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import tripService from '@/services/trips';
import { Trip } from '@/types';

interface TripLoggerProps {
  bookingId?: string;
  onTripStarted?: (trip: Trip) => void;
  onTripStopped?: (trip: Trip) => void;
}

const TripLogger: React.FC<TripLoggerProps> = ({
  bookingId,
  onTripStarted,
  onTripStopped,
}) => {
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [startMileage, setStartMileage] = useState('');
  const [endMileage, setEndMileage] = useState('');
  const [passengerCount, setPassengerCount] = useState('');
  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkActiveTrip();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required for trip logging');
    }
  };

  const checkActiveTrip = async () => {
    try {
      const trip = await tripService.getActiveTrip();
      setActiveTrip(trip);
    } catch (error) {
      // No active trip
    }
  };

  const getCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      return loc;
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
      return null;
    }
  };

  const handleStartTrip = async () => {
    if (!startMileage || !passengerCount || !destination || !purpose) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!bookingId) {
      Alert.alert('Error', 'No booking selected');
      return;
    }

    const loc = await getCurrentLocation();
    if (!loc) return;

    setLoading(true);
    try {
      const trip = await tripService.startTrip({
        bookingId,
        startMileage: parseInt(startMileage),
        startLocation: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
        passengerCount: parseInt(passengerCount),
      });

      setActiveTrip(trip);
      if (onTripStarted) onTripStarted(trip);
      Alert.alert('Success', 'Trip started successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to start trip');
    } finally {
      setLoading(false);
    }
  };

  const handleStopTrip = async () => {
    if (!endMileage || !activeTrip) {
      Alert.alert('Error', 'Please enter end mileage');
      return;
    }

    const loc = await getCurrentLocation();
    if (!loc) return;

    setLoading(true);
    try {
      const trip = await tripService.stopTrip({
        tripId: activeTrip.id,
        endMileage: parseInt(endMileage),
        endLocation: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
      });

      setActiveTrip(null);
      if (onTripStopped) onTripStopped(trip);
      Alert.alert('Success', 'Trip completed successfully');
      // Reset form
      setStartMileage('');
      setEndMileage('');
      setPassengerCount('');
      setDestination('');
      setPurpose('');
    } catch (error) {
      Alert.alert('Error', 'Failed to stop trip');
    } finally {
      setLoading(false);
    }
  };

  if (activeTrip) {
    return (
      <Card style={styles.card}>
        <View style={styles.activeTripHeader}>
          <Icon name="directions-car" size="large" color="primary" />
          <Text style={styles.activeTripTitle}>Active Trip</Text>
        </View>

        <View style={styles.tripInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start Mileage:</Text>
            <Text style={styles.infoValue}>{activeTrip.startMileage} km</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Destination:</Text>
            <Text style={styles.infoValue}>{activeTrip.destination}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Passengers:</Text>
            <Text style={styles.infoValue}>{activeTrip.passengerCount}</Text>
          </View>
        </View>

        <Input
          label="End Mileage *"
          placeholder="Enter end mileage"
          value={endMileage}
          onChangeText={setEndMileage}
          keyboardType="numeric"
          icon="speed"
        />

        <Button
          title="Stop Trip"
          onPress={handleStopTrip}
          loading={loading}
          fullWidth
          icon="stop"
          variant="outline"
          style={styles.stopButton}
        />
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Start New Trip</Text>

      <Input
        label="Start Mileage *"
        placeholder="Enter start mileage"
        value={startMileage}
        onChangeText={setStartMileage}
        keyboardType="numeric"
        icon="speed"
      />

      <Input
        label="Destination *"
        placeholder="Enter destination"
        value={destination}
        onChangeText={setDestination}
        icon="place"
      />

      <Input
        label="Purpose *"
        placeholder="Enter trip purpose"
        value={purpose}
        onChangeText={setPurpose}
        icon="description"
      />

      <Input
        label="Passenger Count *"
        placeholder="Enter number of passengers"
        value={passengerCount}
        onChangeText={setPassengerCount}
        keyboardType="numeric"
        icon="people"
      />

      <Button
        title="Start Trip"
        onPress={handleStartTrip}
        loading={loading}
        fullWidth
        icon="play-arrow"
        style={styles.startButton}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: spacing[4],
    padding: spacing[4],
  },
  title: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  activeTripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  activeTripTitle: {
    ...typography.styles.h3,
    color: colors.primary.main,
    marginLeft: spacing[2],
  },
  tripInfo: {
    marginBottom: spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  infoLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  startButton: {
    marginTop: spacing[4],
  },
  stopButton: {
    marginTop: spacing[4],
  },
});

export default TripLogger;
