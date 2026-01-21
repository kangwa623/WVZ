import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || 'AIzaSyC56IIN6UASIYqD_YQF3wk7_ePHlA7fM1w';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

export interface LicenseData {
  fullName: string;
  licenseNumber: string;
  dateOfBirth?: string;
  expirationDate: string;
  licenseClass?: string;
  issuingAuthority?: string;
  isDetected: boolean;
}

export interface ValidationResult {
  status: 'VERIFIED' | 'EXPIRED' | 'NEEDS_REVIEW' | 'DENIED';
  message: string;
}

class LicenseService {
  /**
   * Convert image URI to base64
   * Handles web blob URLs, data URLs, content:// URIs (Android), and native file paths
   */
  private async imageToBase64(imageUri: string): Promise<{ base64Data: string; mimeType: string }> {
    try {
      // Handle data URLs (already base64)
      if (imageUri.startsWith('data:image')) {
        const base64Match = imageUri.match(/data:image\/(\w+);base64,(.+)/);
        if (base64Match) {
          return {
            base64Data: base64Match[2],
            mimeType: `image/${base64Match[1]}`,
          };
        }
      }

      // Handle native file paths using FileSystem (file:// URIs)
      if (FileSystem.EncodingType && (imageUri.startsWith('file://') || (!imageUri.includes('://') && Platform.OS !== 'web'))) {
        try {
          // Normalize URI for FileSystem
          const normalizedUri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
          
          // Check if file exists
          const fileInfo = await FileSystem.getInfoAsync(normalizedUri);
          if (fileInfo.exists) {
            const base64String = await FileSystem.readAsStringAsync(normalizedUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            
            // Try to determine MIME type from file extension
            let mimeType = 'image/jpeg';
            if (imageUri.toLowerCase().endsWith('.png')) {
              mimeType = 'image/png';
            } else if (imageUri.toLowerCase().endsWith('.jpg') || imageUri.toLowerCase().endsWith('.jpeg')) {
              mimeType = 'image/jpeg';
            } else if (imageUri.toLowerCase().endsWith('.webp')) {
              mimeType = 'image/webp';
            }
            
            return {
              base64Data: base64String,
              mimeType,
            };
          }
        } catch (fileSystemError: any) {
          console.error('FileSystem error:', fileSystemError);
          // Fall through to fetch approach for content:// URIs
        }
      }

      // Handle web blob URLs, http/https URLs, and Android content:// URIs using fetch
      // This works for web and can also work for Android content URIs
      try {
        // For content:// URIs on Android, try using the URI directly with fetch
        const response = await fetch(imageUri);
        
        // Check if response is OK
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        // Convert blob to base64 using FileReader (for web) or manual conversion (for native)
        let base64String: string;
        let mimeType: string = blob.type || 'image/jpeg';

        if (Platform.OS === 'web') {
          // Use FileReader for web
          base64String = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              // Remove data:image/xxx;base64, prefix
              const base64Data = result.split(',')[1];
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } else {
          // For native platforms (Android/iOS), convert blob to base64 using array buffer
          const arrayBuffer = await blob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Convert Uint8Array to base64 string
          let binary = '';
          for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          base64String = btoa(binary);
        }
        
        return {
          base64Data: base64String,
          mimeType,
        };
      } catch (fetchError: any) {
        console.error('Fetch error:', fetchError);
        throw new Error(`Failed to convert image: ${fetchError.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Image to base64 conversion error:', error);
      console.error('Image URI:', imageUri);
      console.error('Platform:', Platform.OS);
      throw new Error(`Failed to convert image to base64: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Fetch with exponential backoff retry
   */
  private async fetchWithBackoff(
    url: string,
    options: any,
    maxRetries: number = 5
  ): Promise<Response> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`Attempt ${i + 1} failed with status: ${response.status}`, errorBody);
          if (response.status === 429 || response.status >= 500) {
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          } else {
            throw new Error(
              `API failed with status ${response.status}: ${errorBody.substring(0, 200)}...`
            );
          }
        }
        return response;
      } catch (error: any) {
        console.error('Fetch error:', error);
        if (i === maxRetries - 1) throw error;
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Scan license using Gemini API
   */
  async scanLicense(imageUri: string): Promise<LicenseData> {
    try {
      const { base64Data, mimeType } = await this.imageToBase64(imageUri);

      const prompt =
        "Extract license data. Dates should be strictly formatted as YYYY-MM-DD. If a field is unreadable, use 'UNKNOWN'. If no driver's license object is clearly visible, set isDetected to false.";

      const responseSchema = {
        type: 'OBJECT',
        properties: {
          fullName: { type: 'STRING' },
          licenseNumber: { type: 'STRING' },
          dateOfBirth: { type: 'STRING' },
          expirationDate: { type: 'STRING' },
          licenseClass: { type: 'STRING' },
          issuingAuthority: { type: 'STRING' },
          isDetected: { type: 'BOOLEAN' },
        },
        required: ['fullName', 'licenseNumber', 'expirationDate', 'isDetected'],
      };

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64Data } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      };

      const response = await this.fetchWithBackoff(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        let jsonStr = result.candidates[0].content.parts[0].text;
        // Clean up potential markdown formatting
        jsonStr = jsonStr.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonStr) as LicenseData;
        return data;
      } else {
        throw new Error('AI scan failed. No data returned.');
      }
    } catch (error: any) {
      console.error('License scanning error:', error);
      throw new Error(error.message || 'Failed to scan license');
    }
  }

  /**
   * Scan license using Gemini API with base64 string directly
   */
  async scanLicenseFromBase64(base64Data: string, mimeType: string = 'image/jpeg'): Promise<LicenseData> {
    try {
      const prompt =
        "Extract license data. Dates should be strictly formatted as YYYY-MM-DD. If a field is unreadable, use 'UNKNOWN'. If no driver's license object is clearly visible, set isDetected to false.";

      const responseSchema = {
        type: 'OBJECT',
        properties: {
          fullName: { type: 'STRING' },
          licenseNumber: { type: 'STRING' },
          dateOfBirth: { type: 'STRING' },
          expirationDate: { type: 'STRING' },
          licenseClass: { type: 'STRING' },
          issuingAuthority: { type: 'STRING' },
          isDetected: { type: 'BOOLEAN' },
        },
        required: ['fullName', 'licenseNumber', 'expirationDate', 'isDetected'],
      };

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64Data } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      };

      const response = await this.fetchWithBackoff(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        let jsonStr = result.candidates[0].content.parts[0].text;
        // Clean up potential markdown formatting
        jsonStr = jsonStr.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonStr) as LicenseData;
        return data;
      } else {
        throw new Error('AI scan failed. No data returned.');
      }
    } catch (error: any) {
      console.error('License scanning error:', error);
      throw new Error(error.message || 'Failed to scan license');
    }
  }

  /**
   * Validate license expiry date
   */
  validateLicense(data: LicenseData): ValidationResult {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = data.expirationDate ? new Date(data.expirationDate) : null;

    // Check if license was detected
    if (data.isDetected === false) {
      return {
        status: 'DENIED',
        message: 'License object not clearly detected in image. ACCESS DENIED (Review Needed).',
      };
    }

    // Check expiry date
    if (expiryDate && data.expirationDate !== 'UNKNOWN') {
      expiryDate.setHours(0, 0, 0, 0);
      if (expiryDate < today) {
        return {
          status: 'EXPIRED',
          message: 'License is expired. ACCESS DENIED.',
        };
      } else {
        return {
          status: 'VERIFIED',
          message: 'License is valid. ACCESS GRANTED.',
        };
      }
    } else {
      // Expiration date missing or unreadable
      return {
        status: 'NEEDS_REVIEW',
        message: 'Expiration date missing or unreadable. Manual review required.',
      };
    }
  }
}

export const licenseService = new LicenseService();
export default licenseService;
