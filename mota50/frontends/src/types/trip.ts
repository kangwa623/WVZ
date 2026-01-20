export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  bookingId: string;
  vehicleId: string;
  driverId: string;
  startMileage: number;
  endMileage?: number;
  startLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  destination: string;
  purpose: string;
  passengerCount: number;
  status: TripStatus;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StartTripRequest {
  bookingId: string;
  startMileage: number;
  startLocation: {
    latitude: number;
    longitude: number;
  };
  passengerCount: number;
}

export interface StopTripRequest {
  tripId: string;
  endMileage: number;
  endLocation: {
    latitude: number;
    longitude: number;
  };
}
