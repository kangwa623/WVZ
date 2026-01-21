import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import Icon from '@/components/common/Icon';
import Button from '@/components/common/Button';
import tripService from '@/services/trips';
import { Trip } from '@/types';
import WebMapView from './WebMapView';

// Use WebMapView with OpenStreetMap for all platforms
const MapView = ({ 
  children, 
  style, 
  initialLocation, 
  currentLocation, 
  routeCoordinates, 
  startLocation, 
  ...props 
}: any) => {
  const currentLoc = currentLocation?.coords 
    ? { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude }
    : undefined;
  
  const startLoc = startLocation 
    ? { latitude: startLocation.latitude, longitude: startLocation.longitude }
    : undefined;

  const initLoc = initialLocation || startLoc;

  return (
    <WebMapView
      style={style}
      initialLocation={initLoc}
      currentLocation={currentLoc}
      routeCoordinates={routeCoordinates}
      startLocation={startLoc}
    />
  );
};

interface ActiveTripMapScreenProps {
  trip: Trip;
  onTripStopped?: (trip: Trip) => void;
}

export default function ActiveTripMapScreen({ trip, onTripStopped }: ActiveTripMapScreenProps) {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [speed, setSpeed] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const startTimeRef = useRef<Date>(new Date());

  useEffect(() => {
    startLocationTracking();
    startTimeRef.current = trip.startedAt ? new Date(trip.startedAt) : new Date();
    
    // Update elapsed time every second
    const timeInterval = setInterval(() => {
      const elapsed = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      clearInterval(timeInterval);
    };
  }, []);

  // Calculate distance from route coordinates
  useEffect(() => {
    if (routeCoordinates.length < 2) {
      setDistance(0);
      return;
    }

    let totalDistance = 0;
    for (let i = 1; i < routeCoordinates.length; i++) {
      const prev = routeCoordinates[i - 1];
      const curr = routeCoordinates[i];
      totalDistance += calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    }
    setDistance(totalDistance);
  }, [routeCoordinates]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required for trip tracking');
      return;
    }

    // Get initial location
    const initialLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    setCurrentLocation(initialLocation);
    
    // Add initial location to route
    if (initialLocation) {
      setRouteCoordinates([{
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
      }]);
    }

    // Watch position for real-time updates
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update every 10 meters
      },
      (location) => {
        setCurrentLocation(location);
        
        // Update speed (convert m/s to km/h)
        if (location.coords.speed !== null && location.coords.speed !== undefined) {
          setSpeed(Math.round(location.coords.speed * 3.6)); // m/s to km/h
        }
        
        setRouteCoordinates((prev) => [
          ...prev,
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        ]);
      }
    );
  };

  const handleStopTrip = async () => {
    // Don't use loading state - navigate immediately
    try {
      const loc = await Location.getCurrentPositionAsync({});
      if (!loc) {
        Alert.alert('Error', 'Failed to get current location');
        return;
      }

      // Ensure we have the latest values
      const finalDistance = distance || 0;
      const finalElapsedTime = elapsedTime || 0;
      
      // Calculate end mileage from start mileage + distance traveled (distance is in km, mileage is in km)
      // Round to nearest integer for mileage
      const endMileage = Math.round(trip.startMileage + finalDistance);
      
      // Calculate average speed (distance in km / time in hours)
      const averageSpeed = finalElapsedTime > 0 ? (finalDistance / (finalElapsedTime / 3600)) : 0;

      console.log('Stopping trip with real-time values:', {
        tripId: trip.id,
        startMileage: trip.startMileage,
        distance: finalDistance,
        endMileage,
        elapsedTime: finalElapsedTime,
        averageSpeed,
      });

      // Stop location tracking immediately
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }

      // Navigate immediately without waiting for storage operations
      if (onTripStopped) {
        // Call callback immediately with trip data, storage will happen in background
        const stoppedTripData = {
          ...trip,
          endMileage,
          endLocation: {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          },
          status: 'completed' as const,
          completedAt: new Date().toISOString(),
          distance: parseFloat(finalDistance.toFixed(2)),
          elapsedTime: finalElapsedTime,
          averageSpeed: parseFloat(averageSpeed.toFixed(2)),
        };
        onTripStopped(stoppedTripData);
      }
      
      // Navigate immediately
      router.replace('/(tabs)/trips');
      
      // Save to storage in background (non-blocking)
      tripService.stopTrip({
        tripId: trip.id,
        endMileage,
        endLocation: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
        distance: parseFloat(finalDistance.toFixed(2)),
        elapsedTime: finalElapsedTime,
        averageSpeed: parseFloat(averageSpeed.toFixed(2)),
      }).catch((error) => {
        console.error('Error saving trip to storage (non-blocking):', error);
      });
    } catch (error) {
      console.error('Error stopping trip:', error);
      Alert.alert('Error', 'Failed to stop trip');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/trips')} style={styles.backButton}>
          <Icon name="arrow-back" size="medium" color={colors.base.white} iconSet="MaterialIcons" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Active Trip</Text>
          <Text style={styles.headerSubtitle}>{trip.destination}</Text>
        </View>
      </View>

      {/* Map - Using OpenStreetMap for all platforms */}
      <MapView
        style={styles.map}
        initialLocation={trip.startLocation}
        startLocation={trip.startLocation}
        currentLocation={currentLocation}
        routeCoordinates={routeCoordinates}
      />

      {/* Metrics Card */}
      <View style={styles.metricsCard}>
        <View style={styles.metricsRow}>
          {/* Speed */}
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>SPEED</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{speed}</Text>
              <Text style={styles.metricUnit}>km/h</Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Time */}
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>TIME</Text>
            <Text style={styles.metricValue}>{formatTime(elapsedTime)}</Text>
          </View>

          <View style={styles.separator} />

          {/* Distance */}
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>DIST.</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{distance.toFixed(1)}</Text>
              <Text style={styles.metricUnit}>km</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stop Trip Button */}
      <View style={styles.buttonCard}>
        <Button
          title="Stop Trip"
          onPress={handleStopTrip}
          variant="outline"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary.main,
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-specific style
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: colors.base.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    }),
  },
  backButton: {
    marginRight: spacing[3],
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...typography.styles.h4,
    color: colors.base.white,
    fontWeight: typography.fontWeight.bold,
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  headerSubtitle: {
    ...typography.styles.body,
    color: colors.base.white,
    opacity: 0.9,
    marginTop: spacing[1],
    ...(typography.fontFamily.regular && { fontFamily: typography.fontFamily.regular }),
  },
  map: {
    flex: 1,
  },
  metricsCard: {
    backgroundColor: colors.base.white,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-specific style
      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: colors.base.black,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing[2],
  },
  separator: {
    width: 1,
    height: '60%',
    backgroundColor: colors.border.light,
  },
  metricLabel: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: spacing[5],
    textTransform: 'uppercase',
    opacity: 0.7,
    ...(typography.fontFamily.medium && { fontFamily: typography.fontFamily.medium }),
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  metricValue: {
    ...typography.styles.h2,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  metricUnit: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    marginLeft: spacing[1],
    ...(typography.fontFamily.regular && { fontFamily: typography.fontFamily.regular }),
  },
  buttonCard: {
    backgroundColor: colors.base.white,
    padding: spacing[4],
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-specific style
      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: colors.base.black,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
});
