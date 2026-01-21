import apiClient from './api';
import storage from '@/utils/storage';

const INCIDENTS_STORAGE_KEY = 'reported_incidents';

export interface Incident {
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
  driverName: string;
  driverEmail: string;
  tripId?: string;
  violationPoints?: number;
  status: 'pending' | 'reviewed' | 'resolved' | 'archived';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

class IncidentService {
  private async getStoredIncidents(): Promise<Incident[]> {
    try {
      const incidentsJson = await storage.getItem(INCIDENTS_STORAGE_KEY);
      if (incidentsJson) {
        return JSON.parse(incidentsJson);
      }
      return [];
    } catch (error) {
      console.error('Error loading incidents from storage:', error);
      return [];
    }
  }

  private async saveIncidentsToStorage(incidents: Incident[]): Promise<void> {
    try {
      await storage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(incidents));
    } catch (error) {
      console.error('Error saving incidents to storage:', error);
    }
  }

  async getIncidents(): Promise<Incident[]> {
    try {
      // Try API first, fallback to storage
      return await apiClient.get<Incident[]>('/incidents/');
    } catch (error) {
      // Fallback to local storage
      const incidents = await this.getStoredIncidents();
      return incidents.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  async reportIncident(data: Partial<Incident> & { driverId: string; driverName: string; driverEmail: string }): Promise<Incident> {
    try {
      // Try API first
      return await apiClient.post<Incident>('/incidents/', data);
    } catch (error) {
      // Fallback to local storage
      const incidents = await this.getStoredIncidents();
      const newIncident: Incident = {
        id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: data.type!,
        description: data.description!,
        location: data.location!,
        photos: data.photos || [],
        driverId: data.driverId,
        driverName: data.driverName,
        driverEmail: data.driverEmail,
        tripId: data.tripId,
        violationPoints: data.violationPoints,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      incidents.unshift(newIncident);
      await this.saveIncidentsToStorage(incidents);
      return newIncident;
    }
  }

  async getIncident(id: string): Promise<Incident> {
    try {
      return await apiClient.get<Incident>(`/incidents/${id}`);
    } catch (error) {
      const incidents = await this.getStoredIncidents();
      const incident = incidents.find(i => i.id === id);
      if (!incident) {
        throw new Error('Incident not found');
      }
      return incident;
    }
  }

  async updateIncidentStatus(
    id: string,
    status: Incident['status'],
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<void> {
    const incidents = await this.getStoredIncidents();
    const incidentIndex = incidents.findIndex(i => i.id === id);
    if (incidentIndex !== -1) {
      incidents[incidentIndex].status = status;
      incidents[incidentIndex].reviewedBy = reviewedBy;
      incidents[incidentIndex].reviewedAt = new Date().toISOString();
      if (reviewNotes) {
        incidents[incidentIndex].reviewNotes = reviewNotes;
      }
      await this.saveIncidentsToStorage(incidents);
    }
  }

  async getPendingIncidents(): Promise<Incident[]> {
    const incidents = await this.getStoredIncidents();
    return incidents.filter(i => i.status === 'pending').sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const incidentService = new IncidentService();
export default incidentService;
