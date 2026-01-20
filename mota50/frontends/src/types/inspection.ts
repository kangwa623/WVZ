export type InspectionType = 'pre_trip' | 'post_trip';
export type DefectSeverity = 'critical' | 'major' | 'minor';
export type InspectionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface InspectionItem {
  id: string;
  name: string;
  category: string;
  isChecked: boolean;
  notes?: string;
  photos?: string[];
}

export interface Inspection {
  id: string;
  tripId?: string;
  vehicleId: string;
  type: InspectionType;
  status: InspectionStatus;
  items: InspectionItem[];
  defects: Defect[];
  completedAt?: string;
  completedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Defect {
  id: string;
  itemId: string;
  description: string;
  severity: DefectSeverity;
  photos: string[];
  workOrderCreated: boolean;
  workOrderId?: string;
}

export interface CreateInspectionRequest {
  tripId?: string;
  vehicleId: string;
  type: InspectionType;
  items: Omit<InspectionItem, 'id'>[];
  defects?: Omit<Defect, 'id' | 'workOrderCreated'>[];
}
