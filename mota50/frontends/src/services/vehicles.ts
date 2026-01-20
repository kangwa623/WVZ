import apiClient from './api';
import { Vehicle } from '@/types';

class VehicleService {
  async getVehicles(): Promise<Vehicle[]> {
    return apiClient.get<Vehicle[]>('/vehicles/');
  }

  async getVehicle(id: string): Promise<Vehicle> {
    return apiClient.get<Vehicle>(`/vehicles/${id}`);
  }
}

export const vehicleService = new VehicleService();
export default vehicleService;
