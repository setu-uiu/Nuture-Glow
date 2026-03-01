import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  PhoneCall,
  Shield,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wifi
} from 'lucide-react';
import type { Consultation } from '../../../types/dashboard';

interface TelemedicineHubProps {
  todayConsultations: Consultation[];
  upcomingConsultations: Consultation[];
}

const TelemedicineHub: React.FC<TelemedicineHubProps> = ({ todayConsultations, upcomingConsultations }) => {
  const navigate = useNavigate();

  const waitingRoom = useMemo(() => {
    return [...todayConsultations, ...upcomingConsultations]
      .filter((c) => c.type === 'video' || (c.type as string) === 'Online')
      .filter((c) => c.status === 'scheduled' || c.status === 'in-progress' || (c.status as string) === 'Pending' || (c.status as string) === 'Confirmed')
      .sort((a, b) => {
        const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
        const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
        return aTime - bTime;
      });
  }, [todayConsultations, upcomingConsultations]);

  const nextCall = waitingRoom[0];

  const formatTime = (timestamp?: string | null) => {
    if (!timestamp) return '--';
    const date = new Date(timestamp);
    if (!Number.isFinite(date.getTime())) return '--';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const minutesUntil = (timestamp?: string | null) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    if (!Number.isFinite(date.getTime())) return null;
    const diff = Math.max(0, date.getTime() - Date.now());
    return Math.round(diff / 60000);
  };

  const joinVideoCall = (appointmentId: string) => {
    navigate(`/appointments/${appointmentId}/video`);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10 hero-bokeh"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Video size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/70">Telemedicine Suite</p>
                <h2 className="text-2xl md:text-3xl font-bold">Virtual Care Command</h2>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed max-w-xl">
              Launch secure browser-to-browser video consults with your patients. No third-party
              platforms needed — calls happen directly through WebRTC peer-to-peer.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs">
              <Wifi size={14} />
              <span>WebRTC P2P — End-to-end encrypted</span>
            </div>
          </div>
          <div className="bg-white/15 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-widest text-white/70">Next Call</p>
            {nextCall ? (
              <div className="mt-3 space-y-2">
                <p className="text-lg font-bold">{nextCall.patientName || 'Unknown patient'}</p>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Clock size={14} />
                  {formatTime(nextCall.scheduledAt)} | {minutesUntil(nextCall.scheduledAt) ?? '--'} min
                </div>
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <Users size={14} />
                  {nextCall.gestationalWeek === null ||
                  nextCall.gestationalWeek === undefined
                    ? '--'
                    : Number.isFinite(Number(nextCall.gestationalWeek))
                    ? `${nextCall.gestationalWeek} weeks`
                    : '--'}{' '}
                  |{' '}
                  {nextCall.patientAge === null ||
                  nextCall.patientAge === undefined
                    ? '--'
                    : Number.isFinite(Number(nextCall.patientAge))
                    ? `${nextCall.patientAge} yrs`
                    : '--'}
                </div>
                <button
                  onClick={() => joinVideoCall(nextCall.id)}
                  className="mt-3 w-full py-2 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                >
                  <PhoneCall size={16} />
                  Join Video Room
                </button>
              </div>
            ) : (
              <p className="text-sm text-white/70 mt-3">No video calls queued. You are clear for now.</p>
            )}
          </div>
        </div>
      </div>

      {/* Info + Waiting Room */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* How It Works */}
          <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-emerald-100/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Video size={18} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">How Video Calls Work</h3>
                <p className="text-sm text-gray-600">Simple, secure, browser-to-browser calls.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-sm font-bold mb-2">1</div>
                <p className="text-sm font-semibold text-gray-900">Create Session</p>
                <p className="text-xs text-gray-500 mt-1">Open a scheduled appointment and click "Create Session" to set up the video room.</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-sm font-bold mb-2">2</div>
                <p className="text-sm font-semibold text-gray-900">Patient Joins</p>
                <p className="text-xs text-gray-500 mt-1">The patient clicks "Join Session" from their appointment page. Both cameras activate.</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center text-sm font-bold mb-2">3</div>
                <p className="text-sm font-semibold text-gray-900">Consult & End</p>
                <p className="text-xs text-gray-500 mt-1">Conduct your consultation. When done, click "End Call". Session metadata is saved automatically.</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: Shield, label: 'Encrypted', detail: 'WebRTC DTLS-SRTP encryption' },
                { icon: Wifi, label: 'Peer-to-Peer', detail: 'Direct browser connection' },
                { icon: PhoneCall, label: 'Audio & Video', detail: 'Toggle mic/camera anytime' },
                { icon: Clock, label: 'Session Tracking', detail: 'Duration & metadata saved' }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Waiting Room */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/40 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Virtual Waiting Room</h3>
              <span className="text-xs font-semibold uppercase tracking-widest text-teal-600">
                {waitingRoom.length} queued
              </span>
            </div>

            {waitingRoom.length === 0 ? (
              <div className="text-center py-8">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No one is waiting right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {waitingRoom.slice(0, 4).map((consultation) => {
                  const displayName = consultation.patientName || 'Unknown patient';
                  const weekValue =
                    consultation.gestationalWeek === null ||
                    consultation.gestationalWeek === undefined
                      ? null
                      : Number(consultation.gestationalWeek);
                  const weekLabel = Number.isFinite(weekValue) ? `${weekValue} weeks` : '--';
                  const statusLabel =
                    consultation.status === 'in-progress'
                      ? 'Live'
                      : consultation.status === 'scheduled' || (consultation.status as string) === 'Confirmed'
                      ? 'Scheduled'
                      : (consultation.status as string) === 'Pending'
                      ? 'Pending'
                      : 'Unknown';
                  const consentLabel =
                    consultation.consentGranted === true
                      ? 'Consent Active'
                      : consultation.consentGranted === false
                      ? 'Consent Pending'
                      : 'Consent Unknown';

                  return (
                    <div
                      key={consultation.id}
                      className="p-3 rounded-xl border border-gray-200/60 bg-white/90 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{displayName}</p>
                          <p className="text-xs text-gray-500">
                            {weekLabel} | {formatTime(consultation.scheduledAt)}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            consultation.status === 'in-progress'
                              ? 'bg-emerald-100 text-emerald-700'
                              : consultation.status === 'scheduled' || (consultation.status as string) === 'Confirmed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {consultation.consentGranted === true ? (
                            <CheckCircle size={14} className="text-emerald-600" />
                          ) : consultation.consentGranted === false ? (
                            <AlertTriangle size={14} className="text-amber-500" />
                          ) : (
                            <AlertTriangle size={14} className="text-gray-400" />
                          )}
                          {consentLabel}
                        </div>
                        <button
                          onClick={() => joinVideoCall(consultation.id)}
                          className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                        >
                          <PhoneCall size={12} />
                          Join
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-emerald-50 via-white to-white rounded-3xl border border-emerald-100/70 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Session Privacy</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">No recordings stored</p>
                <p className="text-xs text-gray-500">Video calls are peer-to-peer. Only session metadata (time, duration) is saved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemedicineHub;
