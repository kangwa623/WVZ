import storage from '@/utils/storage';
import { LicenseData, ValidationResult } from './license';

const LICENSES_STORAGE_KEY = 'scanned_licenses';

export interface StoredLicense {
  id: string;
  driverId: string;
  driverName: string;
  driverEmail: string;
  licenseData: LicenseData;
  validation: ValidationResult;
  scannedAt: string;
  imageUri?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

class LicenseStorageService {
  private async getStoredLicenses(): Promise<StoredLicense[]> {
    try {
      const licensesJson = await storage.getItem(LICENSES_STORAGE_KEY);
      if (licensesJson) {
        return JSON.parse(licensesJson);
      }
      return [];
    } catch (error) {
      console.error('Error loading licenses from storage:', error);
      return [];
    }
  }

  private async saveLicensesToStorage(licenses: StoredLicense[]): Promise<void> {
    try {
      await storage.setItem(LICENSES_STORAGE_KEY, JSON.stringify(licenses));
    } catch (error) {
      console.error('Error saving licenses to storage:', error);
    }
  }

  async saveLicense(
    driverId: string,
    driverName: string,
    driverEmail: string,
    licenseData: LicenseData,
    validation: ValidationResult,
    imageUri?: string
  ): Promise<StoredLicense> {
    const licenses = await this.getStoredLicenses();
    
    // Check if license already exists for this driver
    const existingIndex = licenses.findIndex(
      (l) => l.driverId === driverId && l.status !== 'rejected'
    );
    
    const newLicense: StoredLicense = {
      id: `license_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      driverId,
      driverName,
      driverEmail,
      licenseData,
      validation,
      scannedAt: new Date().toISOString(),
      imageUri,
      status: validation.status === 'VERIFIED' ? 'approved' : validation.status === 'EXPIRED' ? 'expired' : 'pending',
    };

    if (existingIndex !== -1) {
      // Update existing license
      licenses[existingIndex] = newLicense;
    } else {
      // Add new license
      licenses.unshift(newLicense);
    }
    
    await this.saveLicensesToStorage(licenses);
    return newLicense;
  }

  async getAllLicenses(): Promise<StoredLicense[]> {
    const licenses = await this.getStoredLicenses();
    // Sort by scannedAt descending (newest first)
    return licenses.sort((a, b) => 
      new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    );
  }

  async getLicenseById(id: string): Promise<StoredLicense | null> {
    const licenses = await this.getStoredLicenses();
    return licenses.find(l => l.id === id) || null;
  }

  async getLicenseByDriverId(driverId: string): Promise<StoredLicense | null> {
    const licenses = await this.getStoredLicenses();
    return licenses.find(l => l.driverId === driverId && l.status !== 'rejected') || null;
  }

  async updateLicenseStatus(
    id: string,
    status: StoredLicense['status'],
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<void> {
    const licenses = await this.getStoredLicenses();
    const licenseIndex = licenses.findIndex(l => l.id === id);
    if (licenseIndex !== -1) {
      licenses[licenseIndex].status = status;
      licenses[licenseIndex].reviewedBy = reviewedBy;
      licenses[licenseIndex].reviewedAt = new Date().toISOString();
      if (reviewNotes) {
        licenses[licenseIndex].reviewNotes = reviewNotes;
      }
      await this.saveLicensesToStorage(licenses);
    }
  }

  async getPendingLicenses(): Promise<StoredLicense[]> {
    const licenses = await this.getStoredLicenses();
    return licenses.filter(l => l.status === 'pending').sort((a, b) => 
      new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    );
  }

  async getExpiringLicenses(daysThreshold: number = 30): Promise<StoredLicense[]> {
    const licenses = await this.getStoredLicenses();
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);
    
    return licenses.filter(license => {
      if (license.status === 'rejected' || license.status === 'expired') return false;
      const expiryDate = new Date(license.licenseData.expirationDate);
      return expiryDate <= thresholdDate && expiryDate >= today;
    }).sort((a, b) => {
      const dateA = new Date(a.licenseData.expirationDate);
      const dateB = new Date(b.licenseData.expirationDate);
      return dateA.getTime() - dateB.getTime();
    });
  }
}

export const licenseStorageService = new LicenseStorageService();
export default licenseStorageService;
