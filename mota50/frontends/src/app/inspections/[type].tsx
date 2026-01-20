import { useLocalSearchParams } from 'expo-router';
import InspectionScreen from '@/screens/inspections/InspectionScreen';

export default function InspectionRoute() {
  const { vehicleId, tripId, type } = useLocalSearchParams<{
    vehicleId: string;
    tripId?: string;
    type: 'pre_trip' | 'post_trip';
  }>();

  if (!vehicleId || !type) {
    return null;
  }

  return (
    <InspectionScreen
      vehicleId={vehicleId}
      tripId={tripId}
      type={type}
    />
  );
}
