import apiClient from './api';

interface Maintenance {
  id: string;
  vehicleId: string;
  type: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  mileage: number;
  cost?: number;
  status: 'scheduled' | 'in_progress' | 'completed';
}

class MaintenanceService {
  async getMaintenance(): Promise<Maintenance[]> {
    return apiClient.get<Maintenance[]>('/maintenance/');
  }

  async getVehicleMaintenance(vehicleId: string): Promise<Maintenance[]> {
    return apiClient.get<Maintenance[]>(`/maintenance/vehicle/${vehicleId}`);
  }

  async scheduleMaintenance(data: Partial<Maintenance>): Promise<Maintenance> {
    return apiClient.post<Maintenance>('/maintenance/', data);
  }

  async updateMaintenance(id: string, data: Partial<Maintenance>): Promise<Maintenance> {
    return apiClient.patch<Maintenance>(`/maintenance/${id}`, data);
  }
}

export const maintenanceService = new MaintenanceService();
export default maintenanceService;
