import apiClient from './api';
import { Trip, StartTripRequest, StopTripRequest } from '@/types';

class TripService {
  async getTrips(): Promise<Trip[]> {
    return apiClient.get<Trip[]>('/trips/');
  }

  async getTrip(id: string): Promise<Trip> {
    return apiClient.get<Trip>(`/trips/${id}`);
  }

  async startTrip(data: StartTripRequest): Promise<Trip> {
    return apiClient.post<Trip>('/trips/start', data);
  }

  async stopTrip(data: StopTripRequest): Promise<Trip> {
    return apiClient.post<Trip>('/trips/stop', data);
  }

  async getActiveTrip(): Promise<Trip | null> {
    try {
      return await apiClient.get<Trip>('/trips/active');
    } catch {
      return null;
    }
  }
}

export const tripService = new TripService();
export default tripService;
