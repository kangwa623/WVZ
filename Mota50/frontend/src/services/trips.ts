import apiClient from './api';
import { Trip, StartTripRequest, StopTripRequest } from '@/types';
import storage from '@/utils/storage';

const TRIPS_LIST_KEY = 'trips_list';

// Mock trip data for MVP
const createMockTrip = (data: StartTripRequest, destination: string, purpose: string): Trip => {
  const now = new Date().toISOString();
  return {
    id: `trip_${Date.now()}`,
    bookingId: data.bookingId || 'booking_1',
    vehicleId: 'vehicle_1',
    driverId: 'driver_1',
    startMileage: data.startMileage,
    startLocation: data.startLocation,
    destination,
    purpose,
    passengerCount: data.passengerCount,
    status: 'in_progress',
    startedAt: now,
    createdAt: now,
    updatedAt: now,
  };
};

class TripService {
  // Helper method to get trips from storage
  private async getStoredTrips(): Promise<Trip[]> {
    try {
      const tripsJson = await storage.getItem(TRIPS_LIST_KEY);
      if (tripsJson) {
        return JSON.parse(tripsJson);
      }
      return [];
    } catch (error) {
      console.error('Error loading trips from storage:', error);
      return [];
    }
  }

  // Helper method to save trips to storage
  private async saveTripsToStorage(trips: Trip[]): Promise<void> {
    try {
      await storage.setItem(TRIPS_LIST_KEY, JSON.stringify(trips));
    } catch (error) {
      console.error('Error saving trips to storage:', error);
    }
  }

  async getTrips(): Promise<Trip[]> {
    try {
      const trips = await apiClient.get<Trip[]>('/trips/');
      // Filter to only completed trips for history
      const completedTrips = trips.filter((trip) => trip.status === 'completed');
      // Save only completed trips to storage
      await this.saveTripsToStorage(completedTrips);
      return completedTrips;
    } catch (error) {
      // Return only completed trips from persistent storage
      const allTrips = await this.getStoredTrips();
      return allTrips.filter((trip) => trip.status === 'completed');
    }
  }

  async getTrip(id: string): Promise<Trip> {
    try {
      return await apiClient.get<Trip>(`/trips/${id}`);
    } catch (error) {
      // Try to get from storage (for mock trips)
      const storedTrip = await storage.getItem(`trip_${id}`);
      if (storedTrip) {
        return JSON.parse(storedTrip);
      }
      throw new Error('Trip not found');
    }
  }

  async startTrip(data: StartTripRequest & { destination?: string; purpose?: string }): Promise<Trip> {
    try {
      const trip = await apiClient.post<Trip>('/trips/start', data);
      // Store trip for offline access (for active trip tracking)
      await storage.setItem(`trip_${trip.id}`, JSON.stringify(trip));
      // Don't add in-progress trips to history list - only completed trips should be in history
      // The trip will be added when it's completed (in stopTrip)
      return trip;
    } catch (error) {
      // Use mock data for MVP
      const mockTrip = createMockTrip(
        data,
        data.destination || 'Unknown Destination',
        data.purpose || 'Unknown Purpose'
      );
      // Store mock trip for offline access (for active trip tracking)
      await storage.setItem(`trip_${mockTrip.id}`, JSON.stringify(mockTrip));
      // Don't add in-progress trips to history list - only completed trips should be in history
      // The trip will be added when it's completed (in stopTrip)
      return mockTrip;
    }
  }

  async stopTrip(data: StopTripRequest): Promise<Trip> {
    try {
      const trip = await apiClient.post<Trip>('/trips/stop', data);
      // Ensure real-time metrics are included (API might not return them)
      // Also ensure destination, purpose, and passengerCount are preserved
      const tripWithMetrics: Trip = {
        ...trip,
        destination: trip.destination || 'Unknown Destination', // Preserve destination
        purpose: trip.purpose || 'Unknown Purpose', // Preserve purpose
        passengerCount: trip.passengerCount || 0, // Preserve passenger count exactly as entered
        endMileage: data.endMileage, // Use the calculated endMileage
        endLocation: data.endLocation, // Use the current endLocation
        distance: data.distance,
        elapsedTime: data.elapsedTime,
        averageSpeed: data.averageSpeed,
      };
      // Update stored trip with real-time metrics
      await storage.setItem(`trip_${tripWithMetrics.id}`, JSON.stringify(tripWithMetrics));
      // Update in trips list - only completed trips should be in history
      const trips = await this.getStoredTrips();
      const existingIndex = trips.findIndex((t) => t.id === tripWithMetrics.id);
      if (existingIndex >= 0) {
        trips[existingIndex] = tripWithMetrics;
      } else {
        // Only add if status is completed
        if (tripWithMetrics.status === 'completed') {
          trips.unshift(tripWithMetrics); // Add to beginning
        }
      }
      // Filter to only completed trips before saving
      const completedTrips = trips.filter((trip) => trip.status === 'completed');
      await this.saveTripsToStorage(completedTrips);
      return tripWithMetrics;
    } catch (error) {
      // Get existing trip and update it with real-time values
      const existingTrip = await this.getTrip(data.tripId);
      const updatedTrip: Trip = {
        ...existingTrip,
        // Preserve all original trip data (destination, purpose, passengerCount, etc.)
        destination: existingTrip.destination, // Ensure destination is preserved
        purpose: existingTrip.purpose, // Ensure purpose is preserved
        passengerCount: existingTrip.passengerCount, // Ensure passenger count is preserved exactly as entered
        endMileage: data.endMileage,
        endLocation: {
          ...data.endLocation,
        },
        status: 'completed',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Store real-time metrics
        distance: data.distance,
        elapsedTime: data.elapsedTime,
        averageSpeed: data.averageSpeed,
      };
      await storage.setItem(`trip_${updatedTrip.id}`, JSON.stringify(updatedTrip));
      // Update in trips list - only completed trips should be in history
      const trips = await this.getStoredTrips();
      const existingIndex = trips.findIndex((t) => t.id === updatedTrip.id);
      if (existingIndex >= 0) {
        trips[existingIndex] = updatedTrip;
      } else {
        // Only add if status is completed
        if (updatedTrip.status === 'completed') {
          trips.unshift(updatedTrip); // Add to beginning
        }
      }
      // Filter to only completed trips before saving
      const completedTrips = trips.filter((trip) => trip.status === 'completed');
      await this.saveTripsToStorage(completedTrips);
      return updatedTrip;
    }
  }

  async clearTripHistory(): Promise<void> {
    try {
      // Step 1: Get all trips FIRST before clearing the key, so we know which items to delete
      const trips = await this.getStoredTrips();
      
      // Step 2: Clear all completed trip items (these are the ones in history)
      const completedTrips = trips.filter((trip) => trip.status === 'completed');
      for (const trip of completedTrips) {
        try {
          await storage.deleteItem(`trip_${trip.id}`);
        } catch (error) {
          console.warn(`Failed to delete trip_${trip.id}:`, error);
        }
      }
      
      // Step 3: Clear the trips list from storage
      await storage.deleteItem(TRIPS_LIST_KEY);
      
      // Step 4: For web, scan localStorage for any remaining trip_ items and delete completed ones
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith('trip_') && key !== TRIPS_LIST_KEY) {
            try {
              const tripData = localStorage.getItem(key);
              if (tripData) {
                try {
                  const trip = JSON.parse(tripData);
                  // Delete if it's a completed trip (part of history)
                  if (trip.status === 'completed') {
                    localStorage.removeItem(key);
                  }
                } catch (parseError) {
                  // If parsing fails, delete it anyway (might be corrupted data)
                  localStorage.removeItem(key);
                }
              } else {
                // If no data, delete the key anyway
                localStorage.removeItem(key);
              }
            } catch (error) {
              console.warn(`Failed to delete ${key}:`, error);
            }
          }
        }
      }
      
      // Step 5: Final verification - ensure the trips list is cleared
      const verify = await storage.getItem(TRIPS_LIST_KEY);
      if (verify !== null) {
        console.warn('Warning: TRIPS_LIST_KEY still exists after deletion, retrying...');
        await storage.deleteItem(TRIPS_LIST_KEY);
      }
      
      // Step 6: Ensure the storage is truly empty by setting an empty array
      await this.saveTripsToStorage([]);
    } catch (error) {
      console.error('Error clearing trip history:', error);
      throw error;
    }
  }

  async getActiveTrip(): Promise<Trip | null> {
    try {
      return await apiClient.get<Trip>('/trips/active');
    } catch {
      // Try to find active trip in storage
      // This is a simplified approach for MVP
      return null;
    }
  }
}

export const tripService = new TripService();
export default tripService;
