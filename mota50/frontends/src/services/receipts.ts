import apiClient from './api';

interface Receipt {
  id: string;
  type: string;
  amount: number;
  imageUrl: string;
  description?: string;
  tripId?: string;
  createdAt: string;
}

class ReceiptService {
  async getReceipts(): Promise<Receipt[]> {
    return apiClient.get<Receipt[]>('/receipts/');
  }

  async uploadReceipt(formData: FormData): Promise<Receipt> {
    return apiClient.upload<Receipt>('/receipts/', formData);
  }

  async getReceipt(id: string): Promise<Receipt> {
    return apiClient.get<Receipt>(`/receipts/${id}`);
  }

  async deleteReceipt(id: string): Promise<void> {
    return apiClient.delete(`/receipts/${id}`);
  }
}

export const receiptService = new ReceiptService();
export default receiptService;
