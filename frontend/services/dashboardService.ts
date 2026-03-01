// Dashboard Service Layer
// Centralized API calls for all role-based dashboards

import { apiFetch } from './api';
import type {
  // Doctor Dashboard
  DoctorDashboardData,
  Consultation,
  Prescription,
  DoctorSchedule,
  DoctorEarnings,
  PatientBasicInfo,
  
  // Ops Admin Dashboard
  OpsAdminDashboardData,
  Card,
  Hospital,
  CSRProgram,
  ServiceAnalytics,
  
  // System Admin Dashboard
  SystemAdminDashboardData,
  UserAccount,
  SystemHealthMetrics,
  SecurityEvent,
  AuditLogEntry,
  
  // Nutritionist Dashboard
  NutritionistDashboardData as NutritionistDashboardDataType,
  NutritionPlan as NutritionPlanType,
  PatientRef as PatientRefType,
  
  // Common
  DashboardApiResponse,
  PaginatedResponse
} from '../types/dashboard';
import type { Medicine } from '../types';

// ============================================================================
// DOCTOR DASHBOARD SERVICES
// ============================================================================

export class DoctorDashboardService {
  /**
   * Get complete doctor dashboard data
   */
  static async getDashboardData(): Promise<DoctorDashboardData> {
    return apiFetch<DoctorDashboardData>('/api/doctor/dashboard');
  }

  /**
   * Get doctor's consultations with filters
   */
  static async getConsultations(filters?: {
    status?: string;
    date?: string;
    page?: number;
  }): Promise<PaginatedResponse<Consultation>> {
    const params = new URLSearchParams(filters as any).toString();
    return apiFetch<PaginatedResponse<Consultation>>(`/api/doctor/consultations?${params}`);
  }

  /**
   * Get patient details (requires active consent)
   */
  static async getPatientDetails(patientId: string): Promise<PatientBasicInfo> {
    return apiFetch<PatientBasicInfo>(`/api/doctor/patients/${patientId}`);
  }

  /**
   * Get patient medical history (requires active consent)
   */
  static async getPatientMedicalHistory(patientId: string): Promise<any> {
    return apiFetch(`/api/doctor/patients/${patientId}/medical-history`);
  }

  /**
   * Create prescription for patient
   */
  static async createPrescription(
    consultationId: string,
    prescription: Omit<Prescription, 'id' | 'doctorId' | 'createdAt' | 'consultationId'>
  ): Promise<Prescription> {
    const response = await apiFetch<Prescription | { prescription: Prescription }>('/api/doctor/prescriptions', {
      method: 'POST',
      body: JSON.stringify({ consultationId, ...prescription })
    });
    return 'prescription' in response ? response.prescription : response;
  }

  /**
   * Update consultation status from queue/worklist actions
   */
  static async updateConsultationStatus(
    consultationId: string,
    status: Consultation['status'],
    notes?: string
  ): Promise<Consultation> {
    const response = await apiFetch<{ item?: Consultation }>(`/api/doctor/appointments/${consultationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
    if (!response?.item) {
      throw new Error('Failed to update consultation status');
    }
    return response.item;
  }

  /**
   * Update consultation notes
   */
  static async updateConsultationNotes(
    consultationId: string,
    notes: string
  ): Promise<Consultation> {
    return apiFetch<Consultation>(`/api/doctor/consultations/${consultationId}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes })
    });
  }

  /**
   * Complete consultation
   */
  static async completeConsultation(consultationId: string): Promise<Consultation> {
    return this.updateConsultationStatus(consultationId, 'completed');
  }

  /**
   * Get doctor's schedule
   */
  static async getSchedule(): Promise<DoctorSchedule[]> {
    return apiFetch<DoctorSchedule[]>('/api/doctor/schedule');
  }

  /**
   * Update doctor's schedule
   */
  static async updateSchedule(schedule: Partial<DoctorSchedule>[]): Promise<DoctorSchedule[]> {
    return apiFetch<DoctorSchedule[]>('/api/doctor/schedule', {
      method: 'PUT',
      body: JSON.stringify(schedule)
    });
  }

  /**
   * Get earnings data
   */
  static async getEarnings(period?: 'week' | 'month' | 'year'): Promise<DoctorEarnings> {
    return apiFetch<DoctorEarnings>(`/api/doctor/earnings?period=${period || 'month'}`);
  }
}

// ============================================================================
// PHARMACIST DASHBOARD SERVICES
// ============================================================================

export interface PharmacyDashboardData {
  profile: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    verificationStatus?: string;
    shopName?: string;
    license?: string;
    address?: string;
  };
  stats: {
    todayOrders: number;
    pendingOrders: number;
    processingOrders: number;
    totalRevenue: number;
    totalOrders: number;
  };
}

export interface PharmacyOrder {
  id: string;
  userId?: string;
  customerName?: string;
  customerPhone?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal?: number;
  deliveryFee?: number;
  total?: number;
  orderDate?: string;
  estimatedDelivery?: string;
  pharmacyNotes?: string;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
    image?: string;
  }>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
  isRead?: boolean;
  createdAt?: string;
}

export class PharmacistDashboardService {
  static async getDashboardData(): Promise<PharmacyDashboardData> {
    return apiFetch<PharmacyDashboardData>('/api/pharmacy/dashboard');
  }

  static async getCatalogProducts(): Promise<Medicine[]> {
    const response = await apiFetch<{ items: Medicine[] }>('/api/catalog/medicines');
    return response.items || [];
  }

  static async getOrders(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PharmacyOrder>> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    return apiFetch<PaginatedResponse<PharmacyOrder>>(`/api/pharmacy/orders?${params.toString()}`);
  }

  static async getOrderById(orderId: string): Promise<PharmacyOrder> {
    const response = await apiFetch<{ order: PharmacyOrder }>(`/api/pharmacy/orders/${orderId}`);
    return response.order;
  }

  static async updateOrderStatus(
    orderId: string,
    status: PharmacyOrder['status'],
    notes?: string
  ): Promise<PharmacyOrder> {
    const response = await apiFetch<{ order: PharmacyOrder }>(`/api/pharmacy/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
    return response.order;
  }

  static async submitVerification(payload: {
    pharmacyName: string;
    licenseNumber: string;
    address?: string;
    phone?: string;
    ownerName?: string;
    documents?: Array<{ name: string; url?: string }>;
  }): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>('/api/pharmacist/submit-verification', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static async getNotifications(): Promise<AppNotification[]> {
    const response = await apiFetch<{ data?: AppNotification[]; items?: AppNotification[] }>('/api/notifications');
    return response.data || response.items || [];
  }

  static async markNotificationRead(notificationId: string): Promise<void> {
    await apiFetch(`/api/notifications/${notificationId}`, { method: 'PATCH' });
  }

  static async markAllNotificationsRead(): Promise<void> {
    await apiFetch('/api/notifications/mark-all', { method: 'POST' });
  }
}

// ============================================================================
// MERCHANDISER DASHBOARD SERVICES
// ============================================================================

export interface MerchandiserProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  status: 'draft' | 'active' | 'inactive';
  image?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MerchandiserDashboardData {
  profile: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  stats: {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    inventoryValue: number;
  };
  recentProducts: MerchandiserProduct[];
}

export class MerchandiserDashboardService {
  static async getDashboardData(): Promise<MerchandiserDashboardData> {
    return apiFetch<MerchandiserDashboardData>('/api/merchandiser/dashboard');
  }

  static async getProducts(status = 'all'): Promise<MerchandiserProduct[]> {
    const params = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    const response = await apiFetch<{ items: MerchandiserProduct[] }>(`/api/merchandiser/products${params}`);
    return response.items || [];
  }

  static async createProduct(payload: {
    name: string;
    category: string;
    price: number;
    stockQuantity: number;
    lowStockThreshold?: number;
    status?: 'draft' | 'active' | 'inactive';
    image?: string;
    description?: string;
  }): Promise<MerchandiserProduct> {
    const response = await apiFetch<{ item: MerchandiserProduct }>('/api/merchandiser/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.item;
  }

  static async updateProduct(
    productId: string,
    payload: Partial<{
      name: string;
      category: string;
      price: number;
      stockQuantity: number;
      lowStockThreshold: number;
      status: 'draft' | 'active' | 'inactive';
      image: string;
      description: string;
    }>
  ): Promise<MerchandiserProduct> {
    const response = await apiFetch<{ item: MerchandiserProduct }>(`/api/merchandiser/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return response.item;
  }

  static async deleteProduct(productId: string): Promise<void> {
    await apiFetch(`/api/merchandiser/products/${productId}`, { method: 'DELETE' });
  }

  static async getNotifications(): Promise<AppNotification[]> {
    const response = await apiFetch<{ data?: AppNotification[]; items?: AppNotification[] }>('/api/notifications');
    return response.data || response.items || [];
  }

  static async markNotificationRead(notificationId: string): Promise<void> {
    await apiFetch(`/api/notifications/${notificationId}`, { method: 'PATCH' });
  }

  static async markAllNotificationsRead(): Promise<void> {
    await apiFetch('/api/notifications/mark-all', { method: 'POST' });
  }
}

// ============================================================================
// OPERATIONS ADMIN DASHBOARD SERVICES
// ============================================================================

export class OpsAdminDashboardService {
  /**
   * Get complete ops admin dashboard data
   */
  static async getDashboardData(): Promise<OpsAdminDashboardData> {
    return apiFetch<OpsAdminDashboardData>('/api/ops-admin/dashboard');
  }

  /**
   * Get all cards with filters
   */
  static async getCards(filters?: {
    status?: string;
    type?: string;
    page?: number;
  }): Promise<PaginatedResponse<Card>> {
    const params = new URLSearchParams(filters as any).toString();
    return apiFetch<PaginatedResponse<Card>>(`/api/ops-admin/cards?${params}`);
  }

  /**
   * Create new card
   */
  static async createCard(card: Omit<Card, 'id'>): Promise<Card> {
    return apiFetch<Card>('/api/ops-admin/cards', {
      method: 'POST',
      body: JSON.stringify(card)
    });
  }

  /**
   * Activate card
   */
  static async activateCard(cardId: string, motherId: string): Promise<Card> {
    return apiFetch<Card>(`/api/ops-admin/cards/${cardId}/activate`, {
      method: 'POST',
      body: JSON.stringify({ motherId })
    });
  }

  /**
   * Deactivate card
   */
  static async deactivateCard(cardId: string, reason: string): Promise<Card> {
    return apiFetch<Card>(`/api/ops-admin/cards/${cardId}/deactivate`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * Get all hospitals
   */
  static async getHospitals(filters?: {
    type?: string;
    status?: string;
  }): Promise<Hospital[]> {
    const params = new URLSearchParams(filters as any).toString();
    return apiFetch<Hospital[]>(`/api/ops-admin/hospitals?${params}`);
  }

  /**
   * Add new hospital
   */
  static async addHospital(hospital: Omit<Hospital, 'id' | 'onboardedAt'>): Promise<Hospital> {
    return apiFetch<Hospital>('/api/ops-admin/hospitals', {
      method: 'POST',
      body: JSON.stringify(hospital)
    });
  }

  /**
   * Update hospital
   */
  static async updateHospital(hospitalId: string, updates: Partial<Hospital>): Promise<Hospital> {
    return apiFetch<Hospital>(`/api/ops-admin/hospitals/${hospitalId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Get CSR programs
   */
  static async getCSRPrograms(status?: string): Promise<CSRProgram[]> {
    const params = status ? `?status=${status}` : '';
    return apiFetch<CSRProgram[]>(`/api/ops-admin/csr-programs${params}`);
  }

  /**
   * Create CSR program
   */
  static async createCSRProgram(program: Omit<CSRProgram, 'id' | 'allocated' | 'remaining' | 'beneficiaries'>): Promise<CSRProgram> {
    return apiFetch<CSRProgram>('/api/ops-admin/csr-programs', {
      method: 'POST',
      body: JSON.stringify(program)
    });
  }

  /**
   * Update CSR program
   */
  static async updateCSRProgram(programId: string, updates: Partial<CSRProgram>): Promise<CSRProgram> {
    return apiFetch<CSRProgram>(`/api/ops-admin/csr-programs/${programId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Get service analytics
   */
  static async getAnalytics(period?: 'week' | 'month' | 'year'): Promise<ServiceAnalytics> {
    return apiFetch<ServiceAnalytics>(`/api/ops-admin/analytics?period=${period || 'month'}`);
  }
}

// ============================================================================
// SYSTEM ADMIN DASHBOARD SERVICES
// ============================================================================

export class SystemAdminDashboardService {
  /**
   * Get complete system admin dashboard data
   */
  static async getDashboardData(): Promise<SystemAdminDashboardData> {
    return apiFetch<SystemAdminDashboardData>('/api/system-admin/dashboard');
  }

  /**
   * Get all user accounts
   */
  static async getUsers(filters?: {
    role?: string;
    status?: string;
    page?: number;
  }): Promise<PaginatedResponse<UserAccount>> {
    const params = new URLSearchParams(filters as any).toString();
    return apiFetch<PaginatedResponse<UserAccount>>(`/api/system-admin/users?${params}`);
  }

  /**
   * Update user role
   */
  static async updateUserRole(
    userId: string,
    role: string,
    reason: string
  ): Promise<UserAccount> {
    return apiFetch<UserAccount>(`/api/system-admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role, reason })
    });
  }

  /**
   * Suspend user account
   */
  static async suspendUser(userId: string, reason: string): Promise<UserAccount> {
    return apiFetch<UserAccount>(`/api/system-admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * Reactivate user account
   */
  static async reactivateUser(userId: string): Promise<UserAccount> {
    return apiFetch<UserAccount>(`/api/system-admin/users/${userId}/reactivate`, {
      method: 'POST'
    });
  }

  /**
   * Get system health metrics
   */
  static async getSystemHealth(): Promise<SystemHealthMetrics> {
    return apiFetch<SystemHealthMetrics>('/api/system-admin/system-health');
  }

  /**
   * Get security events
   */
  static async getSecurityEvents(filters?: {
    severity?: string;
    resolved?: boolean;
    page?: number;
  }): Promise<PaginatedResponse<SecurityEvent>> {
    const params = new URLSearchParams(filters as any).toString();
    return apiFetch<PaginatedResponse<SecurityEvent>>(`/api/system-admin/security-events?${params}`);
  }

  /**
   * Resolve security event
   */
  static async resolveSecurityEvent(
    eventId: string,
    actionTaken: string
  ): Promise<SecurityEvent> {
    return apiFetch<SecurityEvent>(`/api/system-admin/security-events/${eventId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ actionTaken })
    });
  }

  /**
   * Get audit logs (all roles)
   */
  static async getAuditLogs(filters?: {
    userId?: string;
    role?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
  }): Promise<PaginatedResponse<AuditLogEntry>> {
    const params = new URLSearchParams(filters as any).toString();
    return apiFetch<PaginatedResponse<AuditLogEntry>>(`/api/system-admin/audit-logs?${params}`);
  }

  /**
   * Export audit logs
   */
  static async exportAuditLogs(filters?: {
    dateFrom?: string;
    dateTo?: string;
    format?: 'csv' | 'json';
  }): Promise<Blob> {
    const params = new URLSearchParams(filters as any).toString();
    const response = await fetch(`/api/system-admin/audit-logs/export?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.blob();
  }

  /**
   * Trigger manual backup
   */
  static async triggerBackup(): Promise<DashboardApiResponse<{ backupId: string }>> {
    return apiFetch('/api/system-admin/backup', {
      method: 'POST'
    });
  }
}

// ============================================================================
// NUTRITIONIST DASHBOARD SERVICES
// ============================================================================

export interface NutritionistDashboardData {
  profile: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    specialization?: string;
    certifications?: string[];
  };
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
  recentConsultations?: Array<{
    id: string;
    patientName: string;
    topic?: string;
    date: string;
  }>;
  upcomingFollowUps?: Array<{
    id: string;
    patientName: string;
    reason?: string;
    date: string;
  }>;
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

export class NutritionistDashboardService {
  static async getDashboardData(): Promise<NutritionistDashboardData> {
    return apiFetch<NutritionistDashboardData>('/api/nutritionist/dashboard');
  }

  static async getPatients(
    filter: 'all' | 'active' | 'completed' = 'all'
  ): Promise<PatientRef[]> {
    const params = filter && filter !== 'all' ? `?status=${encodeURIComponent(filter)}` : '';
    const response = await apiFetch<{ items: PatientRef[] }>(`/api/nutritionist/patients${params}`);
    return response.items || [];
  }

  static async getNutritionPlans(
    filter: 'all' | 'draft' | 'active' | 'completed' = 'all'
  ): Promise<NutritionPlan[]> {
    const params = filter && filter !== 'all' ? `?status=${encodeURIComponent(filter)}` : '';
    const response = await apiFetch<{ items: NutritionPlan[] }>(`/api/nutritionist/plans${params}`);
    return response.items || [];
  }

  static async createNutritionPlan(payload: {
    patientId: string;
    title: string;
    description?: string;
    goals?: string;
    dietaryRestrictions?: string;
    status?: 'draft' | 'active' | 'completed';
    recommendations?: string;
  }): Promise<NutritionPlan> {
    const response = await apiFetch<{ item: NutritionPlan }>('/api/nutritionist/plans', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.item;
  }

  static async updateNutritionPlan(
    planId: string,
    payload: Partial<{
      status: 'draft' | 'active' | 'completed';
      goals?: string;
      recommendations?: string;
      title?: string;
      description?: string;
      dietaryRestrictions?: string;
    }>
  ): Promise<NutritionPlan> {
    const response = await apiFetch<{ item: NutritionPlan }>(`/api/nutritionist/plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return response.item;
  }

  static async deleteNutritionPlan(planId: string): Promise<void> {
    await apiFetch(`/api/nutritionist/plans/${planId}`, { method: 'DELETE' });
  }

  static async getNotifications(): Promise<AppNotification[]> {
    const response = await apiFetch<{ data?: AppNotification[]; items?: AppNotification[] }>('/api/notifications');
    return response.data || response.items || [];
  }

  static async markNotificationRead(notificationId: string): Promise<void> {
    await apiFetch(`/api/notifications/${notificationId}`, { method: 'PATCH' });
  }

  static async markAllNotificationsRead(): Promise<void> {
    await apiFetch('/api/notifications/mark-all', { method: 'POST' });
  }
}
