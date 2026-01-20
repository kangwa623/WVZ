import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
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
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    Alert.alert(
      'Select Receipt',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!imageUri || !amount) {
      Alert.alert('Error', 'Please select an image and enter amount');
      return;
    }

    setUploading(true);
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
      Alert.alert('Success', 'Receipt uploaded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload receipt');
    } finally {
      setUploading(false);
    }
  };

  const receiptTypes: { label: string; value: ReceiptType; icon: string }[] = [
    { label: 'Fuel', value: 'fuel', icon: 'local-gas-station' },
    { label: 'Maintenance', value: 'maintenance', icon: 'build' },
    { label: 'Toll', value: 'toll', icon: 'toll' },
    { label: 'Other', value: 'other', icon: 'receipt' },
  ];

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Upload Receipt</Text>

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

      <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
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
        loading={uploading}
        fullWidth
        icon="cloud-upload"
        disabled={!imageUri || !amount}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing[4],
    margin: spacing[4],
  },
  title: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[4],
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
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
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
});

export default ReceiptUpload;
