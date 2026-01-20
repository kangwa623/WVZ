export type VehicleType = 'sedan' | 'pickup' | 'minibus' | 'van' | 'truck';
export type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'out_of_service';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  currentMileage: number;
  fuelType: string;
  color?: string;
  imageUrl?: string;
  assignedDriverId?: string;
  lastInspectionDate?: string;
  nextServiceDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleAvailability {
  vehicle: Vehicle;
  isAvailable: boolean;
  nextAvailableTime?: string;
  currentBooking?: string;
}
