import apiClient from './api';

interface Incident {
  id: string;
  type: 'accident' | 'breakdown' | 'violation' | 'other';
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photos: string[];
  driverId: string;
  tripId?: string;
  violationPoints?: number;
  createdAt: string;
}

class IncidentService {
  async getIncidents(): Promise<Incident[]> {
    return apiClient.get<Incident[]>('/incidents/');
  }

  async reportIncident(data: Partial<Incident>): Promise<Incident> {
    return apiClient.post<Incident>('/incidents/', data);
  }

  async getIncident(id: string): Promise<Incident> {
    return apiClient.get<Incident>(`/incidents/${id}`);
  }
}

export const incidentService = new IncidentService();
export default incidentService;
