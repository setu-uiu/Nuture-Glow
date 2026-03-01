import React, { useState } from 'react';
import { Calendar, Video, Phone, Users, Clock, AlertCircle } from 'lucide-react';
import type { Consultation } from '../../../types/dashboard';

interface PatientQueueProps {
  consultations: Consultation[];
  onConsultationStatusChange?: (consultationId: string, status: Consultation['status']) => Promise<void>;
}

const PatientQueue: React.FC<PatientQueueProps> = ({ consultations, onConsultationStatusChange }) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const pendingApprovals = consultations.filter(c => c.status === 'pending');
  const scheduledConsultations = consultations.filter(c => c.status === 'scheduled');
  const inProgressConsultations = consultations.filter(c => c.status === 'in-progress');

  const handleStatusUpdate = async (consultationId: string, status: Consultation['status']) => {
    if (!onConsultationStatusChange) return;
    try {
      setUpdatingId(consultationId);
      await onConsultationStatusChange(consultationId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={16} className="text-teal-600" />;
      case 'phone': return <Phone size={16} className="text-blue-600" />;
      default: return <Users size={16} className="text-purple-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-teal-50 border-teal-200/40 text-teal-700';
      case 'phone': return 'bg-blue-50 border-blue-200/40 text-blue-700';
      default: return 'bg-purple-50 border-purple-200/40 text-purple-700';
    }
  };

  const formatTime = (value?: string | null) => {
    if (!value) return '--';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '--';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gradient-to-b from-white/80 via-white/70 to-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Today's Patient Queue</h2>
        <span className="text-sm text-gray-600">
          {pendingApprovals.length} pending, {scheduledConsultations.length} scheduled, {inProgressConsultations.length} active
        </span>
      </div>

      {consultations.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No consultations scheduled for today</p>
          <p className="text-sm text-gray-400 mt-1">Your queue is empty</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map((consultation, index) => {
            const displayName = consultation.patientName || 'Unknown patient';
            const patientInitial = displayName ? displayName.charAt(0).toUpperCase() : '?';
            const ageValue =
              consultation.patientAge === null ||
              consultation.patientAge === undefined
                ? null
                : Number(consultation.patientAge);
            const gestationValue =
              consultation.gestationalWeek === null ||
              consultation.gestationalWeek === undefined
                ? null
                : Number(consultation.gestationalWeek);
            const durationValue =
              consultation.duration === null ||
              consultation.duration === undefined
                ? null
                : Number(consultation.duration);
            const ageLabel = Number.isFinite(ageValue) ? `${ageValue} years` : '--';
            const gestationLabel = Number.isFinite(gestationValue)
              ? `${gestationValue} weeks`
              : '--';
            const durationLabel = Number.isFinite(durationValue) ? `${durationValue} min` : '--';
            const typeLabel = consultation.type
              ? consultation.type.charAt(0).toUpperCase() + consultation.type.slice(1)
              : 'Unknown';
            const statusLabel = consultation.status ?? 'unknown';
            const isPending = consultation.status === 'pending';
            const isScheduled = consultation.status === 'scheduled';
            const isInProgress = consultation.status === 'in-progress';

            return (
              <div
                key={consultation.id}
                className={`relative p-4 rounded-xl border transition-all ${
                  isPending
                    ? 'bg-amber-50/70 border-amber-200/60'
                    : isInProgress
                    ? 'bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-300 shadow-md'
                    : consultation.status === 'completed'
                    ? 'bg-gray-50/50 border-gray-200/40 opacity-60'
                    : 'bg-white/80 border-gray-200/40 hover:shadow-md'
                }`}
              >
              {/* Queue Number */}
              <div className="absolute -left-3 -top-3 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                {index + 1}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Patient Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {patientInitial}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">{displayName}</p>
                      {consultation.consentGranted === false && (
                        <span title="Consent pending">
                          <AlertCircle size={14} className="text-amber-500" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{ageLabel}</span>
                      <span className="text-teal-600 font-medium">{gestationLabel}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {durationLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div className="text-right flex items-center gap-3">
                  {/* Consultation Type */}
                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${getTypeColor(consultation.type || 'unknown')}`}>
                    {getTypeIcon(consultation.type || 'unknown')}
                    {typeLabel}
                  </div>

                  {/* Time */}
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {formatTime(consultation.scheduledAt)}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                    isPending
                      ? 'bg-amber-100 text-amber-700'
                      : isScheduled
                      ? 'bg-blue-100 text-blue-700'
                      : isInProgress
                      ? 'bg-green-100 text-green-700 animate-pulse'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {isInProgress ? 'Active' : isPending ? 'Pending' : statusLabel}
                  </div>

                  {/* Action Button */}
                  {isPending && (
                    <button 
                      className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-all shadow-md hover:shadow-lg"
                      onClick={() => handleStatusUpdate(consultation.id, 'scheduled')}
                      disabled={updatingId === consultation.id}
                    >
                      {updatingId === consultation.id ? 'Approving...' : 'Approve'}
                    </button>
                  )}
                  {isScheduled && (
                    <button 
                      className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all shadow-md hover:shadow-lg"
                      onClick={() => handleStatusUpdate(consultation.id, 'in-progress')}
                      disabled={updatingId === consultation.id}
                    >
                      {updatingId === consultation.id ? 'Starting...' : 'Start'}
                    </button>
                  )}
                  {isInProgress && (
                    <button 
                      className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                      onClick={() => handleStatusUpdate(consultation.id, 'completed')}
                      disabled={updatingId === consultation.id}
                    >
                      {updatingId === consultation.id ? 'Completing...' : 'Complete'}
                    </button>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {consultation.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200/40">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Notes:</span> {consultation.notes}
                  </p>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientQueue;
