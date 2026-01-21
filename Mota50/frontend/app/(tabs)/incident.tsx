import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  Platform,
  Linking,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Icon from '@/components/common/Icon';
import Input from '@/components/common/Input';
import incidentService from '@/services/incidents';

type IncidentType = 'accident' | 'breakdown' | 'violation' | 'other';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function IncidentScreen() {
  const router = useRouter();
  const [incidentType, setIncidentType] = useState<IncidentType | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    // Get current location on mount
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for incident reporting');
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Reverse geocode to get address
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        const address = addresses[0];
        const addressString = `${address.street || ''} ${address.name || ''}, ${address.city || ''} ${address.region || ''}`.trim();

        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: addressString || undefined,
        });
      } catch (geocodeError) {
        // If reverse geocoding fails, just use coordinates
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleCallSOS = () => {
    const phoneNumber = '911'; // Emergency services number
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleCallFleetManager = () => {
    // For MVP, just show alert. In production, this would call the fleet manager
    Alert.alert('Fleet Manager', 'Calling fleet manager...');
    // Linking.openURL(`tel:+260XXXXXXXXX`); // Replace with actual fleet manager number
  };

  const handlePhotoCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!incidentType) {
      Alert.alert('Error', 'Please select an incident type');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location is required. Please ensure location permissions are granted.');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Error', 'Please take at least one photo as evidence');
      return;
    }

    setSubmitting(true);

    try {
      // In a real app, you would upload photos first and get URLs
      // For MVP, we'll just use the local URIs
      const incidentData = {
        type: incidentType,
        description: description.trim(),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
        },
        photos: photos, // In production, these would be uploaded to storage first
      };

      await incidentService.reportIncident(incidentData);

      Alert.alert(
        'Success',
        'Incident report submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit incident report');
    } finally {
      setSubmitting(false);
    }
  };

  const incidentTypes: { type: IncidentType; label: string; icon: string }[] = [
    { type: 'accident', label: 'Accident', icon: 'directions-car' },
    { type: 'breakdown', label: 'Breakdown', icon: 'build' },
    { type: 'violation', label: 'Traffic Fine', icon: 'receipt' },
    { type: 'other', label: 'Theft/Other', icon: 'security' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size="medium" color="textPrimary" iconSet="MaterialIcons" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report an Incident</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Safety Warning Section */}
      <Card style={styles.warningCard} variant="outlined">
        <View style={[styles.warningBox, { backgroundColor: colors.semantic.error + '20', borderColor: colors.semantic.error }]}>
          <Icon name="warning" size="large" color="error" iconSet="MaterialIcons" />
          <Text style={[styles.warningText, { color: colors.semantic.error }]}>
            Prioritize safety. If there are injuries, call emergency services first.
          </Text>
        </View>
        <View style={styles.emergencyButtons}>
          <Button
            title="Call SOS"
            onPress={handleCallSOS}
            variant="primary"
            icon="phone"
            iconSet="MaterialIcons"
            style={[styles.emergencyButton, { backgroundColor: colors.semantic.error }]}
            textStyle={styles.emergencyButtonText}
          />
          <Button
            title="Fleet Mgr"
            onPress={handleCallFleetManager}
            variant="primary"
            icon="phone"
            iconSet="MaterialIcons"
            style={[styles.emergencyButton, { backgroundColor: colors.semantic.error }]}
            textStyle={styles.emergencyButtonText}
          />
        </View>
      </Card>

      {/* Incident Type Section */}
      <Card style={styles.sectionCard} variant="elevated">
        <Text style={styles.sectionLabel}>INCIDENT TYPE *</Text>
        <View style={styles.typeGrid}>
          {incidentTypes.map((item) => (
            <TouchableOpacity
              key={item.type}
              style={[
                styles.typeCard,
                incidentType === item.type && styles.typeCardSelected,
              ]}
              onPress={() => setIncidentType(item.type)}
            >
              <Icon
                name={item.icon}
                size="large"
                color={incidentType === item.type ? 'primary' : 'textSecondary'}
                iconSet="MaterialIcons"
              />
              <Text
                style={[
                  styles.typeLabel,
                  incidentType === item.type && styles.typeLabelSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Description Section */}
      <Card style={styles.sectionCard} variant="elevated">
        <Text style={styles.sectionLabel}>DESCRIPTION</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Describe what happened..."
            placeholderTextColor={colors.text.tertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>
      </Card>

      {/* Location Section */}
      <Card style={styles.sectionCard} variant="elevated">
        <Text style={styles.sectionLabel}>LOCATION</Text>
        <View style={styles.locationContainer}>
          <Icon name="location-on" size="medium" color="error" iconSet="MaterialIcons" />
          <View style={styles.locationTextContainer}>
            {loadingLocation ? (
              <Text style={styles.locationText}>Loading location...</Text>
            ) : location ? (
              <Text style={styles.locationText}>
                {location.address || 'Current Location'} (GPS: {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)})
              </Text>
            ) : (
              <Text style={styles.locationText}>Location not available</Text>
            )}
          </View>
          <TouchableOpacity onPress={getCurrentLocation} style={styles.refreshButton}>
            <Icon name="refresh" size="medium" color="primary" iconSet="MaterialIcons" />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Evidence/Photos Section */}
      <Card style={styles.sectionCard} variant="elevated">
        <Text style={styles.sectionLabel}>EVIDENCE/PHOTOS *</Text>
        <TouchableOpacity
          style={styles.photoArea}
          onPress={handlePhotoCapture}
          activeOpacity={0.7}
        >
          {photos.length === 0 ? (
            <>
              <Icon name="camera-alt" size="xlarge" color="textTertiary" iconSet="MaterialIcons" />
              <Text style={styles.photoPlaceholderText}>Tap to take photos of damage/scene</Text>
              <Button
                title="Open Camera"
                onPress={handlePhotoCapture}
                variant="outline"
                icon="camera-alt"
                iconSet="MaterialIcons"
                style={styles.cameraButton}
              />
            </>
          ) : (
            <View style={styles.photosGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri: photo }} style={styles.photoPreview} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Icon name="close" size="small" color="white" iconSet="MaterialIcons" />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < 5 && (
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={handlePhotoCapture}
                >
                  <Icon name="add" size="large" color="primary" iconSet="MaterialIcons" />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Card>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Button
          title="Submit Report"
          onPress={handleSubmit}
          variant="primary"
          loading={submitting}
          disabled={submitting}
          fullWidth
          style={[styles.submitButton, { backgroundColor: colors.semantic.error }]}
          textStyle={styles.submitButtonText}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  backText: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  headerTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  placeholder: {
    width: 80, // Balance the back button
  },
  warningCard: {
    margin: spacing[4],
    marginBottom: spacing[4],
    padding: spacing[4],
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing[4],
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  warningText: {
    ...typography.styles.body,
    flex: 1,
    fontWeight: typography.fontWeight.medium,
  },
  emergencyButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  emergencyButton: {
    flex: 1,
  },
  emergencyButtonText: {
    color: colors.base.white,
  },
  sectionCard: {
    margin: spacing[4],
    marginBottom: spacing[4],
    padding: spacing[4],
  },
  sectionLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  typeCard: {
    width: '47%',
    aspectRatio: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
    padding: spacing[4],
    gap: spacing[2],
  },
  typeCardSelected: {
    backgroundColor: colors.gray[100],
    borderColor: colors.primary.main,
  },
  typeLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
  typeLabelSelected: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    minHeight: 120,
  },
  textArea: {
    ...typography.styles.body,
    color: colors.text.primary,
    padding: spacing[3],
    flex: 1,
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'top',
    }),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing[3],
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  refreshButton: {
    padding: spacing[2],
  },
  photoArea: {
    minHeight: 200,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: colors.gray[50],
    padding: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    ...typography.styles.body,
    color: colors.text.tertiary,
    marginTop: spacing[2],
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  cameraButton: {
    marginTop: spacing[2],
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    width: '100%',
  },
  photoItem: {
    width: '47%',
    aspectRatio: 1,
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.semantic.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: '47%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  addPhotoText: {
    ...typography.styles.bodySmall,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
  submitContainer: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  submitButton: {
    minHeight: 52,
  },
  submitButtonText: {
    color: colors.base.white,
    fontWeight: typography.fontWeight.bold,
  },
});
