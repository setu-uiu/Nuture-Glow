// ============================================================================
// Admin API Service — Typed, using centralized apiFetch
// ============================================================================
import { apiFetch } from './api';
import type {
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
} from '../types/api';

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Build a query-string from an object, omitting undefined/null/'' values. */
function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (!entries.length) return '';
  const sp = new URLSearchParams();
  for (const [k, v] of entries) sp.append(k, String(v));
  return `?${sp}`;
}

/** Download a file as a Blob via apiFetch-style auth. */
async function fetchBlob(path: string): Promise<Blob> {
  // For blob downloads we still need raw fetch for the blob() call,
  // but we reuse the same auth token logic.
  const TOKEN_KEY = 'ng_auth_token';
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { headers });
  if (!response.ok) throw new Error(`Download failed (${response.status})`);
  return response.blob();
}

// ============================================================================
// SYSTEM ADMIN
// ============================================================================

const system = {
  getDashboard(): Promise<SystemDashboardResponse> {
    return apiFetch<SystemDashboardResponse>('/api/admin/system/dashboard');
  },

  getUsers(page = 1, limit = 50, role = '', status = ''): Promise<UsersListResponse> {
    return apiFetch<UsersListResponse>(
      `/api/admin/system/users${qs({ page, limit, role, status })}`
    );
  },

  updateUser(userId: string, data: { role?: string; status?: string }): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(`/api/admin/system/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getSecurityEvents(resolved?: boolean, severity?: string): Promise<SecurityEventsResponse> {
    return apiFetch<SecurityEventsResponse>(
      `/api/admin/system/security-events${qs({ resolved, severity })}`
    );
  },

  resolveSecurityEvent(eventId: string): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(
      `/api/admin/system/security-events/${eventId}/resolve`,
      { method: 'PATCH' }
    );
  },

  logSecurityEvent(data: {
    eventType: string;
    severity: string;
    userId?: string;
    description: string;
    metadata?: Record<string, unknown>;
  }): Promise<EntityCreatedResponse> {
    return apiFetch<EntityCreatedResponse>('/api/admin/system/security-events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  exportUsers(): Promise<Blob> {
    return fetchBlob('/api/admin/system/users/export');
  },

  getBackups(): Promise<BackupsListResponse> {
    return apiFetch<BackupsListResponse>('/api/admin/system/backups');
  },

  createBackup(): Promise<EntityCreatedResponse> {
    return apiFetch<EntityCreatedResponse>('/api/admin/system/backups', { method: 'POST' });
  },

  downloadBackup(backupId: string): Promise<Blob> {
    return fetchBlob(`/api/admin/system/backups/${backupId}/download`);
  },

  getMetrics(): Promise<SystemMetricsResponse> {
    return apiFetch<SystemMetricsResponse>('/api/admin/system/metrics');
  },

  getHealth(): Promise<SystemHealthResponse> {
    return apiFetch<SystemHealthResponse>('/api/admin/system/health');
  },

  // IP Blacklist Management
  getBlacklistedIPs(): Promise<BlacklistResponse> {
    return apiFetch<BlacklistResponse>('/api/admin/system/ip-blacklist');
  },

  addBlacklistedIP(data: { ip_address: string; reason: string; expires_at?: string }): Promise<EntityCreatedResponse> {
    return apiFetch<EntityCreatedResponse>('/api/admin/system/ip-blacklist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  removeBlacklistedIP(id: string): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(`/api/admin/system/ip-blacklist/${id}`, {
      method: 'DELETE',
    });
  },

  // Backup Restore & Delete
  restoreBackup(backupId: string): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(`/api/admin/system/backups/${backupId}/restore`, {
      method: 'POST',
    });
  },

  deleteBackup(backupId: string): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(`/api/admin/system/backups/${backupId}`, {
      method: 'DELETE',
    });
  },

  // Audit Trail Export
  exportAuditTrail(startDate?: string, endDate?: string): Promise<Blob> {
    return fetchBlob(`/api/admin/system/audit-trail/export${qs({ startDate, endDate })}`);
  },

  // Messages
  getMessages(): Promise<MessagesResponse> {
    return apiFetch<MessagesResponse>('/api/admin/system/messages');
  },

  sendMessage(data: {
    title: string;
    content: string;
    severity: string;
    broadcast_to: string;
    target_role?: string;
  }): Promise<EntityCreatedResponse> {
    return apiFetch<EntityCreatedResponse>('/api/admin/system/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Settings
  getSettings(): Promise<SettingsResponse> {
    return apiFetch<SettingsResponse>('/api/admin/system/settings');
  },

  updateSetting(key: string, value: string): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(`/api/admin/system/settings/${key}`, {
      method: 'PATCH',
      body: JSON.stringify({ value }),
    });
  },

  // Suspension Appeals
  getSuspensionAppeals(): Promise<AppealsResponse> {
    return apiFetch<AppealsResponse>('/api/admin/system/appeals');
  },

  resolveSuspensionAppeal(
    appealId: string,
    data: { status: 'approved' | 'rejected'; resolutionMessage?: string }
  ): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(`/api/admin/system/appeals/${appealId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// OPERATIONS ADMIN
// ============================================================================

const operations = {
  getDashboard(): Promise<OpsDashboardResponse> {
    return apiFetch<OpsDashboardResponse>('/api/admin/operations/dashboard');
  },

  getCardBatches(): Promise<CardBatchesResponse> {
    return apiFetch<CardBatchesResponse>('/api/admin/operations/card-batches');
  },

  createCardBatch(data: {
    batchNumber: string;
    cardType: string;
    quantity: number;
    expiryDate: string;
  }): Promise<EntityCreatedResponse> {
    return apiFetch<EntityCreatedResponse>('/api/admin/operations/card-batches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  activateCardBatch(batchId: string): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(
      `/api/admin/operations/card-batches/${batchId}/activate`,
      { method: 'PATCH' }
    );
  },

  getPendingHospitals(): Promise<HospitalsResponse> {
    return apiFetch<HospitalsResponse>('/api/admin/operations/hospitals/pending');
  },

  createHospital(data: {
    hospitalName: string;
    hospitalType: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    city: string;
    district: string;
    bedCapacity: number;
    licenseNumber: string;
  }): Promise<EntityCreatedResponse> {
    return apiFetch<EntityCreatedResponse>('/api/admin/operations/hospitals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  approveHospital(hospitalId: string, reviewNotes: string): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(
      `/api/admin/operations/hospitals/${hospitalId}/approve`,
      { method: 'PATCH', body: JSON.stringify({ reviewNotes }) }
    );
  },

  updateHospital(hospitalId: string, data: Record<string, unknown>): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(
      `/api/admin/operations/hospitals/${hospitalId}`,
      { method: 'PATCH', body: JSON.stringify(data) }
    );
  },

  deleteHospital(hospitalId: string): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(
      `/api/admin/operations/hospitals/${hospitalId}`,
      { method: 'DELETE' }
    );
  },

  getCsrPrograms(): Promise<CsrProgramsResponse> {
    return apiFetch<CsrProgramsResponse>('/api/admin/operations/csr-programs');
  },

  createCsrProgram(data: {
    programName: string;
    sponsorName: string;
    sponsorContact: string;
    programType: string;
    budget: number;
    targetBeneficiaries: number;
    startDate: string;
    endDate: string;
    description: string;
  }): Promise<EntityCreatedResponse> {
    return apiFetch<EntityCreatedResponse>('/api/admin/operations/csr-programs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCsrProgram(programId: string, data: Record<string, unknown>): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(
      `/api/admin/operations/csr-programs/${programId}`,
      { method: 'PATCH', body: JSON.stringify(data) }
    );
  },

  deleteCsrProgram(programId: string): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(
      `/api/admin/operations/csr-programs/${programId}`,
      { method: 'DELETE' }
    );
  },

  getSupportTickets(status?: string, priority?: string): Promise<SupportTicketsResponse> {
    return apiFetch<SupportTicketsResponse>(
      `/api/admin/operations/support-tickets${qs({ status, priority })}`
    );
  },

  createSupportTicket(data: {
    userId?: string;
    userName: string;
    userPhone: string;
    category: string;
    priority: string;
    subject: string;
    description: string;
  }): Promise<EntityCreatedResponse> {
    return apiFetch<EntityCreatedResponse>('/api/admin/operations/support-tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSupportTicket(
    ticketId: string,
    data: { status: string; resolutionNotes?: string }
  ): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(
      `/api/admin/operations/support-tickets/${ticketId}`,
      { method: 'PATCH', body: JSON.stringify(data) }
    );
  },
};

// ============================================================================
// MEDICAL ADMIN
// ============================================================================

const medical = {
  getDashboard(): Promise<MedicalDashboardResponse> {
    return apiFetch<MedicalDashboardResponse>('/api/admin/medical/dashboard');
  },

  getDoctorVerifications(status = 'PENDING'): Promise<DoctorVerificationsResponse> {
    return apiFetch<DoctorVerificationsResponse>(
      `/api/admin/medical/doctor-verifications${qs({ status })}`
    );
  },

  reviewDoctorVerification(
    verificationId: string,
    data: { status: string; reviewNotes?: string; rejectionReason?: string }
  ): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(
      `/api/admin/medical/doctor-verifications/${verificationId}`,
      { method: 'PATCH', body: JSON.stringify(data) }
    );
  },

  getHighRiskCases(status = 'ACTIVE'): Promise<HighRiskCasesResponse> {
    return apiFetch<HighRiskCasesResponse>(
      `/api/admin/medical/high-risk-cases${qs({ status })}`
    );
  },

  flagHighRiskCase(data: {
    patientUserId: string;
    riskLevel: string;
    riskFactors: string[];
    symptoms: string;
    currentWeek: number;
    monitoringFrequency: string;
    notes: string;
  }): Promise<EntityCreatedResponse> {
    return apiFetch<EntityCreatedResponse>('/api/admin/medical/high-risk-cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateHighRiskCase(
    caseId: string,
    data: { status?: string; assignedDoctorId?: string; nextCheckup?: string; notes?: string }
  ): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(
      `/api/admin/medical/high-risk-cases/${caseId}`,
      { method: 'PATCH', body: JSON.stringify(data) }
    );
  },

  getConsultationReviews(status = 'PENDING'): Promise<ConsultationReviewsResponse> {
    return apiFetch<ConsultationReviewsResponse>(
      `/api/admin/medical/consultation-reviews${qs({ status })}`
    );
  },

  reviewConsultation(
    reviewId: string,
    data: {
      reviewStatus: string;
      qualityScore: number;
      completenessScore: number;
      professionalismScore: number;
      reviewNotes: string;
      flaggedIssues?: unknown;
    }
  ): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(
      `/api/admin/medical/consultation-reviews/${reviewId}`,
      { method: 'PATCH', body: JSON.stringify(data) }
    );
  },

  getEmergencyAccessLogs(): Promise<EmergencyLogsResponse> {
    return apiFetch<EmergencyLogsResponse>('/api/admin/medical/emergency-access-logs');
  },

  logEmergencyAccess(data: {
    patientUserId: string;
    accessType: string;
    reason: string;
    emergencyLevel: string;
    dataAccessed: unknown;
  }): Promise<EntityCreatedResponse> {
    return apiFetch<EntityCreatedResponse>('/api/admin/medical/emergency-access-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// SHARED ADMIN
// ============================================================================

const shared = {
  getNotifications(): Promise<AdminNotificationsResponse> {
    return apiFetch<AdminNotificationsResponse>('/api/admin/notifications');
  },

  markNotificationRead(notificationId: string): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(
      `/api/admin/notifications/${notificationId}/read`,
      { method: 'PATCH' }
    );
  },

  getActions(role?: string, category?: string, limit = 50): Promise<AdminActionsResponse> {
    return apiFetch<AdminActionsResponse>(
      `/api/admin/actions${qs({ role, category, limit })}`
    );
  },

  createInteraction(data: {
    targetUserId: string;
    interactionType: string;
    subject: string;
    description: string;
    entityType?: string;
    entityId?: string;
  }): Promise<EntityCreatedResponse> {
    return apiFetch<EntityCreatedResponse>('/api/admin/interactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getInteractions(): Promise<AdminInteractionsResponse> {
    return apiFetch<AdminInteractionsResponse>('/api/admin/interactions');
  },

  respondToInteraction(
    interactionId: string,
    data: { status: string; response: string }
  ): Promise<MutationSuccessResponse> {
    return apiFetch<MutationSuccessResponse>(
      `/api/admin/interactions/${interactionId}/respond`,
      { method: 'PATCH', body: JSON.stringify(data) }
    );
  },

  getOverviewStats(): Promise<OverviewStatsResponse> {
    return apiFetch<OverviewStatsResponse>('/api/admin/stats/overview');
  },
};

// ============================================================================
// EXPORT
// ============================================================================

export const adminApi = {
  system,
  operations,
  medical,
  shared,
} as const;
