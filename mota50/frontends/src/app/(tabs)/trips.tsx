import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors, typography, spacing } from '@/theme';
import TripLogger from '@/components/trips/TripLogger';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import tripService from '@/services/trips';
import { Trip } from '@/types';

export default function TripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

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

  const handleTripStopped = () => {
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
          trips.map((trip) => (
            <Card key={trip.id} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Icon name="directions-car" size="medium" color="primary" />
                <View style={styles.tripInfo}>
                  <Text style={styles.tripDestination}>{trip.destination}</Text>
                  <Text style={styles.tripDate}>
                    {trip.startedAt
                      ? new Date(trip.startedAt).toLocaleString()
                      : 'N/A'}
                  </Text>
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
              <View style={styles.tripDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Mileage:</Text>
                  <Text style={styles.detailValue}>
                    {trip.startMileage} - {trip.endMileage || 'N/A'} km
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Passengers:</Text>
                  <Text style={styles.detailValue}>{trip.passengerCount}</Text>
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
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  tripDate: {
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
  tripDetails: {
    marginTop: spacing[2],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  detailLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
});
