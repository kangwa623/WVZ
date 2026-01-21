import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import ActiveTripMapScreen from '@/screens/trips/ActiveTripMapScreen';
import tripService from '@/services/trips';
import { Trip } from '@/types';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/theme';

export default function ActiveTripRoute() {
  const { tripId, tripData } = useLocalSearchParams<{ tripId?: string; tripData?: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip();
  }, [tripId, tripData]);

  const loadTrip = async () => {
    try {
      // If trip data is passed directly, use it immediately
      if (tripData) {
        try {
          const parsedTrip = JSON.parse(tripData);
          setTrip(parsedTrip);
          setLoading(false);
          return;
        } catch (e) {
          // If parsing fails, fall through to fetch by ID
        }
      }
      
      // Otherwise, fetch trip by ID
      if (tripId) {
        const tripData = await tripService.getTrip(tripId);
        setTrip(tripData);
      }
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTripStopped = (stoppedTrip: Trip) => {
    // Pass the completed trip data back to trips screen
    router.replace({
      pathname: '/(tabs)/trips',
      params: { completedTrip: JSON.stringify(stoppedTrip) },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Trip not found</Text>
      </View>
    );
  }

  return <ActiveTripMapScreen trip={trip} onTripStopped={handleTripStopped} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});
