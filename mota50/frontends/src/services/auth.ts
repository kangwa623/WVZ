import apiClient from './api';
import * as SecureStore from 'expo-secure-store';
import { AuthResponse, LoginCredentials, User } from '@/types';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Store tokens and user data
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
    if (response.refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);
    }
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        return null;
      }

      const response = await apiClient.post<{ token: string }>('/auth/refresh', {
        refreshToken,
      });

      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
      return response.token;
    } catch (error) {
      await this.logout();
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
