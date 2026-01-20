export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  vehicleId: string;
  vehicle?: {
    id: string;
    registrationNumber: string;
    make: string;
    model: string;
  };
  userId: string;
  driverId?: string;
  startDate: string;
  endDate: string;
  purpose: string;
  destination: string;
  costCenter: string;
  projectCode: string;
  status: BookingStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  vehicleId: string;
  startDate: string;
  endDate: string;
  purpose: string;
  destination: string;
  costCenter: string;
  projectCode: string;
  driverId?: string;
}
