import apiClient from './api';

interface Violation {
  id: string;
  type: string;
  description: string;
  points: number;
  date: string;
  driverId: string;
  tripId?: string;
}

class ViolationService {
  async getViolations(): Promise<Violation[]> {
    return apiClient.get<Violation[]>('/violations/');
  }

  async getViolation(id: string): Promise<Violation> {
    return apiClient.get<Violation>(`/violations/${id}`);
  }

  async getDriverViolations(driverId: string): Promise<Violation[]> {
    return apiClient.get<Violation[]>(`/violations/driver/${driverId}`);
  }
}

export const violationService = new ViolationService();
export default violationService;
