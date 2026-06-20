export interface TemperatureRange {
  min: number;
  max: number;
  unit: string;
}

export interface CheckPoint {
  id: string;
  name: string;
  type: 'loading' | 'service_area' | 'check' | 'delivery';
  distance?: string;
  eta?: string;
  completed: boolean;
  reminderTime?: string;
}

export interface TaskStatus {
  id: string;
  status: 'pending' | 'in_transit' | 'completed';
  currentTemp: number;
  lastCheckTime: string;
  doorOpenCount: number;
  photos: string[];
}

export interface Task {
  id: string;
  orderNo: string;
  cargoType: string;
  cargoName: string;
  cargoWeight: string;
  targetTemp: TemperatureRange;
  allowedFluctuation: number;
  expectedDoorOpenings: number;
  loadingPoint: string;
  deliveryPoint: string;
  loadingTime: string;
  estimatedArrival: string;
  checkPoints: CheckPoint[];
  status: TaskStatus;
  receiverName: string;
  receiverPhone: string;
  specialRequirements?: string;
}

export type ReminderType = 'loading_30min' | 'service_area' | 'near_delivery' | 'temp_warning' | 'custom';
export type DriverResponse = 'temp_normal' | 'refuel_no_open' | 'fluctuation_found' | 'checked_ok';

export interface Reminder {
  id: string;
  taskId: string;
  type: ReminderType;
  title: string;
  content: string;
  triggerTime: string;
  triggered: boolean;
  responded: boolean;
  response?: DriverResponse;
  responseTime?: string;
  photoUrl?: string;
  note?: string;
}

export interface GuideStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface HandoverForm {
  currentTemp: number;
  receiverName: string;
  receiverId?: string;
  unloadingStartTime: string;
  signatures: {
    driver: string;
    receiver: string;
  };
  photos: string[];
  remarks?: string;
}

export interface DriverResponseRecord {
  id: string;
  taskId: string;
  reminderId?: string;
  response: DriverResponse;
  responseTime: string;
  photoUrl?: string;
  note?: string;
}

export interface HandoverSummary {
  taskId: string;
  orderNo: string;
  cargoName: string;
  tempRecord: {
    loading: number;
    average: number;
    arrival: number;
    range: TemperatureRange;
  };
  doorOpenCount: number;
  checkPointCount: number;
  completedCheckPoints: number;
  arrivalTime: string;
  unloadingStartTime: string;
  receiverName: string;
  summaryCode: string;
  photos?: string[];
}
