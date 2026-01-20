export type UserRole = 'driver' | 'non_driver' | 'fleet_manager' | 'finance_officer' | 'compliance_officer';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  profileImage?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  violationPoints?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}
