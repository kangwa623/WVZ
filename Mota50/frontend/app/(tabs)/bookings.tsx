import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Icon from '@/components/common/Icon';
import BookingForm from '@/components/booking/BookingForm';
import bookingService from '@/services/booking';
import { Booking } from '@/types';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (bookingData: any) => {
    try {
      await bookingService.createBooking(bookingData);
      Alert.alert('Success', 'Booking created successfully');
      setShowForm(false);
      loadBookings();
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.semantic.success;
      case 'pending':
        return colors.semantic.warning;
      case 'rejected':
        return colors.semantic.error;
      case 'active':
        return colors.primary.main;
      default:
        return colors.text.secondary;
    }
  };

  if (showForm) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title="Back"
            onPress={() => setShowForm(false)}
            variant="text"
            icon="arrow-back"
          />
        </View>
        <BookingForm onSubmit={handleCreateBooking} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Button
          title="New Booking"
          onPress={() => setShowForm(true)}
          icon="add"
          size="small"
        />
      </View>

      <ScrollView style={styles.content}>
        {bookings.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon name="event-busy" size="xlarge" color="textTertiary" />
            <Text style={styles.emptyText}>No bookings found</Text>
            <Button
              title="Create Booking"
              onPress={() => setShowForm(true)}
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.vehicleText}>
                    {booking.vehicle?.registrationNumber || 'N/A'}
                  </Text>
                  <Text style={styles.purposeText}>{booking.purpose}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(booking.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(booking.status) },
                    ]}
                  >
                    {booking.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Icon name="place" size="small" color="textSecondary" />
                  <Text style={styles.detailText}>{booking.destination}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="event" size="small" color="textSecondary" />
                  <Text style={styles.detailText}>
                    {new Date(booking.startDate).toLocaleDateString()} -{' '}
                    {new Date(booking.endDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="account-balance" size="small" color="textSecondary" />
                  <Text style={styles.detailText}>{booking.costCenter}</Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  emptyCard: {
    margin: spacing[4],
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  emptyButton: {
    marginTop: spacing[2],
  },
  bookingCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  bookingInfo: {
    flex: 1,
  },
  vehicleText: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  purposeText: {
    ...typography.styles.body,
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
  bookingDetails: {
    marginTop: spacing[2],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  detailText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing[2],
  },
});
