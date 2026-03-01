import { apiFetch } from './api';
import type { MeetingInfo } from '../types';

export class AppointmentService {
  static async createVideoMeeting(appointmentId: string): Promise<MeetingInfo> {
    return apiFetch<MeetingInfo>(`/api/appointments/${appointmentId}/meeting/create`, {
      method: 'POST',
      body: JSON.stringify({ appointment_id: appointmentId })
    });
  }

  static async getMeetingInfo(appointmentId: string): Promise<MeetingInfo> {
    return apiFetch<MeetingInfo>(`/api/appointments/${appointmentId}/meeting`);
  }

  static async cancelMeeting(appointmentId: string): Promise<MeetingInfo> {
    return apiFetch<MeetingInfo>(`/api/appointments/${appointmentId}/meeting/cancel`, {
      method: 'POST'
    });
  }

  static async endMeeting(appointmentId: string): Promise<MeetingInfo> {
    return apiFetch<MeetingInfo>(`/api/appointments/${appointmentId}/meeting/end`, {
      method: 'POST'
    });
  }

  static async getGoogleAuthUrl(): Promise<{ auth_url: string }> {
    return apiFetch<{ auth_url: string }>('/api/integrations/google/auth');
  }

  static async getGoogleStatus(): Promise<{ connected: boolean }> {
    return apiFetch<{ connected: boolean }>('/api/integrations/google/status');
  }
}
