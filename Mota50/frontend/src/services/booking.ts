import apiClient from './api';
import { Booking, CreateBookingRequest, VehicleAvailability } from '@/types';

class BookingService {
  async getBookings(): Promise<Booking[]> {
    return apiClient.get<Booking[]>('/bookings/');
  }

  async getBooking(id: string): Promise<Booking> {
    return apiClient.get<Booking>(`/bookings/${id}`);
  }

  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    return apiClient.post<Booking>('/bookings/', data);
  }

  async updateBooking(id: string, data: Partial<CreateBookingRequest>): Promise<Booking> {
    return apiClient.patch<Booking>(`/bookings/${id}`, data);
  }

  async cancelBooking(id: string): Promise<void> {
    return apiClient.delete(`/bookings/${id}`);
  }

  async getAvailableVehicles(startDate: string, endDate: string): Promise<VehicleAvailability[]> {
    return apiClient.get<VehicleAvailability[]>('/bookings/available-vehicles', {
      params: { startDate, endDate },
    });
  }

  async approveBooking(id: string): Promise<Booking> {
    return apiClient.post<Booking>(`/bookings/${id}/approve`);
  }

  async rejectBooking(id: string, reason?: string): Promise<Booking> {
    return apiClient.post<Booking>(`/bookings/${id}/reject`, { reason });
  }
}

export const bookingService = new BookingService();
export default bookingService;
