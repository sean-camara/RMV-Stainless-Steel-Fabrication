// User types
export interface User {
  _id: string;
  id?: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: Address;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: Address;
    avatar?: string;
  };
  notifications?: {
    email: {
        appointments?: boolean;
        payments?: boolean;
        marketing?: boolean;
        security?: boolean;
        updates?: boolean;
    }
  };
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Address {
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  country?: string;
  landmark?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type UserRole =
  | 'customer'
  | 'appointment_agent'
  | 'sales_staff'
  | 'engineer'
  | 'cashier'
  | 'fabrication_staff'
  | 'admin';

// Auth types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Appointment types
export interface Appointment {
  _id: string;
  customer: User;
  customerId?: User; // Alias for backward compatibility
  assignedSalesStaff?: User;
  scheduledDate: string;
  scheduledTime?: string;
  scheduledEndDate: string;
  appointmentType: 'office_consultation' | 'ocular_visit';
  siteAddress?: Address;
  interestedCategory?: ProjectCategory;
  description?: string;
  status: AppointmentStatus;
  notes: {
    customerNotes?: string;
    agentNotes?: string;
    salesNotes?: string;
  };
  agentNotes?: string; // Shorthand
  convertedToProject?: string;
  canBeCancelled: boolean;
  travelFee?: TravelFee;
  createdAt: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
}

export type TravelFeeStatus = 'not_required' | 'pending' | 'collected' | 'verified';

export interface TravelFee {
  isRequired?: boolean;
  amount?: number;
  status?: TravelFeeStatus;
  collectedBy?: User;
  collectedAt?: string;
  verifiedBy?: User;
  verifiedAt?: string;
  notes?: string;
}

// Project types
export interface Project {
  _id: string;
  projectNumber: string;
  projectName?: string;
  customer: User;
  customerId?: User; // Alias for backward compatibility
  sourceAppointment?: Appointment;
  category: ProjectCategory;
  title: string;
  description?: string;
  specifications?: ProjectSpecifications;
  siteAddress?: Address;
  status: ProjectStatus;
  assignedStaff: {
    salesStaff?: User;
    engineer?: User;
    fabricationStaff?: User[];
  };
  consultation?: ConsultationData;
  blueprint?: VersionedFile;
  costing?: CostingData;
  quotation?: QuotationData;
  customerApproval?: CustomerApproval;
  revisions: Revision[];
  paymentStages: PaymentStages;
  fabrication: FabricationData;
  installation?: InstallationData;
  timeline: {
    estimatedCompletion?: string;
    actualCompletion?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface QuotationData {
  materialCost?: number;
  laborCost?: number;
  totalAmount?: number;
  estimatedDays?: number;
}

export type ProjectCategory = 'gates' | 'railings' | 'kitchen' | 'commercial';

export type ProjectStatus =
  | 'draft'
  | 'pending_blueprint'
  | 'blueprint_pending'
  | 'blueprint_submitted'
  | 'blueprint_uploaded'
  | 'pending_customer_approval'
  | 'client_approved'
  | 'client_rejected'
  | 'revision_requested'
  | 'approved'
  | 'pending_initial_payment'
  | 'dp_pending'
  | 'initial_payment_verified'
  | 'in_fabrication'
  | 'pending_midpoint_payment'
  | 'midpoint_payment_verified'
  | 'fabrication_done'
  | 'ready_for_installation'
  | 'ready_for_pickup'
  | 'released'
  | 'in_installation'
  | 'pending_final_payment'
  | 'completed'
  | 'cancelled'
  | 'on_hold';

export interface ProjectSpecifications {
  material?: '304_grade' | '316_grade' | 'other';
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit: string;
  };
  color?: string;
  finish?: 'brushed' | 'polished' | 'matte' | 'mirror' | 'other';
  additionalSpecs?: string;
}

export interface ConsultationData {
  conductedBy?: User;
  conductedAt?: string;
  notes?: string;
  measurements?: Array<{
    label: string;
    value: number;
    unit: string;
  }>;
  photos?: FileUpload[];
}

export interface VersionedFile {
  currentVersion: number;
  version?: number; // Shorthand for current version
  fileUrl?: string; // Shorthand for current file URL
  uploadedAt?: string; // Shorthand for current upload date
  clientFeedback?: string; // For revision feedback
  versions: Array<{
    version: number;
    filename: string;
    originalName: string;
    path: string;
    uploadedBy?: User;
    uploadedAt: string;
    notes?: string;
  }>;
}

export interface CostingData extends VersionedFile {
  approvedAmount?: number;
  versions: Array<{
    version: number;
    filename: string;
    originalName: string;
    path: string;
    uploadedBy?: User;
    uploadedAt: string;
    totalAmount?: number;
    breakdown?: Array<{
      item: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    notes?: string;
  }>;
}

export interface CustomerApproval {
  isApproved: boolean;
  approvedAt?: string;
  approvedVersion?: {
    blueprint: number;
    costing: number;
  };
  signature?: string;
}

export interface Revision {
  requestedBy: User;
  requestedAt: string;
  type: 'minor' | 'major';
  description: string;
  resolvedAt?: string;
  resolvedBy?: User;
}

export interface PaymentStages {
  initial: { percentage: number; amount?: number };
  midpoint: { percentage: number; amount?: number };
  final: { percentage: number; amount?: number };
}

export interface FabricationData {
  startedAt?: string;
  completedAt?: string;
   releasedAt?: string;
  progress: number;
  photos: FileUpload[];
  notes: Array<{
    content: string;
    createdBy: User;
    createdAt: string;
  }>;
}

export interface InstallationData {
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  photos: FileUpload[];
}

export interface FileUpload {
  filename: string;
  originalName: string;
  path: string;
  caption?: string;
  uploadedBy?: User;
  uploadedAt: string;
}

// Payment types
export interface Payment {
  _id: string;
  project: Project;
  projectId?: Project; // Alias for backward compatibility
  customer: User;
  customerId?: User; // Alias for backward compatibility
  stage: 'design_fee' | 'ocular_fee' | 'initial' | 'midpoint' | 'final';
  amount: {
    expected: number;
    received?: number;
  };
  paymentMethod?: 'gcash' | 'bank_transfer' | 'cash' | 'other';
  paymentProof?: FileUpload;
  proofUrl?: string; // Shorthand for proof URL
  notes?: string;
  referenceNumber?: string; // Transaction reference
  qrCode?: FileUpload & { uploadedBy: User };
  qrCodes?: {
    gcash?: string | FileUpload;
    bank?: string | FileUpload;
  };
  status: PaymentStatus;
  verification?: {
    verifiedBy: User;
    verifiedAt: string;
    notes?: string;
    referenceNumber?: string;
  };
  verificationNotes?: string; // Shorthand
  verifiedAt?: string; // Shorthand
  rejection?: {
    rejectedBy: User;
    rejectedAt: string;
    reason: string;
  };
  receipt?: {
    receiptNumber: string;
    generatedAt: string;
    filename?: string;
    path?: string;
  };
  dueDate?: string;
  createdAt: string;
}

export type PaymentStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
