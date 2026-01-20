import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import TripLogger from '@/components/trips/TripLogger';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import tripService from '@/services/trips';
import { Trip } from '@/types';

// Format duration in seconds to HH:MM:SS or MM:SS format
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Format duration from start and end dates
const formatDurationFromDates = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
  return formatDuration(seconds);
};

export default function TripsScreen() {
  const { completedTrip } = useLocalSearchParams<{ completedTrip?: string }>();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    // Handle completed trip from navigation params (real-time update)
    if (completedTrip) {
      try {
        const trip = JSON.parse(completedTrip);
        setTrips((prevTrips) => {
          const existingIndex = prevTrips.findIndex((t) => t.id === trip.id);
          if (existingIndex >= 0) {
            const updated = [...prevTrips];
            updated[existingIndex] = trip;
            return updated;
          } else {
            return [trip, ...prevTrips];
          }
        });
        // Reload from service to ensure it's saved to storage
        loadTrips();
      } catch (error) {
        console.error('Error parsing completed trip:', error);
      }
    }
  }, [completedTrip]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTrips();
      setTrips(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleTripStarted = () => {
    loadTrips();
  };

  const handleTripStopped = (trip?: Trip) => {
    // If a trip was passed, add it to the list immediately for real-time update
    // Only add if it's a completed trip
    if (trip && trip.status === 'completed') {
      setTrips((prevTrips) => {
        // Filter to only completed trips first
        const completedTrips = prevTrips.filter((t) => t.status === 'completed');
        // Check if trip already exists, if so update it, otherwise add it at the beginning
        const existingIndex = completedTrips.findIndex((t) => t.id === trip.id);
        if (existingIndex >= 0) {
          const updated = [...completedTrips];
          updated[existingIndex] = trip;
          return updated;
        } else {
          return [trip, ...completedTrips];
        }
      });
    }
    // Also reload from service to ensure consistency (will filter to completed only)
    loadTrips();
  };


  return (
    <ScrollView style={styles.container}>
      <TripLogger onTripStarted={handleTripStarted} onTripStopped={handleTripStopped} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trip History</Text>
        {trips.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon name="history" size="xlarge" color="textTertiary" />
            <Text style={styles.emptyText}>No trips found</Text>
          </Card>
        ) : (
          trips
            .filter((trip) => trip.status === 'completed') // Only show completed trips
            .sort((a, b) => {
              // Sort by most recent first
              const dateA = a.completedAt || a.startedAt || a.createdAt;
              const dateB = b.completedAt || b.startedAt || b.createdAt;
              return new Date(dateB).getTime() - new Date(dateA).getTime();
            })
            .map((trip) => (
            <Card key={trip.id} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Icon name="directions-car" size="medium" color="primary" />
                <View style={styles.tripInfo}>
                  <View style={styles.timeRow}>
                    <Text style={styles.tripDestination}>
                      {trip.destination}
                    </Text>
                    <Text style={styles.tripTime}>
                      {trip.elapsedTime !== undefined
                        ? `Duration: ${formatDuration(trip.elapsedTime)}`
                        : trip.startedAt && trip.completedAt
                        ? `Duration: ${formatDurationFromDates(trip.startedAt, trip.completedAt)}`
                        : 'Duration: N/A'}
                    </Text>
                    <Text style={styles.tripTime}>
                      Distance: {trip.distance !== undefined ? `${trip.distance.toFixed(2)} km` : 'N/A'}
                    </Text>
                    <Text style={styles.tripTime}>
                      Passengers: {trip.passengerCount}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        trip.status === 'completed'
                          ? colors.semantic.success + '20'
                          : trip.status === 'in_progress'
                          ? colors.primary.main + '20'
                          : colors.text.tertiary + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          trip.status === 'completed'
                            ? colors.semantic.success
                            : trip.status === 'in_progress'
                            ? colors.primary.main
                            : colors.text.tertiary,
                      },
                    ]}
                  >
                    {trip.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  section: {
    padding: spacing[4],
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
  tripCard: {
    marginBottom: spacing[3],
    padding: spacing[4],
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  tripInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  tripDestination: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.bold,
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  tripTime: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 8,
  },
  statusText: {
    ...typography.styles.caption,
    fontWeight: typography.fontWeight.semibold,
  },
});
