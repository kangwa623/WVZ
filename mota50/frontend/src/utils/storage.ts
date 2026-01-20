import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Platform-aware storage utility
// Uses SecureStore on native, localStorage on web
class Storage {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('localStorage.setItem error:', error);
        throw error;
      }
    } else {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.error('SecureStore.setItemAsync error:', error);
        throw error;
      }
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('localStorage.getItem error:', error);
        return null;
      }
    } else {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.error('SecureStore.getItemAsync error:', error);
        return null;
      }
    }
  }

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
        // Verify deletion on web
        if (localStorage.getItem(key) !== null) {
          console.warn(`Warning: Key ${key} still exists after deletion`);
        }
      } catch (error) {
        console.error('localStorage.removeItem error:', error);
        throw error;
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error('SecureStore.deleteItemAsync error:', error);
        // Don't throw for SecureStore - it might fail if key doesn't exist, which is fine
        if (error instanceof Error && !error.message.includes('could not be found')) {
          throw error;
        }
      }
    }
  }
}

export const storage = new Storage();
export default storage;
