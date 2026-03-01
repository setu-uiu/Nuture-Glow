import React, { useEffect, useState } from 'react';
import {
  Bell,
  AlertTriangle,
  UserPlus,
  ClipboardCheck,
  ShieldCheck,
  CalendarCheck,
  Send,
  HeartPulse
} from 'lucide-react';
import type { Consultation, PatientBasicInfo } from '../../../types/dashboard';
import PrescriptionWriter from './PrescriptionWriter';

interface PatientManagementProps {
  patients: PatientBasicInfo[];
  consultations: Consultation[];
}

const PatientManagement: React.FC<PatientManagementProps> = ({ patients, consultations }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [message, setMessage] = useState('');
  const [rxConsultationId, setRxConsultationId] = useState<string | null>(null);
  const hasPatients = patients.length > 0;

  useEffect(() => {
    if (!selectedPatientId && patients[0]?.id) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const consentSummary = buildConsentSummary(patients);

  const recentConsultations = consultations.slice(0, 4);
  const selectedConsultation = consultations.find((consultation) => consultation.id === rxConsultationId);
  const canWritePrescription = Boolean(selectedConsultation?.patientId);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Patient Messaging */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Patient Portal</h3>
              <p className="text-sm text-gray-600">Secure messaging and follow-up coordination.</p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Not configured
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200/60 bg-white text-sm text-gray-600">
            No portal messages available yet. Connect messaging to see patient conversations here.
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-200/60">
            <label className="text-xs uppercase tracking-widest text-gray-500">Send Message</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              placeholder="Type a secure message..."
              className="mt-3 w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex items-center justify-between mt-3">
              <select
                value={selectedPatientId}
                onChange={(event) => setSelectedPatientId(event.target.value)}
                disabled={!hasPatients}
                className="text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                {hasPatients ? (
                  patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name || 'Unknown patient'}
                    </option>
                  ))
                ) : (
                  <option value="">No patients available</option>
                )}
              </select>
              <button
                onClick={handleSendMessage}
                disabled={!hasPatients || !message.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Consent + Alerts */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-50 via-white to-white rounded-3xl border border-emerald-100/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-emerald-600" />
              <h3 className="text-lg font-bold text-gray-900">Consent Overview</h3>
            </div>
            <div className="space-y-3">
              {consentSummary.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className={`font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all">
              Manage Consents
            </button>
          </div>

          <div className="bg-gradient-to-br from-rose-50 via-white to-white rounded-3xl border border-rose-100/70 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-rose-600" />
              <h3 className="text-lg font-bold text-gray-900">Emergency Alerts</h3>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-rose-100 text-sm text-gray-600">
              No emergency alerts reported yet.
            </div>
          </div>
        </div>
      </div>

      {/* Follow-ups + Referrals + Rx */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CalendarCheck className="text-emerald-600" />
            <h3 className="text-lg font-bold text-gray-900">Follow-up Reminders</h3>
          </div>
          <div className="p-4 rounded-2xl border border-gray-200/60 bg-white text-sm text-gray-600">
            No follow-up reminders scheduled yet.
          </div>
        </div>

        <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <UserPlus className="text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Referral System</h3>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Patient name"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm">
              <option>Specialist type</option>
              <option>Maternal-fetal medicine</option>
              <option>Endocrinology</option>
              <option>Nutrition</option>
              <option>Cardiology</option>
            </select>
            <textarea
              rows={3}
              placeholder="Reason for referral"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all">
              Send Referral
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardCheck className="text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Prescription Center</h3>
          </div>
          <div className="space-y-3">
            {recentConsultations.length === 0 ? (
              <p className="text-sm text-gray-500">No consultations ready for prescriptions.</p>
            ) : (
              recentConsultations.map((consultation) => (
                <div key={consultation.id} className="p-3 rounded-xl border border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{consultation.patientName || 'Unknown patient'}</p>
                      <p className="text-xs text-gray-500">
                        {(consultation.gestationalWeek === null ||
                        consultation.gestationalWeek === undefined)
                          ? '--'
                          : Number.isFinite(Number(consultation.gestationalWeek))
                          ? `${consultation.gestationalWeek} weeks`
                          : '--'}{' '}
                        | {consultation.status || 'unknown'}
                      </p>
                    </div>
                    <button
                      onClick={() => setRxConsultationId(consultation.id)}
                      disabled={!consultation.patientId}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      Write Rx
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="mt-4 w-full py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all">
            View Prescription History
          </button>
        </div>
      </div>

      {/* Care Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-50 via-white to-white rounded-3xl border border-emerald-100/60 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <HeartPulse className="text-emerald-600" />
            <h3 className="text-lg font-bold text-gray-900">High-Risk Monitoring</h3>
          </div>
          {patients.length === 0 ? (
            <div className="p-4 rounded-2xl border border-emerald-100 bg-white text-sm text-gray-600">
              No patient risk data available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patients.slice(0, 4).map((patient) => {
                const riskLevel = patient.riskLevel || 'unknown';
                const gestationValue =
                  patient.gestationalWeek === null ||
                  patient.gestationalWeek === undefined
                    ? null
                    : Number(patient.gestationalWeek);
                const ageValue =
                  patient.age === null ||
                  patient.age === undefined
                    ? null
                    : Number(patient.age);
                const gestationLabel = Number.isFinite(gestationValue) ? `${gestationValue} weeks` : '--';
                const ageLabel = Number.isFinite(ageValue) ? `${ageValue} yrs` : '--';
                return (
                  <div key={patient.id} className="p-4 rounded-2xl border border-emerald-100 bg-white">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{patient.name || 'Unknown patient'}</p>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          riskLevel === 'high'
                            ? 'bg-rose-100 text-rose-700'
                            : riskLevel === 'moderate'
                            ? 'bg-amber-100 text-amber-700'
                            : riskLevel === 'low'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {riskLevel}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {gestationLabel} | {ageLabel}
                    </p>
                    <button className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                      Review Care Plan
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-amber-600" />
            <h3 className="text-lg font-bold text-gray-900">Care Protocols</h3>
          </div>
          <div className="p-4 rounded-2xl border border-gray-200 bg-white text-sm text-gray-600">
            No care protocols configured yet.
          </div>
        </div>
      </div>

      {selectedConsultation && canWritePrescription && (
        <PrescriptionWriter
          consultationId={selectedConsultation.id}
          patientId={selectedConsultation.patientId}
          patientName={selectedConsultation.patientName || 'Unknown patient'}
          onClose={() => setRxConsultationId(null)}
          onSave={() => setRxConsultationId(null)}
        />
      )}
    </div>
  );
};

const buildConsentSummary = (patients: PatientBasicInfo[]) => {
  const active = patients.filter((patient) => patient.consentStatus === 'active').length;
  const pending = patients.filter((patient) => patient.consentStatus === 'pending').length;
  const expired = patients.filter((patient) => patient.consentStatus === 'expired').length;
  const revoked = patients.filter((patient) => patient.consentStatus === 'revoked').length;

  return [
    { label: 'Active', value: active, color: 'text-emerald-600' },
    { label: 'Pending', value: pending, color: 'text-amber-600' },
    { label: 'Expired', value: expired, color: 'text-gray-500' },
    { label: 'Revoked', value: revoked, color: 'text-rose-600' }
  ];
};

export default PatientManagement;
