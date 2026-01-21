import apiClient from './api';
import storage from '@/utils/storage';
import { AuthResponse, LoginCredentials, User } from '@/types';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';
const TEMP_USER_KEY = 'temp_user';

// Mock users for MVP
const MOCK_USERS: Record<string, User> = {
  'admin@wvz.org': {
    id: '1',
    email: 'admin@wvz.org',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'driver@wvz.org': {
    id: '2',
    email: 'driver@wvz.org',
    firstName: 'Driver',
    lastName: 'User',
    role: 'driver',
    licenseNumber: 'DL123456',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'staff@wvz.org': {
    id: '3',
    email: 'staff@wvz.org',
    firstName: 'Staff',
    lastName: 'User',
    role: 'staff',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'manager@wvz.org': {
    id: '4',
    email: 'manager@wvz.org',
    firstName: 'Fleet',
    lastName: 'Manager',
    role: 'fleet_manager',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'finance@wvz.org': {
    id: '5',
    email: 'finance@wvz.org',
    firstName: 'Finance',
    lastName: 'Officer',
    role: 'finance',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

const MOCK_PASSWORD = 'password123';
const MOCK_MFA_CODE = '123456';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Mock authentication for MVP
    const user = MOCK_USERS[credentials.email.toLowerCase()];
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (credentials.password !== MOCK_PASSWORD) {
      throw new Error('Invalid email or password');
    }

    // If MFA code is provided, verify it
    if (credentials.mfaCode) {
      if (credentials.mfaCode !== MOCK_MFA_CODE) {
        throw new Error('Invalid MFA code');
      }
    } else {
      // Return response indicating MFA is required
      // Store user temporarily for MFA screen
      await storage.setItem(TEMP_USER_KEY, JSON.stringify(user));
      return {
        user,
        token: 'mock_token_' + user.id,
        refreshToken: 'mock_refresh_token_' + user.id,
        requiresMfa: true,
      };
    }

    // MFA verified, complete login
    const response: AuthResponse = {
      user,
      token: 'mock_token_' + user.id,
      refreshToken: 'mock_refresh_token_' + user.id,
      requiresMfa: false,
    };
    
    // Store tokens and user data
    await storage.setItem(AUTH_TOKEN_KEY, response.token);
    if (response.refreshToken) {
      await storage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }
    await storage.setItem(USER_KEY, JSON.stringify(response.user));
    
    // Clear temp user
    await storage.deleteItem(TEMP_USER_KEY);
    
    return response;
  }

  async getTempUser(): Promise<User | null> {
    try {
      const userJson = await storage.getItem(TEMP_USER_KEY);
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      // In mock mode, just clear local storage
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      await storage.deleteItem(AUTH_TOKEN_KEY);
      await storage.deleteItem(REFRESH_TOKEN_KEY);
      await storage.deleteItem(USER_KEY);
      await storage.deleteItem(TEMP_USER_KEY);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await storage.getItem(USER_KEY);
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async getToken(): Promise<string | null> {
    return await storage.getItem(AUTH_TOKEN_KEY);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        return null;
      }
      // In mock mode, just return the existing token
      return await this.getToken();
    } catch (error) {
      await this.logout();
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
