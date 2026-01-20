import apiClient from './api';

class AnalyticsService {
  async getDashboardData(role: string) {
    return apiClient.get(`/analytics/dashboard?role=${role}`);
  }

  async getVehicleUtilization(startDate: string, endDate: string) {
    return apiClient.get('/analytics/vehicle-utilization', {
      params: { startDate, endDate },
    });
  }

  async getFuelConsumption(startDate: string, endDate: string) {
    return apiClient.get('/analytics/fuel-consumption', {
      params: { startDate, endDate },
    });
  }

  async getCostByCostCenter(startDate: string, endDate: string) {
    return apiClient.get('/analytics/cost-by-cost-center', {
      params: { startDate, endDate },
    });
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
