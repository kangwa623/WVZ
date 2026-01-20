import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Icon from '@/components/common/Icon';

export default function PreTripInspectionScreen() {
  const router = useRouter();
  const [checklistItems, setChecklistItems] = useState({
    tires: false,
    lights: false,
    brakes: false,
  });
  const [photos, setPhotos] = useState<string[]>([]);

  // Mock vehicle data
  const vehicle = {
    make: 'Toyota',
    model: 'Hilux',
    registrationNumber: 'AAB 1234',
  };

  const handleCheckboxToggle = (item: keyof typeof checklistItems) => {
    setChecklistItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleSelectPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Photo library permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const handleConfirm = () => {
    // Navigate to trip start or next step
    router.push('/(tabs)/trips');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>M50</Text>
          </View>
          <Text style={styles.brandText}>MOTA50</Text>
        </View>
        <View style={styles.profileContainer}>
          <Icon name="cloud-done" size="small" color={colors.semantic.success} iconSet="MaterialIcons" />
          <View style={[styles.profileImageContainer, { marginHorizontal: spacing[2] }]}>
            <Icon name="person" size="medium" color={colors.primary.main} iconSet="MaterialIcons" />
          </View>
          <Icon name="keyboard-arrow-down" size="small" color={colors.primary.main} iconSet="MaterialIcons" />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Back Navigation */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size="medium" color={colors.primary.main} iconSet="MaterialIcons" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Pre-Trip Inspection</Text>

          {/* Vehicle Information */}
          <Text style={styles.vehicleText}>
            Vehicle: {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
          </Text>

          {/* License Check Section */}
          <Card style={styles.licenseCard}>
            <View style={styles.licenseContent}>
              <Icon name="card-membership" size="large" color={colors.primary.main} iconSet="MaterialIcons" />
              <View style={styles.licenseTextContainer}>
                <Text style={styles.licenseTitle}>License Check</Text>
                <Text style={styles.licenseStatus}>Valid until Dec 2026. Verified.</Text>
              </View>
            </View>
          </Card>

          {/* Safety Checklist Section */}
          <Text style={styles.sectionTitle}>SAFETY CHECKLIST</Text>
          
          <Card style={styles.checklistCard}>
            <TouchableOpacity
              style={styles.checklistItem}
              onPress={() => handleCheckboxToggle('tires')}
            >
              <Icon
                name={checklistItems.tires ? 'check-box' : 'check-box-outline-blank'}
                size="medium"
                color={checklistItems.tires ? colors.primary.main : colors.text.secondary}
                iconSet="MaterialIcons"
              />
              <Text style={styles.checklistText}>Tires (Pressure & Tread)</Text>
            </TouchableOpacity>
          </Card>

          <Card style={styles.checklistCard}>
            <TouchableOpacity
              style={styles.checklistItem}
              onPress={() => handleCheckboxToggle('lights')}
            >
              <Icon
                name={checklistItems.lights ? 'check-box' : 'check-box-outline-blank'}
                size="medium"
                color={checklistItems.lights ? colors.primary.main : colors.text.secondary}
                iconSet="MaterialIcons"
              />
              <Text style={styles.checklistText}>Lights & Indicators</Text>
            </TouchableOpacity>
          </Card>

          <Card style={styles.checklistCard}>
            <TouchableOpacity
              style={styles.checklistItem}
              onPress={() => handleCheckboxToggle('brakes')}
            >
              <Icon
                name={checklistItems.brakes ? 'check-box' : 'check-box-outline-blank'}
                size="medium"
                color={checklistItems.brakes ? colors.primary.main : colors.text.secondary}
                iconSet="MaterialIcons"
              />
              <Text style={styles.checklistText}>Brakes & Fluids</Text>
            </TouchableOpacity>
          </Card>

          {/* Photo Upload Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity
              style={styles.photoUploadArea}
              onPress={handleSelectPhotos}
            >
              <Icon name="camera-alt" size="xlarge" color={colors.text.secondary} iconSet="MaterialIcons" />
              <Text style={styles.photoUploadText}>Upload 4 sides (Required)</Text>
              <Button
                title="Select Photos"
                onPress={handleSelectPhotos}
                variant="outline"
                size="small"
                style={styles.selectPhotosButton}
              />
            </TouchableOpacity>
            {photos.length > 0 && (
              <Text style={styles.photoCount}>{photos.length} photo(s) selected</Text>
            )}
          </View>

          {/* Confirm & Next Button */}
          <View style={styles.confirmButtonContainer}>
            <Button
              title="Confirm & Next"
              onPress={handleConfirm}
              variant="primary"
              size="large"
              style={styles.confirmButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-specific style
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    } : {}),
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
  },
  logoText: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.white,
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  brandText: {
    ...typography.styles.h4,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing[4],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  backText: {
    ...typography.styles.body,
    color: colors.primary.main,
    marginLeft: spacing[2],
    lineHeight: 20,
    ...(typography.fontFamily.medium && { fontFamily: typography.fontFamily.medium }),
  },
  title: {
    ...typography.styles.h1,
    color: colors.text.primary,
    marginBottom: spacing[2],
    lineHeight: 28,
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  vehicleText: {
    ...typography.styles.body,
    color: colors.text.primary,
    marginBottom: spacing[5],
    lineHeight: 24,
    ...(typography.fontFamily.regular && { fontFamily: typography.fontFamily.regular }),
  },
  licenseCard: {
    backgroundColor: '#FFF9E6', // Light yellow
    marginBottom: spacing[5],
    padding: spacing[4],
  },
  licenseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  licenseTextContainer: {
    marginLeft: spacing[3],
    flex: 1,
  },
  licenseTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[1],
    lineHeight: 22,
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  licenseStatus: {
    ...typography.styles.body,
    color: colors.text.secondary,
    lineHeight: 20,
    ...(typography.fontFamily.regular && { fontFamily: typography.fontFamily.regular }),
  },
  sectionTitle: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1,
    marginBottom: spacing[3],
    ...(typography.fontFamily.medium && { fontFamily: typography.fontFamily.medium }),
  },
  checklistCard: {
    marginBottom: spacing[3],
    padding: spacing[4],
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistText: {
    ...typography.styles.body,
    color: colors.text.primary,
    marginLeft: spacing[3],
    lineHeight: 22,
    ...(typography.fontFamily.regular && { fontFamily: typography.fontFamily.regular }),
  },
  photoSection: {
    marginTop: spacing[4],
    marginBottom: spacing[5],
    alignItems: 'center',
  },
  photoUploadArea: {
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    minHeight: 200,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  photoUploadText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[3],
    marginBottom: spacing[3],
    textAlign: 'center',
    lineHeight: 20,
    ...(typography.fontFamily.regular && { fontFamily: typography.fontFamily.regular }),
  },
  selectPhotosButton: {
    marginTop: spacing[2],
  },
  photoCount: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[2],
    ...(typography.fontFamily.regular && { fontFamily: typography.fontFamily.regular }),
  },
  confirmButtonContainer: {
    alignItems: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  confirmButton: {
    width: '100%',
    maxWidth: 400,
  },
});
