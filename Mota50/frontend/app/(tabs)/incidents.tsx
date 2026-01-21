import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Image } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import Button from '@/components/common/Button';
import incidentService, { Incident } from '@/services/incidents';

export default function IncidentsScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved' | 'archived'>('all');

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getIncidents();
      setIncidents(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  // Refresh incidents when screen is focused (real-time updates)
  useFocusEffect(
    React.useCallback(() => {
      loadIncidents();
    }, [])
  );

  useEffect(() => {
    loadIncidents();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return colors.semantic.success;
      case 'reviewed':
        return colors.semantic.info;
      case 'pending':
        return colors.semantic.warning;
      case 'archived':
        return colors.text.tertiary;
      default:
        return colors.text.secondary;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'accident':
        return colors.semantic.error;
      case 'breakdown':
        return colors.semantic.warning;
      case 'violation':
        return colors.semantic.info;
      case 'other':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accident':
        return 'directions-car';
      case 'breakdown':
        return 'build';
      case 'violation':
        return 'receipt';
      case 'other':
        return 'security';
      default:
        return 'warning';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'accident':
        return 'Accident';
      case 'breakdown':
        return 'Breakdown';
      case 'violation':
        return 'Traffic Fine';
      case 'other':
        return 'Theft/Other';
      default:
        return 'Unknown';
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

  const handleMarkAsReviewed = async (incidentId: string) => {
    if (!user) return;
    try {
      await incidentService.updateIncidentStatus(incidentId, 'reviewed', user.id || 'admin');
      await loadIncidents();
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident({ ...selectedIncident, status: 'reviewed', reviewedBy: user.id || 'admin', reviewedAt: new Date().toISOString() });
      }
      Alert.alert('Success', 'Incident marked as reviewed');
    } catch (error) {
      Alert.alert('Error', 'Failed to update incident status');
    }
  };

  const handleResolve = async (incidentId: string) => {
    if (!user) return;
    try {
      await incidentService.updateIncidentStatus(incidentId, 'resolved', user.id || 'admin');
      await loadIncidents();
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident({ ...selectedIncident, status: 'resolved', reviewedBy: user.id || 'admin', reviewedAt: new Date().toISOString() });
      }
      Alert.alert('Success', 'Incident marked as resolved');
    } catch (error) {
      Alert.alert('Error', 'Failed to resolve incident');
    }
  };

  const handleArchive = async (incidentId: string) => {
    if (!user) return;
    try {
      await incidentService.updateIncidentStatus(incidentId, 'archived', user.id || 'admin');
      await loadIncidents();
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident(null);
      }
      Alert.alert('Success', 'Incident archived');
    } catch (error) {
      Alert.alert('Error', 'Failed to archive incident');
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'all') return true;
    return incident.status === filter;
  });

  if (selectedIncident) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedIncident(null)} style={styles.backButton}>
            <Icon name="arrow-back" size="medium" color={colors.primary.main} iconSet="MaterialIcons" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <Card style={styles.incidentCard}>
            <View style={styles.incidentHeader}>
              <View style={styles.incidentHeaderLeft}>
                <Icon
                  name={getTypeIcon(selectedIncident.type)}
                  size="large"
                  color={getTypeColor(selectedIncident.type)}
                  iconSet="MaterialIcons"
                />
                <View style={styles.incidentHeaderText}>
                  <Text style={styles.incidentTitle}>{getTypeLabel(selectedIncident.type)}</Text>
                  <Text style={styles.incidentMeta}>
                    {selectedIncident.driverName} • {formatDate(selectedIncident.createdAt)}
                  </Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedIncident.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(selectedIncident.status) }]}>
                  {selectedIncident.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {selectedIncident.photos && selectedIncident.photos.length > 0 && (
              <View style={styles.photosContainer}>
                <Text style={styles.sectionTitle}>Evidence Photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                  {selectedIncident.photos.map((photo, index) => (
                    <Image key={index} source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Driver Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{selectedIncident.driverName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{selectedIncident.driverEmail}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Incident Details</Text>
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>{selectedIncident.description}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.locationBox}>
                <Icon name="location-on" size="medium" color={colors.semantic.error} iconSet="MaterialIcons" />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationText}>
                    {selectedIncident.location.address || 'Location captured'}
                  </Text>
                  <Text style={styles.locationCoords}>
                    GPS: {selectedIncident.location.latitude.toFixed(6)}, {selectedIncident.location.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
            </View>

            {selectedIncident.reviewedBy && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Review Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Reviewed By:</Text>
                  <Text style={styles.infoValue}>{selectedIncident.reviewedBy}</Text>
                </View>
                {selectedIncident.reviewedAt && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Reviewed At:</Text>
                    <Text style={styles.infoValue}>{formatDate(selectedIncident.reviewedAt)}</Text>
                  </View>
                )}
                {selectedIncident.reviewNotes && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Notes:</Text>
                    <Text style={styles.infoValue}>{selectedIncident.reviewNotes}</Text>
                  </View>
                )}
              </View>
            )}

            {selectedIncident.status === 'pending' && (
              <View style={styles.actions}>
                <Button
                  title="Mark as Reviewed"
                  onPress={() => handleMarkAsReviewed(selectedIncident.id)}
                  variant="primary"
                  fullWidth
                  icon="check"
                  iconSet="MaterialIcons"
                  style={styles.actionButton}
                />
                <Button
                  title="Resolve"
                  onPress={() => handleResolve(selectedIncident.id)}
                  variant="primary"
                  fullWidth
                  icon="done"
                  iconSet="MaterialIcons"
                  style={[styles.actionButton, { backgroundColor: colors.semantic.success }]}
                />
              </View>
            )}
            {selectedIncident.status !== 'archived' && (
              <Button
                title="Archive"
                onPress={() => handleArchive(selectedIncident.id)}
                variant="secondary"
                fullWidth
                icon="archive"
                iconSet="MaterialIcons"
                style={styles.actionButton}
              />
            )}
          </Card>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reported Incidents</Text>
        <TouchableOpacity onPress={loadIncidents} style={styles.refreshButton}>
          <Icon name="refresh" size="medium" color={colors.primary.main} iconSet="MaterialIcons" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'pending', 'reviewed', 'resolved', 'archived'].map((filterOption) => (
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
                  {incidents.filter(i => i.status === filterOption).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadIncidents} tintColor={colors.primary.main} />
        }
      >
        {filteredIncidents.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon name="warning" size="xlarge" color={colors.text.tertiary} iconSet="MaterialIcons" />
            <Text style={styles.emptyText}>No incidents found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' 
                ? 'Incidents reported by drivers/staff will appear here'
                : `No ${filter} incidents found`}
            </Text>
          </Card>
        ) : (
          filteredIncidents.map((incident) => (
            <TouchableOpacity
              key={incident.id}
              onPress={() => setSelectedIncident(incident)}
              style={styles.incidentItem}
            >
              <Card style={styles.incidentCard}>
                <View style={styles.incidentItemHeader}>
                  <View style={styles.incidentItemLeft}>
                    <Icon
                      name={getTypeIcon(incident.type)}
                      size="medium"
                      color={getTypeColor(incident.type)}
                      iconSet="MaterialIcons"
                    />
                    <View style={styles.incidentItemText}>
                      <Text style={styles.incidentItemTitle}>{getTypeLabel(incident.type)}</Text>
                      <Text style={styles.incidentItemMeta}>
                        {incident.driverName} • {incident.driverEmail}
                      </Text>
                      <Text style={styles.incidentItemDate}>
                        Reported: {formatDate(incident.createdAt)}
                      </Text>
                      {incident.location.address && (
                        <Text style={styles.incidentItemLocation}>
                          📍 {incident.location.address}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.incidentItemRight}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(incident.status) }]}>
                        {incident.status.toUpperCase()}
                      </Text>
                    </View>
                    {incident.status === 'pending' && (
                      <View style={styles.pendingIndicator} />
                    )}
                    {incident.photos && incident.photos.length > 0 && (
                      <View style={styles.photosBadge}>
                        <Icon name="photo" size="small" color={colors.text.secondary} iconSet="MaterialIcons" />
                        <Text style={styles.photosBadgeText}>{incident.photos.length}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.incidentItemPreview} numberOfLines={2}>
                  {incident.description}
                </Text>
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
  incidentItem: {
    margin: spacing[4],
  },
  incidentCard: {
    padding: spacing[4],
  },
  incidentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  incidentItemLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  incidentItemText: {
    marginLeft: spacing[3],
    flex: 1,
  },
  incidentItemTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  incidentItemMeta: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  incidentItemDate: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  incidentItemLocation: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  incidentItemRight: {
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
  photosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
  },
  photosBadgeText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginLeft: spacing[1],
  },
  incidentItemPreview: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[2],
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
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  incidentHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  incidentHeaderText: {
    marginLeft: spacing[3],
    flex: 1,
  },
  incidentTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  incidentMeta: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  photosContainer: {
    marginBottom: spacing[4],
  },
  photosScroll: {
    marginTop: spacing[2],
  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: spacing[2],
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
  descriptionBox: {
    backgroundColor: colors.background.secondary,
    padding: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  descriptionText: {
    ...typography.styles.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.secondary,
    padding: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  locationTextContainer: {
    marginLeft: spacing[2],
    flex: 1,
  },
  locationText: {
    ...typography.styles.body,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  locationCoords: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  actions: {
    marginTop: spacing[4],
    gap: spacing[2],
  },
  actionButton: {
    marginTop: spacing[2],
  },
});
