import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Icon from '@/components/common/Icon';
import licenseService, { LicenseData, ValidationResult } from '@/services/license';
import licenseStorageService from '@/services/licenseStorage';

// Data Row Component
const DataRow = ({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
}) => (
  <View style={styles.dataRow}>
    <View style={styles.dataRowLeft}>
      <Icon name={icon} size="medium" color="textSecondary" iconSet="MaterialIcons" />
      <Text style={styles.dataLabel}>{label}:</Text>
    </View>
    <Text
      style={[
        styles.dataValue,
        highlight && { color: colors.semantic.error, fontWeight: typography.fontWeight.bold },
      ]}
    >
      {value}
    </Text>
  </View>
);

export default function LicenseScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedImageBase64, setCapturedImageBase64] = useState<string | null>(null);
  const [capturedImageMimeType, setCapturedImageMimeType] = useState<string>('image/jpeg');
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('System initializing...');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error' | 'warn'>('info');

  const updateMessage = (text: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') => {
    setMessage(text);
    setMessageType(type);
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need photo library access to select an image');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true, // Get base64 directly to avoid URI conversion issues
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        // Store base64 if available (helps with content:// URIs on Android)
        if (result.assets[0].base64) {
          setCapturedImageBase64(result.assets[0].base64);
          setCapturedImageMimeType(result.assets[0].mimeType || 'image/jpeg');
        } else {
          setCapturedImageBase64(null);
        }
        setLicenseData(null);
        setValidation(null);
        updateMessage("Image loaded. Click 'Extract & Validate License' to process.", 'info');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCameraCapture = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true, // Get base64 directly to avoid URI conversion issues
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        // Store base64 if available (helps with content:// URIs on Android)
        if (result.assets[0].base64) {
          setCapturedImageBase64(result.assets[0].base64);
          setCapturedImageMimeType(result.assets[0].mimeType || 'image/jpeg');
        } else {
          setCapturedImageBase64(null);
        }
        setLicenseData(null);
        setValidation(null);
        updateMessage("Image loaded. Click 'Extract & Validate License' to process.", 'info');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const processLicense = async () => {
    if (!capturedImage) {
      updateMessage('Please select an image first.', 'warn');
      return;
    }

    setProcessing(true);
    updateMessage('Scanning license with AI...', 'info');

    try {
      let data: LicenseData;
      
      // Use base64 directly if available (avoids URI conversion issues on Android)
      if (capturedImageBase64) {
        data = await licenseService.scanLicenseFromBase64(capturedImageBase64, capturedImageMimeType);
      } else {
        // Fallback to URI-based approach
        data = await licenseService.scanLicense(capturedImage!);
      }
      
      const validationResult = licenseService.validateLicense(data);
      
      setLicenseData(data);
      setValidation(validationResult);
      
      // Save license to storage for admin review
      if (user) {
        try {
          setSaving(true);
          await licenseStorageService.saveLicense(
            user.id,
            `${user.firstName} ${user.lastName}`,
            user.email,
            data,
            validationResult,
            capturedImage || undefined
          );
          updateMessage(`License scanned and submitted for admin review. ${validationResult.message}`, 
            validationResult.status === 'VERIFIED' ? 'success' : 'warn');
        } catch (error: any) {
          console.error('Error saving license:', error);
          updateMessage(`Validation Result: ${validationResult.message}`, 
            validationResult.status === 'VERIFIED' ? 'success' : 'warn');
        } finally {
          setSaving(false);
        }
      } else {
        if (validationResult.status === 'VERIFIED') {
          updateMessage(`Validation Result: ${validationResult.message}`, 'success');
        } else {
          updateMessage(`Validation Result: ${validationResult.message}`, 'warn');
        }
      }
    } catch (error: any) {
      updateMessage(`Error during processing: ${error.message}`, 'error');
      Alert.alert('Processing Error', error.message || 'Failed to process license');
    } finally {
      setProcessing(false);
    }
  };

  const resetScan = () => {
    setCapturedImage(null);
    setCapturedImageBase64(null);
    setCapturedImageMimeType('image/jpeg');
    setLicenseData(null);
    setValidation(null);
    setProcessing(false);
    updateMessage('Please upload an image.', 'info');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return colors.semantic.success;
      case 'EXPIRED':
      case 'DENIED':
        return colors.semantic.error;
      case 'NEEDS_REVIEW':
        return colors.semantic.warning;
      default:
        return colors.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'ACCESS GRANTED';
      case 'EXPIRED':
        return 'ACCESS DENIED: EXPIRED';
      case 'NEEDS_REVIEW':
        return 'MANUAL REVIEW REQUIRED';
      case 'DENIED':
        return 'ACCESS DENIED';
      default:
        return 'ERROR';
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === 'UNKNOWN') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getMessageBoxStyle = () => {
    switch (messageType) {
      case 'success':
        return { backgroundColor: colors.semantic.success + '20', borderColor: colors.semantic.success + '80', color: '#1B5E20' };
      case 'error':
        return { backgroundColor: colors.semantic.error + '20', borderColor: colors.semantic.error + '80', color: '#B71C1C' };
      case 'warn':
        return { backgroundColor: colors.semantic.warning + '20', borderColor: colors.semantic.warning + '80', color: '#E65100' };
      default:
        return { backgroundColor: colors.semantic.info + '20', borderColor: colors.semantic.info + '80', color: '#0D47A1' };
    }
  };

  if (!permission) {
    return <View />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Electronic License Verification System</Text>
        <Text style={styles.headerSubtitle}>
          OCR scan, automatic validation, and audit trail for vehicle access.
        </Text>
      </View>

      {/* Section 1: Upload License Image */}
      <Card style={styles.sectionCard} variant="elevated">
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.semantic.info }]}>
            1. Upload License Image
          </Text>
        </View>

        <View style={styles.uploadOptions}>
          <Button
            title="Choose from Gallery"
            onPress={handleImagePicker}
            variant="outline"
            icon="photo-library"
            iconSet="MaterialIcons"
            style={styles.uploadButton}
          />
          <Button
            title="Take Photo"
            onPress={handleCameraCapture}
            variant="outline"
            icon="camera-alt"
            iconSet="MaterialIcons"
            style={styles.uploadButton}
          />
        </View>

        {/* Image Preview */}
        <View style={styles.imagePreviewContainer}>
          {capturedImage ? (
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Icon name="image" size="xlarge" color="textTertiary" />
              <Text style={styles.placeholderText}>Image Preview</Text>
            </View>
          )}
        </View>

        {/* Process Button */}
        <Button
          title={processing ? 'Processing...' : 'Extract & Validate License'}
          onPress={processLicense}
          disabled={!capturedImage || processing}
          loading={processing}
          fullWidth
          style={styles.processButton}
        />
      </Card>

      {/* Section 2: Validation Status & Data */}
      <Card style={styles.sectionCard} variant="elevated">
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.semantic.success }]}>
            2. Validation Status & Data
          </Text>
        </View>

        {/* Message Box */}
        <Card
          style={[styles.messageBox, { ...getMessageBoxStyle() }]}
          variant="outlined"
        >
          <Text style={[styles.messageText, { color: getMessageBoxStyle().color }]}>
            {message}
          </Text>
        </Card>

        {/* Validation Status */}
        {validation ? (
          <Card
            style={[
              styles.statusCard,
              {
                backgroundColor: getStatusColor(validation.status) + '20',
                borderColor: getStatusColor(validation.status),
              },
            ]}
            variant="outlined"
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(validation.status) },
              ]}
            >
              {getStatusText(validation.status)}
            </Text>
          </Card>
        ) : (
          <Card style={styles.statusCard} variant="outlined">
            <Text style={styles.awaitingText}>Awaiting Scan</Text>
          </Card>
        )}

        {/* Extracted Data */}
        {licenseData && (
          <View style={styles.dataContainer}>
            <DataRow
              label="Full Name"
              value={licenseData.fullName || 'N/A'}
              icon="person"
            />
            <DataRow
              label="License Number"
              value={licenseData.licenseNumber || 'N/A'}
              icon="badge"
            />
            <DataRow
              label="Expiration Date"
              value={formatDate(licenseData.expirationDate)}
              icon="calendar-today"
              highlight={!validation?.status || validation.status === 'EXPIRED'}
            />
            {licenseData.licenseClass && (
              <DataRow
                label="Class"
                value={licenseData.licenseClass}
                icon="directions-car"
              />
            )}
            {licenseData.issuingAuthority && (
              <DataRow
                label="Issuing Authority"
                value={licenseData.issuingAuthority}
                icon="account-balance"
              />
            )}
          </View>
        )}

        {capturedImage && !licenseData && !processing && (
          <Button
            title="Scan Again"
            onPress={resetScan}
            variant="outline"
            fullWidth
            style={styles.resetButton}
          />
        )}
      </Card>

      {/* Section 3: Admin Review Queue (Placeholder for MVP) */}
      <Card style={styles.sectionCard} variant="elevated">
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.primary.main }]}>
            3. Admin Review Queue (Audit)
          </Text>
        </View>
        <Text style={styles.reviewInfo}>
          Click to manually override status for required reviews.
        </Text>
        <Card style={styles.queuePlaceholder} variant="outlined">
          <Text style={styles.queuePlaceholderText}>
            Review Queue: Configure backend to enable persistence.
          </Text>
        </Card>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    padding: spacing[6],
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.styles.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  headerSubtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  sectionCard: {
    margin: spacing[4],
    marginBottom: spacing[4],
  },
  sectionHeader: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...typography.styles.h3,
    fontWeight: typography.fontWeight.bold,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  uploadButton: {
    flex: 1,
  },
  imagePreviewContainer: {
    height: 200,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: spacing[4],
    backgroundColor: colors.gray[50],
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.styles.body,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
  processButton: {
    marginTop: spacing[2],
  },
  messageBox: {
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
  },
  messageText: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.medium,
  },
  statusCard: {
    padding: spacing[4],
    marginBottom: spacing[4],
    alignItems: 'center',
    borderWidth: 2,
  },
  statusText: {
    ...typography.styles.h2,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  awaitingText: {
    ...typography.styles.h3,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.bold,
  },
  dataContainer: {
    gap: spacing[3],
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  dataRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing[2],
  },
  dataValue: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  resetButton: {
    marginTop: spacing[4],
  },
  reviewInfo: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[4],
  },
  queuePlaceholder: {
    padding: spacing[4],
    alignItems: 'center',
  },
  queuePlaceholderText: {
    ...typography.styles.body,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
});
