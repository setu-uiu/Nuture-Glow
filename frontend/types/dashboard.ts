// Dashboard TypeScript Types
// Defines all interfaces and types for role-based dashboards

import { Language, UserRole } from '../types';

// ============================================================================
// COMMON TYPES
// ============================================================================

// UserRole is now imported from central types.ts file

export type AccessLevel = 'NONE' | 'READ' | 'WRITE' | 'DELETE' | 'GRANT' | 'AUDIT';

export type ConsentStatus = 'active' | 'expired' | 'revoked' | 'pending';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userRole: UserRole;
  action: 'READ' | 'WRITE' | 'DELETE' | 'GRANT' | 'REVOKE';
  resource: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  sessionId: string;
  consentStatus?: ConsentStatus;
  result: 'success' | 'denied' | 'error';
  reason?: string;
}

// ============================================================================
// DOCTOR DASHBOARD TYPES
// ============================================================================

export interface DoctorProfile {
  id: string;
  name: string;
  bmdcNumber: string;
  specialization: string;
  verified: boolean;
  profileImage?: string;
  contactNumber: string;
  email: string;
  experience: number; // years
  consultationFee: number;
  rating: number;
  totalConsultations: number;
}

export interface PatientBasicInfo {
  id: string;
  name: string;
  age: number;
  gestationalWeek: number;
  profileImage?: string;
  riskLevel: 'low' | 'moderate' | 'high';
  consentStatus: ConsentStatus;
  consentExpiresAt?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  gestationalWeek: number;
  scheduledAt: string;
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: 'video' | 'phone' | 'in-person';
  duration: number; // minutes
  notes?: string;
  prescriptionId?: string;
  fee: number;
  consentGranted: boolean;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  createdAt: string;
  medications: Medication[];
  instructions: string;
  followUpDate?: string;
  locale: Language;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAvailable: boolean;
  maxConsultations: number;
}

export interface DoctorEarnings {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  pendingPayments: number;
  consultationCount: number;
  earningsHistory: {
    date: string;
    amount: number;
    consultationId: string;
  }[];
}

export interface DoctorDashboardData {
  profile: DoctorProfile;
  todayConsultations: Consultation[];
  upcomingConsultations: Consultation[];
  recentPatients: PatientBasicInfo[];
  earnings: DoctorEarnings;
  schedule: DoctorSchedule[];
  notifications: DoctorNotification[];
}

export interface DoctorNotification {
  id: string;
  type: 'new_appointment' | 'consultation_reminder' | 'patient_message' | 'payment_received';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// ============================================================================
// MEDICAL ADMIN DASHBOARD TYPES
// ============================================================================

export interface DoctorVerificationRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  bmdcNumber: string;
  bmdc: string;
  specialization: string;
  specialty: string;
  email: string;
  phone: string;
  experience: number;
  submittedAt: string;
  documents: {
    type: 'bmdc_certificate' | 'degree' | 'experience_letter';
    url: string;
    name?: string;
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'verified';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface HighRiskCase {
  id: string;
  motherId: string;
  motherName: string; // Anonymized if needed
  patientName: string; // Alias for motherName for UI consistency
  age: number;
  gestationalWeek: number;
  riskFactors: string[];
  riskLevel: 'moderate' | 'high' | 'critical';
  priority: 'moderate' | 'high' | 'critical'; // Alias for riskLevel
  lastConsultation?: string;
  assignedDoctor?: string;
  actionsTaken: string[];
  notes: string;
  flaggedAt: string;
  flaggedBy: string;
  status: 'monitoring' | 'escalated' | 'resolved';
}

export interface ConsultationQualityMetric {
  consultationId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  date: string;
  duration: number;
  prescriptionProvided: boolean;
  followUpScheduled: boolean;
  patientFeedback?: number; // 1-5 rating
  qualityScore: number; // 0-100
  issues: string[];
}

export interface EmergencyAlert {
  id: string;
  type: 'severe_bleeding' | 'high_bp' | 'severe_pain' | 'panic_button' | 'other';
  motherId: string;
  motherName: string;
  age: number;
  gestationalWeek: number;
  description: string;
  reportedAt: string;
  reportedBy: 'mother' | 'doctor' | 'family';
  status: 'active' | 'responded' | 'resolved';
  assignedDoctor?: string;
  emergencyAccessGranted: boolean;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface MedicalAdminDashboardData {
  stats: {
    pendingVerifications: number;
    highRiskCases: number;
    activeDoctors: number;
    averageQualityScore: number;
  };
  recentVerifications: DoctorVerificationRequest[];
  pendingVerifications: DoctorVerificationRequest[];
  highRiskCases: HighRiskCase[];
  activeEmergencies: EmergencyAlert[];
  qualityMetrics: {
    averageConsultationQuality: number;
    totalConsultations: number;
    highQualityConsultations: number;
    lowQualityConsultations: number;
  };
  systemAlerts: SystemAlert[];
  recentSecurityEvents: SecurityEvent[];
}

export interface SystemAlert {
  id: string;
  type: 'quality_issue' | 'policy_violation' | 'system_error' | 'security_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

// ============================================================================
// OPERATIONS ADMIN DASHBOARD TYPES
// ============================================================================

export interface Card {
  id: string;
  cardNumber: string;
  holderName?: string;
  userId?: string;
  type: 'basic' | 'premium' | 'csr_sponsored';
  status: 'inactive' | 'active' | 'suspended' | 'expired' | 'pending';
  balance?: number;
  issuedTo?: string; // mother ID
  issuedAt?: string;
  expiresAt?: string;
  activatedAt?: string;
  benefits: string[];
}

export interface Hospital {
  id: string;
  name: string;
  type: 'Government' | 'Private' | 'Maternity' | 'Emergency' | 'Clinic';
  location: string;
  contact: string;
  beds: string;
  specialties: string[];
  totalBeds: number;
  availableBeds: number;
  services: string[];
  onboardedAt: string;
  status: 'active' | 'inactive' | 'pending_verification';
  lat: number;
  lng: number;
}

export interface CSRProgram {
  id: string;
  name: string;
  description: string;
  sponsorOrganization: string;
  type: 'full_coverage' | 'partial_coverage' | 'card_distribution';
  budget: number;
  allocated: number;
  remaining: number;
  beneficiaries: number;
  targetBeneficiaries: number;
  currentBeneficiaries: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused' | 'planned';
  targetGroup: string;
}

export interface ServiceAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalConsultations: number;
  consultationsThisMonth: number;
  cardActivations: number;
  hospitalVisits: number;
  csrBeneficiaries: number;
  popularServices: {
    name: string;
    count: number;
  }[];
  userGrowth: {
    month: string;
    count: number;
  }[];
}

export interface OpsAdminDashboardData {
  stats: {
    activeCards: number;
    partnerHospitals: number;
    activeCSRPrograms: number;
    monthlyRevenue: number;
    totalUsers: number;
    pendingCardActivations: number;
  };
  cards: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
  };
  hospitals: Hospital[];
  csrPrograms: CSRProgram[];
  analytics: ServiceAnalytics;
  recentActivities: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  type: 'card_activated' | 'hospital_added' | 'csr_approved' | 'user_registered';
  description: string;
  timestamp: string;
  userId?: string;
}

// ============================================================================
// SYSTEM ADMIN DASHBOARD TYPES
// ============================================================================

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  lastActive: string;
  permissions: AccessLevel[];
}

export interface RolePermission {
  role: UserRole;
  resource: string;
  access: AccessLevel;
}

export interface SystemHealthMetrics {
  uptime: number; // percentage
  responseTime: number; // ms
  errorRate: number; // percentage
  activeUsers: number;
  apiCalls: number;
  databaseSize: number; // MB
  serverLoad: number; // percentage
  lastBackup: string;
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  diskUsage: number; // percentage
  networkIO: number; // percentage
}

export interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'unauthorized_access' | 'suspicious_activity' | 'data_breach_attempt';
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  actionTaken?: string;
}

export interface SystemAdminDashboardData {
  stats: {
    totalUsers: number;
    activeSessions: number;
    systemUptime: number;
    apiCallsPerMinute: number;
    databaseSize: number;
    criticalAlerts: number;
  };
  users: {
    total: number;
    byRole: { role: UserRole; count: number }[];
    activeToday: number;
  };
  systemHealth: SystemHealthMetrics;
  securityEvents: SecurityEvent[];
  recentSecurityEvents: SecurityEvent[];
  auditLogs: AuditLogEntry[];
  recentChanges: {
    type: 'role_change' | 'permission_change' | 'user_created' | 'user_suspended';
    description: string;
    timestamp: string;
    performedBy: string;
  }[];
}

// ============================================================================
// NUTRITIONIST DASHBOARD TYPES
// ============================================================================

export interface NutritionistProfile {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  certifications?: string[];
  phone?: string;
  profileImage?: string;
  verified?: boolean;
}

export interface NutritionPlan {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  description?: string;
  goals?: string;
  dietaryRestrictions?: string;
  recommendations?: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt?: string;
  startDate?: string;
  endDate?: string;
  followUpDate?: string;
}

export interface PatientRef {
  id: string;
  name: string;
  email?: string;
  age?: number;
  bmi?: number;
  dietaryRestrictions?: string;
  goals?: string;
  lastConsultation?: string;
}

export interface NutritionistConsultation {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  topic?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  duration?: number;
}

export interface NutritionistFollowUp {
  id: string;
  patientId: string;
  patientName: string;
  reason?: string;
  date: string;
  status: 'pending' | 'completed';
}

export interface NutritionistDashboardData {
  profile: NutritionistProfile;
  stats: {
    totalPatients: number;
    newPatientsThisMonth?: number;
    activePlans: number;
    draftPlans?: number;
    completedPlans?: number;
    totalPlans: number;
    consultationsThisMonth: number;
    avgCompletionRate?: number;
    patientSatisfaction?: number;
  };
  recentConsultations?: NutritionistConsultation[];
  upcomingFollowUps?: NutritionistFollowUp[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface DashboardApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// CONSENT MANAGEMENT TYPES
// ============================================================================

export interface ConsentGrant {
  id: string;
  motherId: string;
  doctorId: string;
  grantedAt: string;
  expiresAt: string;
  status: ConsentStatus;
  allowedResources: string[];
  revokedAt?: string;
  revokeReason?: string;
}

export interface ConsentRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  motherId: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
  requestedResources: string[];
  reason: string;
}

// ============================================================================
// EMERGENCY OVERRIDE TYPES
// ============================================================================

export interface EmergencyOverride {
  id: string;
  motherId: string;
  emergencyDoctorId: string;
  activatedBy: string;
  activatedAt: string;
  expiresAt: string;
  reason: string;
  status: 'active' | 'expired' | 'revoked';
  dataAccessed: string[];
  reviewedBy?: string;
  reviewedAt?: string;
  motherNotified: boolean;
}
