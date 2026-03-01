// ============================================================================
// SHARED API RESPONSE TYPES
// Standard envelope types for all API communication
// ============================================================================

/**
 * Standard success response from the API.
 * All successful API calls should return data wrapped in this envelope.
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

/**
 * Standard error response from the API.
 */
export interface ApiErrorResponse {
  success?: false;
  error: string;
  reason?: string;
  details?: Record<string, string>;
}

/**
 * Union type for any API response.
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Pagination metadata returned with paginated list responses.
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated list response — items + pagination info.
 * Re-exported from dashboard.ts for backwards compatibility,
 * but this is the canonical definition going forward.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Parameters for requesting paginated data.
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ============================================================================
// ADMIN API RESPONSE TYPES
// Field names match the backend SQL column names (snake_case) or the actual
// JSON shape the admin routes return.
// ============================================================================

// -- System Admin --

export interface SystemDashboardResponse {
  stats: {
    total_active_users?: number;
    new_users_week?: number;
    critical_security_alerts?: number;
    avg_uptime_24h?: number;
    admin_actions_24h?: number;
  };
  userBreakdown: Array<{ role: string; count: number }>;
  securityLogs: Array<{
    id?: string;
    event_type: string;
    description: string;
    severity: string;
    created_at: string;
    user_id?: string;
    ip_address?: string;
    resolved?: boolean;
  }>;
  systemHealth: Array<{
    component: string;
    status: string;
    uptime: number;
    response: number;
  }>;
  recentActions: Array<{
    id?: string;
    action_type: string;
    description: string;
    admin_email?: string;
    severity: string;
    created_at: string;
  }>;
}

export interface UsersListResponse {
  users: Array<{
    id: string;
    phone: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
    health_id?: string;
    [key: string]: unknown;
  }>;
  pagination?: PaginationMeta;
}

export interface SecurityEventsResponse {
  events: Array<{
    id: string;
    event_type: string;
    description: string;
    severity: string;
    user_id?: string;
    ip_address?: string;
    created_at: string;
    resolved: boolean;
    [key: string]: unknown;
  }>;
}

export interface BackupsListResponse {
  backups: Array<{
    id: string;
    filename: string;
    size_mb: number | string | null;
    created_at: string;
    created_by: string;
    status: string;
  }>;
}

export interface SystemMetricsResponse {
  metrics: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    active_connections: number;
    requests_per_minute: number;
    error_rate: number;
    avg_response_time: number;
  };
}

export interface SystemHealthResponse {
  services: Array<{
    name: string;
    status: string;
    uptime: string;
    lastCheck: string;
    responseTime?: number;
  }>;
  connections?: {
    database: boolean;
    cache: boolean;
  };
}

export interface BlacklistResponse {
  blacklist: Array<{
    id: string;
    ip_address: string;
    reason: string;
    blocked_by: string;
    created_at: string;
    expires_at?: string;
  }>;
}

export interface MessagesResponse {
  messages: Array<{
    id: string;
    title: string;
    content: string;
    severity: string;
    broadcast_to: string;
    target_role?: string;
    created_at: string;
  }>;
  total: number;
}

export interface SettingsResponse {
  settings: Array<{
    setting_key: string;
    value: string;
    data_type: string;
    description?: string;
    updated_at: string;
  }>;
}

export interface AppealsResponse {
  appeals: Array<{
    id: string;
    userId: string;
    message: string;
    status: string;
    submittedAt: string;
    resolvedAt?: string | null;
    resolvedBy?: string | null;
    resolutionMessage?: string | null;
    userEmail?: string | null;
    userPhone?: string | null;
    userName?: string | null;
    suspension?: {
      reason?: string | null;
      suspendedAt?: string | null;
    } | null;
    [key: string]: unknown;
  }>;
}

// -- Operations Admin --

export interface OpsDashboardResponse {
  stats?: Record<string, number>;
  cardBatches?: Array<Record<string, unknown>>;
  hospitals?: Array<Record<string, unknown>>;
  csrPrograms?: Array<Record<string, unknown>>;
  tickets?: Array<Record<string, unknown>>;
  doctorRatings?: Array<{
    doctorId: string;
    doctorName: string;
    averageRating: number;
    reviewCount: number;
  }>;
  recentDoctorReviews?: Array<{
    id: string;
    doctorName?: string;
    rating: number;
    reviewText?: string;
    reviewerName?: string;
    createdAt?: string;
  }>;
}

export interface CardBatchesResponse {
  batches: Array<{
    id: string;
    batch_number: string;
    card_type: string;
    quantity: number;
    status: string;
    created_at?: string;
    expiry_date?: string;
    [key: string]: unknown;
  }>;
  items?: Array<Record<string, unknown>>;
}

export interface HospitalsResponse {
  hospitals: Array<{
    id: string;
    hospital_name: string;
    hospital_type: string;
    contact_person: string;
    contact_email: string;
    contact_phone: string;
    address?: string;
    city: string;
    district: string;
    bed_capacity?: number;
    license_number?: string;
    status: string;
    created_at?: string;
    [key: string]: unknown;
  }>;
  items?: Array<Record<string, unknown>>;
}

export interface CsrProgramsResponse {
  programs: Array<{
    id: string;
    program_name: string;
    sponsor_name: string;
    program_type: string;
    budget: number;
    status: string;
    start_date?: string;
    end_date?: string;
    [key: string]: unknown;
  }>;
  items?: Array<Record<string, unknown>>;
}

export interface SupportTicketsResponse {
  tickets: Array<{
    id: string;
    ticket_number: string;
    user_name: string;
    user_phone: string;
    category: string;
    priority: string;
    subject: string;
    description: string;
    status: string;
    created_at?: string;
    [key: string]: unknown;
  }>;
  items?: Array<Record<string, unknown>>;
}

// -- Medical Admin --

export interface MedicalDashboardResponse {
  stats: Record<string, number>;
  recentVerifications: Array<Record<string, unknown>>;
  highRiskCases: Array<Record<string, unknown>>;
  recentConsultations: Array<Record<string, unknown>>;
}

export interface DoctorVerificationsResponse {
  verifications: Array<{
    id: string;
    doctor_name?: string;
    doctor_email?: string;
    specialty?: string;
    bmdc_reg_number?: string;
    experience_years?: number;
    hospital_affiliation?: string;
    status?: string;
    submitted_at?: string;
    [key: string]: unknown;
  }>;
  items?: Array<Record<string, unknown>>;
}

export interface HighRiskCasesResponse {
  cases: Array<{
    id: string;
    patient_email?: string;
    patient_phone?: string;
    risk_level?: string;
    risk_factors?: unknown;
    symptoms?: string;
    current_week?: number;
    status?: string;
    flagged_at?: string;
    assigned_doctor_id?: string;
    notes?: string;
    [key: string]: unknown;
  }>;
  items?: Array<Record<string, unknown>>;
}

export interface ConsultationReviewsResponse {
  reviews: Array<{
    id: string;
    doctor_email?: string;
    patient_email?: string;
    review_status?: string;
    quality_score?: number;
    completeness_score?: number;
    professionalism_score?: number;
    created_at?: string;
    [key: string]: unknown;
  }>;
  items?: Array<Record<string, unknown>>;
}

export interface EmergencyLogsResponse {
  logs: Array<{
    id: string;
    accessor_email?: string;
    patient_email?: string;
    access_type?: string;
    reason?: string;
    emergency_level?: string;
    accessed_at?: string;
    ip_address?: string;
    [key: string]: unknown;
  }>;
  items?: Array<Record<string, unknown>>;
}

// -- Shared Admin --

export interface AdminNotificationsResponse {
  notifications: Array<{
    id: string;
    notification_type: string;
    priority: string;
    title: string;
    message: string;
    action_required: boolean;
    related_entity_type?: string | null;
    related_entity_id?: string | null;
    is_read: number | boolean;
    created_at: string;
    sender_email?: string | null;
    [key: string]: unknown;
  }>;
}

export interface AdminActionsResponse {
  actions: Array<{
    id: string;
    admin_role?: string;
    action_type: string;
    action_category?: string;
    description: string;
    created_at: string;
    [key: string]: unknown;
  }>;
}

export interface AdminInteractionsResponse {
  interactions: Array<{
    id: string;
    target_user_id?: string;
    interaction_type: string;
    subject: string;
    status: string;
    created_at: string;
    [key: string]: unknown;
  }>;
}

export interface OverviewStatsResponse {
  stats: Record<string, number>;
}

// -- Common mutation responses --
export interface MutationSuccessResponse {
  success: true;
  message?: string;
}

export interface EntityCreatedResponse {
  success: true;
  [key: string]: unknown;
}
