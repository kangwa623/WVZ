import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Icon from '@/components/common/Icon';

export default function LicenseScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [licenseData, setLicenseData] = useState<any>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Icon name="camera-alt" size="xlarge" color="primary" />
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.message}>
            We need camera access to scan your driver's license
          </Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            style={styles.button}
          />
        </Card>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    // In a real app, this would send the image/data to backend for OCR processing
    Alert.alert('License Scanned', 'Processing license information...');
    // Simulate license data
    setLicenseData({
      licenseNumber: 'DL123456',
      expiryDate: '2025-12-31',
      issuingAuthority: 'RTSA',
    });
  };

  if (licenseData) {
    return (
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Icon name="verified" size="xlarge" color="success" />
          <Text style={styles.title}>License Verified</Text>
          <View style={styles.licenseInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>License Number:</Text>
              <Text style={styles.infoValue}>{licenseData.licenseNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expiry Date:</Text>
              <Text style={styles.infoValue}>{licenseData.expiryDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Issuing Authority:</Text>
              <Text style={styles.infoValue}>{licenseData.issuingAuthority}</Text>
            </View>
          </View>
          <Button
            title="Scan Again"
            onPress={() => {
              setLicenseData(null);
              setScanned(false);
            }}
            variant="outline"
            style={styles.button}
          />
        </Card>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.instruction}>
            Position your license within the frame
          </Text>
          {scanned && (
            <Button
              title="Scan Again"
              onPress={() => setScanned(false)}
              style={styles.scanButton}
            />
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  card: {
    margin: spacing[4],
    padding: spacing[6],
    alignItems: 'center',
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  message: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  button: {
    marginTop: spacing[4],
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 300,
    height: 200,
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderRadius: 8,
  },
  instruction: {
    ...typography.styles.body,
    color: colors.base.white,
    marginTop: spacing[4],
    backgroundColor: colors.base.black + '80',
    padding: spacing[2],
    borderRadius: 8,
  },
  scanButton: {
    marginTop: spacing[6],
  },
  licenseInfo: {
    width: '100%',
    marginTop: spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
});
