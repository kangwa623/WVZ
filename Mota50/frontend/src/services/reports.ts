import storage from '@/utils/storage';

const REPORTS_STORAGE_KEY = 'finance_reports';

export interface FinanceReport {
  id: string;
  type: 'audit' | 'epr';
  title: string;
  content: string;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'archived';
  financialData?: any;
  eprDetails?: {
    name: string;
    rank: string;
    period: string;
  };
}

class ReportsService {
  private async getStoredReports(): Promise<FinanceReport[]> {
    try {
      const reportsJson = await storage.getItem(REPORTS_STORAGE_KEY);
      if (reportsJson) {
        return JSON.parse(reportsJson);
      }
      return [];
    } catch (error) {
      console.error('Error loading reports from storage:', error);
      return [];
    }
  }

  private async saveReportsToStorage(reports: FinanceReport[]): Promise<void> {
    try {
      await storage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving reports to storage:', error);
    }
  }

  async submitReport(report: Omit<FinanceReport, 'id' | 'submittedAt' | 'status'>): Promise<FinanceReport> {
    const reports = await this.getStoredReports();
    const newReport: FinanceReport = {
      ...report,
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    
    reports.unshift(newReport); // Add to beginning for newest first
    await this.saveReportsToStorage(reports);
    
    return newReport;
  }

  async getReports(): Promise<FinanceReport[]> {
    const reports = await this.getStoredReports();
    // Sort by submittedAt descending (newest first)
    return reports.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  async getReportById(id: string): Promise<FinanceReport | null> {
    const reports = await this.getStoredReports();
    return reports.find(r => r.id === id) || null;
  }

  async updateReportStatus(id: string, status: FinanceReport['status']): Promise<void> {
    const reports = await this.getStoredReports();
    const reportIndex = reports.findIndex(r => r.id === id);
    if (reportIndex !== -1) {
      reports[reportIndex].status = status;
      await this.saveReportsToStorage(reports);
    }
  }

  async deleteReport(id: string): Promise<void> {
    const reports = await this.getStoredReports();
    const filteredReports = reports.filter(r => r.id !== id);
    await this.saveReportsToStorage(filteredReports);
  }
}

export const reportsService = new ReportsService();
export default reportsService;
