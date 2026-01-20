import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Icon from '@/components/common/Icon';

export type ReceiptType = 'fuel' | 'maintenance' | 'toll' | 'other';

interface ReceiptUploadProps {
  onUpload: (receipt: {
    type: ReceiptType;
    amount: number;
    imageUri: string;
    description?: string;
    tripId?: string;
  }) => void;
  tripId?: string;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({ onUpload, tripId }) => {
  const [type, setType] = useState<ReceiptType>('fuel');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const handleOpenCamera = async () => {
    if (!permission) {
      return;
    }

    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to take receipt photos');
        return;
      }
    }

    setShowCamera(true);
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        setImageUri(photo.uri);
        setShowCamera(false);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleRetakePhoto = () => {
    setImageUri(null);
    setShowCamera(true);
  };

  const handleUpload = async () => {
    if (!imageUri || !amount) {
      Alert.alert('Error', 'Please take a photo and enter amount');
      return;
    }

    // Don't use loading state - upload immediately
    try {
      await onUpload({
        type,
        amount: parseFloat(amount),
        imageUri,
        description,
        tripId,
      });
      // Reset form
      setAmount('');
      setDescription('');
      setImageUri(null);
      setShowCamera(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload receipt');
    }
  };

  const receiptTypes: { label: string; value: ReceiptType; icon: string }[] = [
    { label: 'Fuel', value: 'fuel', icon: 'local-gas-station' },
    { label: 'Maintenance', value: 'maintenance', icon: 'build' },
    { label: 'Toll', value: 'toll', icon: 'toll' },
    { label: 'Other', value: 'other', icon: 'receipt' },
  ];

  // Show camera view if camera is open
  if (showCamera && permission?.granted) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCamera(false)}
            >
              <Icon name="close" size="large" color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePhoto}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // Show permission request if needed
  if (permission && !permission.granted) {
    return (
      <Card style={styles.container}>
        <View style={styles.permissionContainer}>
          <Icon name="camera-alt" size="xlarge" color="primary" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to take photos of receipts for accountability and transparency.
          </Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            style={styles.permissionButton}
          />
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.scrollContainer}>
      <Card style={styles.container}>
        <View style={styles.typeContainer}>
          {receiptTypes.map((receiptType) => (
            <TouchableOpacity
              key={receiptType.value}
              style={[
                styles.typeButton,
                type === receiptType.value && styles.typeButtonActive,
              ]}
              onPress={() => setType(receiptType.value)}
            >
              <Icon
                name={receiptType.icon}
                size="medium"
                color={type === receiptType.value ? 'white' : 'primary'}
              />
              <Text
                style={[
                  styles.typeText,
                  type === receiptType.value && styles.typeTextActive,
                ]}
              >
                {receiptType.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Amount *"
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          icon="attach-money"
        />

        <Input
          label="Description"
          placeholder="Optional description"
          value={description}
          onChangeText={setDescription}
          icon="description"
          multiline
        />

        <TouchableOpacity style={styles.imageButton} onPress={handleOpenCamera}>
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleRetakePhoto}
              >
                <Icon name="refresh" size="medium" color="primary" />
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="camera-alt" size="xlarge" color="textTertiary" />
              <Text style={styles.imagePlaceholderText}>Tap to select receipt</Text>
            </View>
          )}
        </TouchableOpacity>

        <Button
          title="Upload Receipt"
          onPress={handleUpload}
          fullWidth
          icon="cloud-upload"
          disabled={!imageUri || !amount}
          style={styles.uploadButton}
        />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  container: {
    padding: spacing[4],
    margin: spacing[4],
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginHorizontal: spacing[1],
  },
  typeButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  typeText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  typeTextActive: {
    color: colors.base.white,
  },
  imageButton: {
    marginBottom: spacing[4],
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: colors.background.secondary,
  },
  retakeButton: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.base.white,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-specific style
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: colors.base.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  retakeText: {
    ...typography.styles.caption,
    color: colors.text.primary,
    marginLeft: spacing[1],
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: colors.base.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    ...typography.styles.body,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
  uploadButton: {
    backgroundColor: '#FF6B35', // Orange color from image
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.base.black,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[4],
  },
  cancelButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.base.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primary.main,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.main,
  },
  permissionContainer: {
    alignItems: 'center',
    padding: spacing[6],
  },
  permissionTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  permissionText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  permissionButton: {
    marginTop: spacing[4],
  },
});

export default ReceiptUpload;
