import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Image } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import Button from '@/components/common/Button';
import licenseStorageService, { StoredLicense } from '@/services/licenseStorage';

export default function LicensesScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [licenses, setLicenses] = useState<StoredLicense[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<StoredLicense | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'expired' | 'rejected'>('all');

  const loadLicenses = async () => {
    try {
      setLoading(true);
      const data = await licenseStorageService.getAllLicenses();
      setLicenses(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load licenses');
    } finally {
      setLoading(false);
    }
  };

  // Refresh licenses when screen is focused (real-time updates)
  useFocusEffect(
    React.useCallback(() => {
      loadLicenses();
    }, [])
  );

  useEffect(() => {
    loadLicenses();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.semantic.success;
      case 'pending':
        return colors.semantic.warning;
      case 'expired':
      case 'rejected':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  const getValidationColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return colors.semantic.success;
      case 'EXPIRED':
      case 'DENIED':
        return colors.semantic.error;
      case 'NEEDS_REVIEW':
        return colors.semantic.warning;
      default:
        return colors.text.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatExpiryDate = (dateString: string) => {
    if (dateString === 'UNKNOWN') return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpiringSoon = (expiryDate: string, days: number = 30) => {
    if (expiryDate === 'UNKNOWN') return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const threshold = new Date();
    threshold.setDate(today.getDate() + days);
    return expiry <= threshold && expiry >= today;
  };

  const handleApprove = async (licenseId: string) => {
    if (!user) return;
    try {
      await licenseStorageService.updateLicenseStatus(licenseId, 'approved', user.id || 'admin');
      await loadLicenses();
      if (selectedLicense?.id === licenseId) {
        setSelectedLicense({ ...selectedLicense, status: 'approved', reviewedBy: user.id || 'admin', reviewedAt: new Date().toISOString() });
      }
      Alert.alert('Success', 'License approved');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve license');
    }
  };

  const handleReject = async (licenseId: string) => {
    if (!user) return;
    try {
      await licenseStorageService.updateLicenseStatus(licenseId, 'rejected', user.id || 'admin');
      await loadLicenses();
      if (selectedLicense?.id === licenseId) {
        setSelectedLicense(null);
      }
      Alert.alert('Success', 'License rejected');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject license');
    }
  };

  const filteredLicenses = licenses.filter(license => {
    if (filter === 'all') return true;
    return license.status === filter;
  });

  if (selectedLicense) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedLicense(null)} style={styles.backButton}>
            <Icon name="arrow-back" size="medium" color={colors.primary.main} iconSet="MaterialIcons" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <Card style={styles.licenseCard}>
            <View style={styles.licenseHeader}>
              <View style={styles.licenseHeaderLeft}>
                <Icon name="credit-card" size="large" color={colors.primary.main} iconSet="MaterialIcons" />
                <View style={styles.licenseHeaderText}>
                  <Text style={styles.licenseTitle}>Driver License Details</Text>
                  <Text style={styles.licenseMeta}>
                    {selectedLicense.driverName} • {formatDate(selectedLicense.scannedAt)}
                  </Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedLicense.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(selectedLicense.status) }]}>
                  {selectedLicense.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {selectedLicense.imageUri && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: selectedLicense.imageUri }} style={styles.licenseImage} resizeMode="contain" />
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Driver Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{selectedLicense.driverName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{selectedLicense.driverEmail}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>License Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Full Name:</Text>
                <Text style={styles.infoValue}>{selectedLicense.licenseData.fullName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>License Number:</Text>
                <Text style={styles.infoValue}>{selectedLicense.licenseData.licenseNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Expiration Date:</Text>
                <Text style={[styles.infoValue, isExpiringSoon(selectedLicense.licenseData.expirationDate) && { color: colors.semantic.warning }]}>
                  {formatExpiryDate(selectedLicense.licenseData.expirationDate)}
                  {isExpiringSoon(selectedLicense.licenseData.expirationDate) && ' (Expiring Soon)'}
                </Text>
              </View>
              {selectedLicense.licenseData.dateOfBirth && selectedLicense.licenseData.dateOfBirth !== 'UNKNOWN' && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date of Birth:</Text>
                  <Text style={styles.infoValue}>{formatExpiryDate(selectedLicense.licenseData.dateOfBirth)}</Text>
                </View>
              )}
              {selectedLicense.licenseData.licenseClass && selectedLicense.licenseData.licenseClass !== 'UNKNOWN' && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>License Class:</Text>
                  <Text style={styles.infoValue}>{selectedLicense.licenseData.licenseClass}</Text>
                </View>
              )}
              {selectedLicense.licenseData.issuingAuthority && selectedLicense.licenseData.issuingAuthority !== 'UNKNOWN' && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Issuing Authority:</Text>
                  <Text style={styles.infoValue}>{selectedLicense.licenseData.issuingAuthority}</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Validation Status</Text>
              <View style={[styles.validationBadge, { backgroundColor: getValidationColor(selectedLicense.validation.status) + '20' }]}>
                <Text style={[styles.validationText, { color: getValidationColor(selectedLicense.validation.status) }]}>
                  {selectedLicense.validation.status}
                </Text>
              </View>
              <Text style={styles.validationMessage}>{selectedLicense.validation.message}</Text>
            </View>

            {selectedLicense.reviewedBy && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Review Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Reviewed By:</Text>
                  <Text style={styles.infoValue}>{selectedLicense.reviewedBy}</Text>
                </View>
                {selectedLicense.reviewedAt && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Reviewed At:</Text>
                    <Text style={styles.infoValue}>{formatDate(selectedLicense.reviewedAt)}</Text>
                  </View>
                )}
                {selectedLicense.reviewNotes && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Notes:</Text>
                    <Text style={styles.infoValue}>{selectedLicense.reviewNotes}</Text>
                  </View>
                )}
              </View>
            )}

            {selectedLicense.status === 'pending' && (
              <View style={styles.actions}>
                <Button
                  title="Approve License"
                  onPress={() => handleApprove(selectedLicense.id)}
                  variant="primary"
                  fullWidth
                  icon="check"
                  iconSet="MaterialIcons"
                  style={styles.actionButton}
                />
                <Button
                  title="Reject License"
                  onPress={() => handleReject(selectedLicense.id)}
                  variant="secondary"
                  fullWidth
                  icon="close"
                  iconSet="MaterialIcons"
                  style={styles.actionButton}
                />
              </View>
            )}
          </Card>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Driver Licenses</Text>
        <TouchableOpacity onPress={loadLicenses} style={styles.refreshButton}>
          <Icon name="refresh" size="medium" color={colors.primary.main} iconSet="MaterialIcons" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'pending', 'approved', 'expired', 'rejected'].map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[styles.filterButton, filter === filterOption && styles.filterButtonActive]}
            onPress={() => setFilter(filterOption as any)}
          >
            <Text style={[styles.filterButtonText, filter === filterOption && styles.filterButtonTextActive]}>
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
            {filterOption !== 'all' && (
              <View style={[styles.filterBadge, filter === filterOption && styles.filterBadgeActive]}>
                <Text style={[styles.filterBadgeText, filter === filterOption && styles.filterBadgeTextActive]}>
                  {licenses.filter(l => l.status === filterOption).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadLicenses} tintColor={colors.primary.main} />
        }
      >
        {filteredLicenses.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon name="credit-card" size="xlarge" color={colors.text.tertiary} iconSet="MaterialIcons" />
            <Text style={styles.emptyText}>No licenses found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' 
                ? 'Licenses scanned by drivers will appear here'
                : `No ${filter} licenses found`}
            </Text>
          </Card>
        ) : (
          filteredLicenses.map((license) => (
            <TouchableOpacity
              key={license.id}
              onPress={() => setSelectedLicense(license)}
              style={styles.licenseItem}
            >
              <Card style={styles.licenseCard}>
                <View style={styles.licenseItemHeader}>
                  <View style={styles.licenseItemLeft}>
                    <Icon
                      name="credit-card"
                      size="medium"
                      color={colors.primary.main}
                      iconSet="MaterialIcons"
                    />
                    <View style={styles.licenseItemText}>
                      <Text style={styles.licenseItemTitle}>{license.driverName}</Text>
                      <Text style={styles.licenseItemMeta}>
                        {license.licenseData.licenseNumber} • {license.licenseData.fullName}
                      </Text>
                      <Text style={styles.licenseItemDate}>
                        Scanned: {formatDate(license.scannedAt)}
                      </Text>
                      <Text style={styles.licenseItemExpiry}>
                        Expires: {formatExpiryDate(license.licenseData.expirationDate)}
                        {isExpiringSoon(license.licenseData.expirationDate) && (
                          <Text style={styles.expiringSoon}> (Expiring Soon)</Text>
                        )}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.licenseItemRight}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(license.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(license.status) }]}>
                        {license.status.toUpperCase()}
                      </Text>
                    </View>
                    {license.status === 'pending' && (
                      <View style={styles.pendingIndicator} />
                    )}
                  </View>
                </View>
                <View style={styles.validationRow}>
                  <View style={[styles.validationBadgeSmall, { backgroundColor: getValidationColor(license.validation.status) + '20' }]}>
                    <Text style={[styles.validationTextSmall, { color: getValidationColor(license.validation.status) }]}>
                      {license.validation.status}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
  },
  refreshButton: {
    padding: spacing[1],
  },
  filterContainer: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginHorizontal: spacing[1],
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary.main,
  },
  filterButtonText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterButtonTextActive: {
    color: colors.base.white,
  },
  filterBadge: {
    marginLeft: spacing[2],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 10,
    backgroundColor: colors.text.tertiary + '30',
  },
  filterBadgeActive: {
    backgroundColor: colors.base.white + '30',
  },
  filterBadgeText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    fontSize: 10,
  },
  filterBadgeTextActive: {
    color: colors.base.white,
  },
  content: {
    flex: 1,
  },
  emptyCard: {
    margin: spacing[4],
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptySubtext: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  licenseItem: {
    margin: spacing[4],
  },
  licenseCard: {
    padding: spacing[4],
  },
  licenseItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  licenseItemLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  licenseItemText: {
    marginLeft: spacing[3],
    flex: 1,
  },
  licenseItemTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  licenseItemMeta: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  licenseItemDate: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  licenseItemExpiry: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  expiringSoon: {
    color: colors.semantic.warning,
    fontWeight: typography.fontWeight.bold,
  },
  licenseItemRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 8,
    marginBottom: spacing[1],
  },
  statusText: {
    ...typography.styles.caption,
    fontWeight: typography.fontWeight.semibold,
  },
  pendingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.warning,
    marginTop: spacing[1],
  },
  validationRow: {
    marginTop: spacing[2],
  },
  validationBadgeSmall: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  validationTextSmall: {
    ...typography.styles.caption,
    fontWeight: typography.fontWeight.medium,
    fontSize: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    ...typography.styles.body,
    color: colors.primary.main,
    marginLeft: spacing[1],
  },
  licenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  licenseHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  licenseHeaderText: {
    marginLeft: spacing[3],
    flex: 1,
  },
  licenseTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  licenseMeta: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  imageContainer: {
    marginBottom: spacing[4],
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
  },
  licenseImage: {
    width: '100%',
    height: 200,
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing[3],
    fontWeight: typography.fontWeight.semibold,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  infoLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    ...typography.styles.body,
    color: colors.text.primary,
    flex: 2,
    textAlign: 'right',
    fontWeight: typography.fontWeight.medium,
  },
  validationBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    marginBottom: spacing[2],
    alignSelf: 'flex-start',
  },
  validationText: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.semibold,
  },
  validationMessage: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  actions: {
    marginTop: spacing[4],
    gap: spacing[2],
  },
  actionButton: {
    marginTop: spacing[2],
  },
});
