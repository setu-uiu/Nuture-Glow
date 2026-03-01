import { apiFetch, apiFetchPhp } from './api';
import {
  Appointment,
  BloodRequest,
  CommunityPost,
  ConnectedDevice,
  Doctor,
  Donor,
  Hospital,
  JournalEntry,
  MealLog,
  MedicalReport,
  Medicine,
  Notification,
  VaccineRecord,
  VerificationDocument,
  DoctorVisit,
  DoctorReview,
  DeviceType
} from '../types';

const dispatchUpdate = () => window.dispatchEvent(new Event('db-update'));
const dispatchNotification = () => window.dispatchEvent(new Event('notification-updated'));
const dispatchNewNotification = () => window.dispatchEvent(new Event('new-notification'));

const getList = async <T>(path: string): Promise<T[]> => {
  const res = await apiFetch<{ data?: T[]; items?: T[] }>(path);
  return res?.data || res?.items || [];
};

const getMeta = async (keys: string[]) => {
  const query = encodeURIComponent(keys.join(','));
  const res = await apiFetch<{ meta: Record<string, string> }>(`/api/user/meta?keys=${query}`);
  return res?.meta || {};
};

export const db = {
  async getAppointments(_userId: string): Promise<Appointment[]> {
    return getList<Appointment>('/api/appointments');
  },

  async addAppointment(_userId: string, appointment: Omit<Appointment, 'id' | 'userId'>) {
    const res = await apiFetch<{ item: Appointment }>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment)
    });
    dispatchUpdate();
    dispatchNewNotification();
    return res.item;
  },

  async updateAppointmentStatus(_userId: string, appId: string, status: Appointment['status']) {
    const res = await apiFetch<{ item: Appointment }>(`/api/appointments/${appId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    dispatchUpdate();
    dispatchNotification();
    return res.item;
  },

  async deleteAppointment(_userId: string, appId: string) {
    await apiFetch(`/api/appointments/${appId}`, { method: 'DELETE' });
    dispatchUpdate();
  },

  async getVaccines(_userId: string): Promise<VaccineRecord[]> {
    return getList<VaccineRecord>('/api/vaccines');
  },

  /** Fetch the vaccine schedule catalog from the database (live data) */
  async getVaccineSchedule(): Promise<any[]> {
    return getList<any>('/api/vaccine-schedule');
  },

  async addVaccine(_userId: string, vaccine: Omit<VaccineRecord, 'id' | 'userId'>) {
    const res = await apiFetch<{ item: VaccineRecord }>('/api/vaccines', {
      method: 'POST',
      body: JSON.stringify(vaccine)
    });
    dispatchUpdate();
    return res.item;
  },

  async updateVaccineStatus(_userId: string, id: string, status: VaccineRecord['status']) {
    const res = await apiFetch<{ item: VaccineRecord }>(`/api/vaccines/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    dispatchUpdate();
    return res.item;
  },

  async getNutritionLogs(_userId: string): Promise<MealLog[]> {
    return getList<MealLog>('/api/nutrition');
  },

  async addNutritionLog(_userId: string, log: Omit<MealLog, 'id' | 'userId' | 'time'>) {
    const res = await apiFetch<{ item: MealLog }>('/api/nutrition', {
      method: 'POST',
      body: JSON.stringify(log)
    });
    dispatchUpdate();
    return res.item;
  },

  async getPosts(): Promise<CommunityPost[]> {
    return getList<CommunityPost>('/api/community/posts');
  },

  async addPost(userId: string, authorName: string, content: string, image?: string) {
    const res = await apiFetch<{ item: CommunityPost }>('/api/community/posts', {
      method: 'POST',
      body: JSON.stringify({ userId, authorName, content, image })
    });
    dispatchUpdate();
    return res.item;
  },

  async deletePost(postId: string) {
    await apiFetch(`/api/community/posts/${postId}`, { method: 'DELETE' });
    dispatchUpdate();
  },

  async toggleLike(userId: string, postId: string) {
    const res = await apiFetch<{ item: CommunityPost }>(`/api/community/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    dispatchUpdate();
    return res.item;
  },

  async addComment(userId: string, authorName: string, postId: string, content: string) {
    const res = await apiFetch<{ item: CommunityPost }>(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ userId, authorName, content })
    });
    dispatchUpdate();
    return res.item;
  },

  async deleteComment(postId: string, commentId: string) {
    const res = await apiFetch<{ item: CommunityPost }>(`/api/community/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE'
    });
    dispatchUpdate();
    return res.item;
  },

  async getJournalEntries(_userId: string): Promise<JournalEntry[]> {
    return getList<JournalEntry>('/api/journal');
  },

  async addJournalEntry(_userId: string, entry: Omit<JournalEntry, 'id' | 'userId' | 'date'>) {
    const res = await apiFetch<{ item: JournalEntry }>('/api/journal', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
    dispatchUpdate();
    return res.item;
  },

  async updateJournalEntry(
    _userId: string,
    entryId: string,
    updates: Partial<Omit<JournalEntry, 'id' | 'userId' | 'date'>>
  ) {
    const res = await apiFetch<{ item: JournalEntry }>(`/api/journal/${entryId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    dispatchUpdate();
    return res.item;
  },

  async deleteJournalEntry(_userId: string, entryId: string) {
    await apiFetch(`/api/journal/${entryId}`, { method: 'DELETE' });
    dispatchUpdate();
  },

  async getNotifications(): Promise<Notification[]> {
    const res = await apiFetchPhp<{ data?: Notification[]; items?: Notification[] }>('/api/notifications');
    return res.data || res.items || [];
  },

  async markAsRead(id: string) {
    await apiFetchPhp(`/api/notifications/${id}`, {
      method: 'PATCH'
    });
    dispatchNotification();
  },

  async markAllAsRead() {
    await apiFetchPhp('/api/notifications/mark-all', { method: 'POST' });
    dispatchNotification();
  },

  async clearNotifications() {
    dispatchNotification();
  },

  async getVerificationDocs(_userId: string): Promise<VerificationDocument[]> {
    return getList<VerificationDocument>('/api/profile/docs');
  },

  async updateVerificationDoc(_userId: string, type: VerificationDocument['type'], file: File) {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);

    const res = await apiFetch<{ item: VerificationDocument }>('/api/profile/docs', {
      method: 'PUT',
      body: formData
    });
    dispatchUpdate();
    return res.item;
  },

  async getHydration(_userId: string): Promise<number> {
    const meta = await getMeta(['hydration']);
    const value = Number(meta.hydration);
    return Number.isFinite(value) && value >= 0 ? value : 4;
  },

  async updateHydration(_userId: string, count: number) {
    await apiFetch('/api/user/meta', {
      method: 'PUT',
      body: JSON.stringify({ hydration: count })
    });
    dispatchUpdate();
  },

  async getPregnancyWeek(_userId: string): Promise<number> {
    const meta = await getMeta(['pregnancyWeek']);
    const value = Number(meta.pregnancyWeek);
    return Number.isFinite(value) && value > 0 ? value : 24;
  },

  async updatePregnancyWeek(_userId: string, week: number) {
    await apiFetch('/api/user/meta', {
      method: 'PUT',
      body: JSON.stringify({ pregnancyWeek: week })
    });
    dispatchUpdate();
  },

  /** Generic meta getter — pass array of keys, get back key→value map */
  async getUserMeta(_userId: string, keys: string[]): Promise<Record<string, string>> {
    return getMeta(keys);
  },

  /** Generic meta setter — pass object of key→value pairs */
  async setUserMeta(_userId: string, data: Record<string, string>) {
    await apiFetch('/api/user/meta', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    dispatchUpdate();
  },

  async getHealthHistory(_userId: string, key: string): Promise<{ date: string; value: string }[]> {
    const res = await apiFetch<{ items: { date: string; value: string }[] }>(
      `/api/health/history?metric=${encodeURIComponent(key)}`
    );
    return res.items || [];
  },

  async addHealthRecord(_userId: string, key: string, record: { date: string; value: string }) {
    const res = await apiFetch<{ item: { date: string; value: string } }>(
      '/api/health/history',
      {
        method: 'POST',
        body: JSON.stringify({ metric: key, date: record.date, value: record.value })
      }
    );
    dispatchUpdate();
    return res.item;
  },

  async getDoctors(): Promise<Doctor[]> {
    try {
      return getList<Doctor>('/api/catalog/doctors');
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      return [];
    }
  },

  async getDoctorReviews(_userId: string): Promise<DoctorReview[]> {
    return getList<DoctorReview>('/api/doctor-reviews');
  },

  async addDoctorReview(_userId: string, review: Omit<DoctorReview, 'id' | 'userId' | 'createdAt'>) {
    const res = await apiFetch<{ item: DoctorReview }>('/api/doctor-reviews', {
      method: 'POST',
      body: JSON.stringify(review)
    });
    dispatchUpdate();
    return res.item;
  },

  async getHospitals(): Promise<Hospital[]> {
    try {
      return getList<Hospital>('/api/catalog/hospitals');
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
      return [];
    }
  },

  async getMedicines(): Promise<Medicine[]> {
    try {
      return getList<Medicine>('/api/catalog/medicines');
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
      return [];
    }
  },

  // Blood Donor Management
  async getDonors(): Promise<Donor[]> {
    try {
      return getList<Donor>('/api/blood/donors');
    } catch (err) {
      console.error('Failed to fetch donors:', err);
      return [];
    }
  },

  async addDonor(donor: Omit<Donor, 'id'>): Promise<Donor> {
    const res = await apiFetch<{ item: Donor }>('/api/blood/donors', {
      method: 'POST',
      body: JSON.stringify(donor)
    });
    dispatchUpdate();
    dispatchNewNotification();
    return res.item;
  },

  // Blood Request Management (already exists but ensure it's complete)
  async getBloodRequests(): Promise<BloodRequest[]> {
    try {
      return getList<BloodRequest>('/api/blood/requests?scope=donor');
    } catch (err) {
      console.error('Failed to fetch blood requests:', err);
      return [];
    }
  },

  async addBloodRequest(request: Omit<BloodRequest, 'id'>): Promise<BloodRequest> {
    const res = await apiFetch<{ item: BloodRequest }>('/api/blood/requests', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    dispatchUpdate();
    return res.item;
  },

  async deleteBloodRequest(id: string): Promise<void> {
    await apiFetch(`/api/blood/requests/${id}`, { method: 'DELETE' });
    dispatchUpdate();
  },

  // Medical Report Management
  async getMedicalReport(_userId: string): Promise<MedicalReport> {
    try {
      const res = await apiFetch<{ item: MedicalReport | null }>('/api/profile/medical');
      return res.item || { bloodGroup: '', allergies: '', diabetesStatus: false, knownConditions: '' };
    } catch (err) {
      console.error('Failed to fetch medical report:', err);
      return { bloodGroup: '', allergies: '', diabetesStatus: false, knownConditions: '' };
    }
  },

  async saveMedicalReport(_userId: string, report: MedicalReport): Promise<MedicalReport> {
    const res = await apiFetch<{ item: MedicalReport }>('/api/profile/medical', {
      method: 'PUT',
      body: JSON.stringify(report)
    });
    dispatchUpdate();
    return res.item;
  },

  // Doctor Visit Records
  async getVisitHistory(_userId: string): Promise<DoctorVisit[]> {
    try {
      return getList<DoctorVisit>('/api/profile/visits');
    } catch (err) {
      console.error('Failed to fetch visit history:', err);
      return [];
    }
  },

  async addVisitRecord(_userId: string, visit: Omit<DoctorVisit, 'id' | 'userId'>): Promise<DoctorVisit> {
    const res = await apiFetch<{ item: DoctorVisit }>('/api/profile/visits', {
      method: 'POST',
      body: JSON.stringify(visit)
    });
    dispatchUpdate();
    return res.item;
  },

  async deleteVisitRecord(_userId: string, id: string): Promise<void> {
    await apiFetch(`/api/profile/visits/${id}`, { method: 'DELETE' });
    dispatchUpdate();
  },

  // Reset User Data
  async resetUserHealthData(_userId: string): Promise<void> {
    await apiFetch('/api/profile/reset', { method: 'POST' });
    dispatchUpdate();
    dispatchNotification();
  },
  async getHealthIdVerificationStatus(): Promise<{ health_id: string; status: string }> {
    const res = await apiFetch<{ success: boolean; data: { health_id: string; status: string } }>(
      '/api/health-id/verification-status'
    );
    return res.data;
  },

  async requestHealthIdVerification(requestNote?: string) {
    const res = await apiFetch<{ success: boolean; data: { request_id: number; status: string } }>(
      '/api/health-id/verification-request',
      {
        method: 'POST',
        body: JSON.stringify({
          request_note: requestNote || null
        })
      }
    );
    return res.data;
  },

  async getHospitalVerificationRequests(status?: string) {
    const qs = status ? `?status=${status}` : '';
    const res = await apiFetch<{ success: boolean; items: any[] }>(
      `/api/hospital/verification-requests${qs}`
    );
    return res.items || [];
  },

  async decideHospitalVerificationRequest(
    requestId: number | string,
    decision: 'accepted' | 'rejected',
    rejectionReason?: string
  ) {
    const res = await apiFetch<{ success: boolean; data: { status: string } }>(
      `/api/hospital/verification-requests/${requestId}/decision`,
      {
        method: 'POST',
        body: JSON.stringify({
          decision,
          rejection_reason: rejectionReason || null
        })
      }
    );
    return res.data;
  },

  async getUserProfile(userId: string) {
    try {
      const res = await apiFetch<any>(`/api/user/${userId}/profile`);
      return res || {};
    } catch (err) {
      return {};
    }
  },

  async updateUserProfile(userId: string, profile: any) {
    const res = await apiFetch<any>(`/api/user/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
    dispatchUpdate();
    return res;
  },

  // ===== Connected Devices =====
  async getDevices(): Promise<ConnectedDevice[]> {
    return getList<ConnectedDevice>('/api/devices');
  },

  async addDevice(name: string, type: DeviceType): Promise<ConnectedDevice | null> {
    const res = await apiFetch<ConnectedDevice>('/api/devices', {
      method: 'POST',
      body: JSON.stringify({ name, type })
    });
    dispatchUpdate();
    return res;
  },

  async removeDevice(deviceId: string): Promise<void> {
    await apiFetch(`/api/devices/${deviceId}`, { method: 'DELETE' });
    dispatchUpdate();
  },

  // ===== Connected Hospitals (from verification) =====
  async getConnectedHospitals(): Promise<Hospital[]> {
    return getList<Hospital>('/api/profile/connected-hospitals');
  },

  // Dashboard summary - single API call for all dashboard data
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await apiFetch<DashboardSummary>('/api/dashboard/summary');
    return res || {
      pregnancyWeek: 0,
      waterToday: 0,
      vaccineProgress: 0,
      vaccineCounts: { total: 0, completed: 0 },
      upcomingAppointments: 0,
      healthSummaryMetrics: []
    };
  }
};

// Dashboard summary type
export interface DashboardSummary {
  pregnancyWeek: number;
  waterToday: number;
  vaccineProgress: number;
  vaccineCounts: {
    total: number;
    completed: number;
  };
  upcomingAppointments: number;
  healthSummaryMetrics: Array<{
    type: string;
    value: string | number | null;
    date: string;
    unit: string;
  }>;
}

export type { MealLog };
