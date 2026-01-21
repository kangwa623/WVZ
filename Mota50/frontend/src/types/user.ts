export type UserRole = 'driver' | 'staff' | 'fleet_manager' | 'finance' | 'finance_officer' | 'admin';

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
  requiresMfa?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}
