import apiClient from './api';
import { Inspection, CreateInspectionRequest } from '@/types';

class InspectionService {
  async getInspections(): Promise<Inspection[]> {
    return apiClient.get<Inspection[]>('/inspections/');
  }

  async getInspection(id: string): Promise<Inspection> {
    return apiClient.get<Inspection>(`/inspections/${id}`);
  }

  async createInspection(data: CreateInspectionRequest): Promise<Inspection> {
    return apiClient.post<Inspection>('/inspections/', data);
  }

  async updateInspection(id: string, data: Partial<CreateInspectionRequest>): Promise<Inspection> {
    return apiClient.patch<Inspection>(`/inspections/${id}`, data);
  }

  async submitInspection(id: string): Promise<Inspection> {
    return apiClient.post<Inspection>(`/inspections/${id}/submit`);
  }
}

export const inspectionService = new InspectionService();
export default inspectionService;
