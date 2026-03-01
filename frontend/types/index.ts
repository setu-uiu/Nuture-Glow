// ============================================================================
// TYPES BARREL — Central re-export for all application types
// ============================================================================
//
// Usage:  import { User, PaginatedResponse, ApiSuccessResponse } from '../types';
//
// This file re-exports everything from the individual type modules so
// consumers only need a single import path.

// Core domain types (user, entities, etc.)
export type {
  UserRole,
  Language,
  NotificationType,
  Notification,
  HealthIdVerificationStatus,
  HealthIdVerificationRequest,
  User,
  JournalEntry,
  VerificationDocument,
  MedicalReport,
  DoctorVisit,
  Doctor,
  Appointment,
  MeetingData,
  MeetingInfo,
  DoctorReview,
  VaccineRecord,
  CommunityPost,
  PostComment,
  Hospital,
  Medicine,
  Myth,
  MealLog,
  Donor,
  BloodRequest,
} from '../types';

// Dashboard / role-based types
export type {
  AccessLevel,
  ConsentStatus,
  AuditLogEntry,
  DoctorProfile,
  PatientBasicInfo,
  Consultation,
  Prescription,
  Medication,
  DoctorSchedule,
  DoctorEarnings,
  DoctorDashboardData,
  DoctorNotification,
  DoctorVerificationRequest,
  HighRiskCase,
  ConsultationQualityMetric,
  EmergencyAlert,
  MedicalAdminDashboardData,
  SystemAlert,
  Card,
  CSRProgram,
  ServiceAnalytics,
  OpsAdminDashboardData,
  ActivityLog,
  UserAccount,
  RolePermission,
  SystemHealthMetrics,
  SecurityEvent,
  SystemAdminDashboardData,
  NutritionistProfile,
  NutritionPlan,
  PatientRef,
  NutritionistConsultation,
  NutritionistFollowUp,
  NutritionistDashboardData,
  DashboardApiResponse,
  ConsentGrant,
  ConsentRequest,
  EmergencyOverride,
} from './dashboard';

// Note: dashboard.ts has its own Hospital type that conflicts with types.ts Hospital.
// Import the dashboard version explicitly when needed:
//   import { Hospital as DashboardHospital } from '../types/dashboard';

// API response types
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  PaginationMeta,
  PaginatedResponse,
  PaginationParams,
  SystemDashboardResponse,
  UsersListResponse,
  SecurityEventsResponse,
  BackupsListResponse,
  SystemMetricsResponse,
  SystemHealthResponse,
  BlacklistResponse,
  MessagesResponse,
  SettingsResponse,
  AppealsResponse,
  OpsDashboardResponse,
  CardBatchesResponse,
  HospitalsResponse,
  CsrProgramsResponse,
  SupportTicketsResponse,
  MedicalDashboardResponse,
  DoctorVerificationsResponse,
  HighRiskCasesResponse,
  ConsultationReviewsResponse,
  EmergencyLogsResponse,
  AdminNotificationsResponse,
  AdminActionsResponse,
  AdminInteractionsResponse,
  OverviewStatsResponse,
  MutationSuccessResponse,
  EntityCreatedResponse,
} from './api';
