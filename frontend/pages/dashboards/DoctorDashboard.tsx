import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle,
  ClipboardList,
  DollarSign,
  Edit3,
  FileText,
  Save,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  X
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import { DoctorDashboardService } from '../../services/dashboardService';
import type { Consultation, DoctorDashboardData } from '../../types/dashboard';

import ConsultationList from '../../components/dashboards/doctor/ConsultationList';
import PatientQueue from '../../components/dashboards/doctor/PatientQueue';
import ScheduleManager from '../../components/dashboards/doctor/ScheduleManager';
import EarningsOverview from '../../components/dashboards/doctor/EarningsOverview';
import TelemedicineHub from '../../components/dashboards/doctor/TelemedicineHub';
import PatientManagement from '../../components/dashboards/doctor/PatientManagement';
import ClinicalTools from '../../components/dashboards/doctor/ClinicalTools';
import PracticeManagement from '../../components/dashboards/doctor/PracticeManagement';
import AnalyticsReporting from '../../components/dashboards/doctor/AnalyticsReporting';
import ComplianceCenter from '../../components/dashboards/doctor/ComplianceCenter';
import MobileFeatures from '../../components/dashboards/doctor/MobileFeatures';

type DoctorTab =
  | 'overview'
  | 'consultations'
  | 'schedule'
  | 'earnings'
  | 'telemedicine'
  | 'patients'
  | 'clinical'
  | 'practice'
  | 'analytics'
  | 'compliance'
  | 'mobile';

const DoctorDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<DoctorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DoctorTab>('overview');
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

  // Fee editing state
  const [editingFee, setEditingFee] = useState(false);
  const [feeValue, setFeeValue] = useState('');
  const [savingFee, setSavingFee] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);
  const [feeSuccess, setFeeSuccess] = useState(false);

  const handleSaveFee = async () => {
    const num = Number(feeValue);
    if (!Number.isFinite(num) || num < 0) {
      setFeeError('Please enter a valid non-negative amount');
      return;
    }
    setSavingFee(true);
    setFeeError(null);
    setFeeSuccess(false);
    try {
      await apiFetch('/api/doctor/fee', { method: 'PUT', body: JSON.stringify({ fee: num }), headers: { 'Content-Type': 'application/json' } });
      // Update local dashboard data
      setDashboardData((prev) => prev ? { ...prev, profile: { ...prev.profile, consultationFee: num } } : prev);
      setEditingFee(false);
      setFeeSuccess(true);
      setTimeout(() => setFeeSuccess(false), 3000);
    } catch (err: any) {
      setFeeError(err?.message || 'Failed to update fee');
    } finally {
      setSavingFee(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (!tabParam) return;
    const validTabs: DoctorTab[] = [
      'overview',
      'consultations',
      'schedule',
      'earnings',
      'telemedicine',
      'patients',
      'clinical',
      'practice',
      'analytics',
      'compliance',
      'mobile'
    ];
    if (validTabs.includes(tabParam as DoctorTab) && tabParam !== activeTab) {
      setActiveTab(tabParam as DoctorTab);
    }
  }, [location.search, activeTab]);

  const setTab = (tab: DoctorTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate({ pathname: '/dashboard', search: params.toString() }, { replace: true });
  };

  const loadDashboardData = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const data = await DoctorDashboardService.getDashboardData();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const handleConsultationStatusChange = async (
    consultationId: string,
    status: Consultation['status']
  ) => {
    try {
      setStatusUpdateError(null);
      await DoctorDashboardService.updateConsultationStatus(consultationId, status);
      await loadDashboardData(false);
    } catch (err) {
      console.error('Failed to update consultation status:', err);
      setStatusUpdateError('Unable to update consultation status right now.');
    }
  };

  const tabLabels: Record<DoctorTab, string> = {
    overview: 'Overview',
    consultations: 'Consultations',
    schedule: 'Schedule',
    earnings: 'Earnings',
    telemedicine: 'Telemedicine',
    patients: 'Patient Care',
    clinical: 'Clinical Tools',
    practice: 'Practice',
    analytics: 'Analytics',
    compliance: 'Compliance',
    mobile: 'Mobile'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f6f1] via-[#fafbf7] to-white flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading doctor workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f6f1] via-[#fafbf7] to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{error || 'No data available'}</p>
          <button
            onClick={() => loadDashboardData()}
            className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    profile,
    todayConsultations,
    upcomingConsultations,
    recentPatients,
    earnings
  } = dashboardData;

  const displayName = profile.name || profile.email || '';
  const headlineName = displayName ? `Dr. ${displayName}` : 'Doctor';
  const displaySpecialization = profile.specialization || 'Specialization not set';
  const rawRating = profile.rating;
  const ratingValue =
    rawRating === null || rawRating === undefined ? null : Number(rawRating);
  const displayRating =
    ratingValue !== null && Number.isFinite(ratingValue) ? ratingValue.toFixed(1) : '--';
  const formatCurrency = (value?: number | string | null) => {
    if (value === null || value === undefined || value === '') return '--';
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `BDT ${numeric.toLocaleString()}` : '--';
  };
  const formatDate = (value?: string | null) => {
    if (!value) return '--';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '--';
    return date.toLocaleDateString();
  };
  const formatTime = (value?: string | null) => {
    if (!value) return '--';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '--';
    return date.toLocaleTimeString();
  };

  const todayCount = todayConsultations.length;
  const completedToday = todayConsultations.filter((c) => c.status === 'completed').length;
  const pendingCount = todayConsultations.filter((c) => c.status === 'pending').length;
  const pendingRx = todayConsultations.filter((c) => c.status === 'completed' && !c.prescriptionId).length;

  const allConsultations = [...todayConsultations, ...upcomingConsultations];

  const quickLaunch = [
    {
      id: 'telemedicine',
      label: 'Start Video Room',
      desc: 'Launch the virtual waiting room now.',
      accent: 'from-emerald-500 to-teal-500',
      text: 'text-white'
    },
    {
      id: 'patients',
      label: 'Send Follow-up',
      desc: 'Automate reminders for patients.',
      accent: 'from-blue-500 to-blue-600',
      text: 'text-white'
    },
    {
      id: 'clinical',
      label: 'Use Clinical Tools',
      desc: 'Calculate BMI, due date, and checks.',
      accent: 'from-amber-400 to-amber-500',
      text: 'text-white'
    },
    {
      id: 'analytics',
      label: 'Review Analytics',
      desc: 'Track outcomes and revenue.',
      accent: 'from-purple-500 to-purple-600',
      text: 'text-white'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6f1] via-[#fafbf7] to-white">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white">
        <div className="absolute inset-0 opacity-15 hero-bokeh animate-hero-bg"></div>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 relative z-10 animate-hero-content">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={displayName || 'Doctor profile'}
                  loading="lazy"
                  className="w-16 h-16 rounded-2xl border-4 border-white/30 object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                  <Stethoscope size={28} />
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Doctor Workspace</p>
                <h1 className="text-2xl md:text-3xl font-bold">{headlineName}</h1>
                <p className="text-sm text-white/90 mt-1">{displaySpecialization}</p>
                <div className="flex items-center gap-2 mt-2">
                  {profile.verified && (
                    <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={12} />
                      Verified
                    </span>
                  )}
                  <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                    BMDC: {profile.bmdcNumber || '--'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setTab('telemedicine')}
                className={`px-5 py-2.5 rounded-2xl font-semibold shadow-lg transition-all ${
                  activeTab === 'telemedicine'
                    ? 'bg-white text-emerald-600'
                    : 'bg-white/15 text-white border border-white/30 hover:bg-white/25'
                }`}
              >
                Start Video
              </button>
              <button
                onClick={() => setTab('patients')}
                className={`px-5 py-2.5 rounded-2xl font-semibold transition-all ${
                  activeTab === 'patients'
                    ? 'bg-white text-emerald-600'
                    : 'bg-white/15 text-white border border-white/30 hover:bg-white/25'
                }`}
              >
                Patient Portal
              </button>
              <button
                onClick={() => setTab('clinical')}
                className={`px-5 py-2.5 rounded-2xl font-semibold transition-all ${
                  activeTab === 'clinical'
                    ? 'bg-white text-emerald-600'
                    : 'bg-white/15 text-white border border-white/30 hover:bg-white/25'
                }`}
              >
                Clinical Tools
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {[
              { label: "Today's Consultations", value: todayCount },
              { label: 'Pending Prescriptions', value: pendingRx },
              { label: 'This Month', value: formatCurrency(earnings.thisMonth) },
              { label: 'Average Rating', value: displayRating }
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20 text-center hover:bg-white/20 transition-all"
              >
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[11px] text-white/80 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 animate-hero-content">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500">Active Module</p>
              <h2 className="text-2xl font-bold text-gray-900">{tabLabels[activeTab]}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/80 border border-emerald-100/60 px-3 py-2 rounded-2xl shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">Doctor Workspace</span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-hero-content">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 backdrop-blur-sm rounded-2xl p-4 border border-emerald-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-700 font-medium uppercase mb-1">Today</p>
                    <p className="text-3xl font-bold text-emerald-900">{todayCount}</p>
                    <p className="text-xs text-emerald-600 mt-1">{completedToday} completed</p>
                  </div>
                  <Calendar className="w-10 h-10 text-emerald-600 opacity-70" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100/60 backdrop-blur-sm rounded-2xl p-4 border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-700 font-medium uppercase mb-1">Pending approvals</p>
                    <p className="text-3xl font-bold text-blue-900">{pendingCount}</p>
                    <p className="text-xs text-blue-600 mt-1">awaiting approval</p>
                  </div>
                  <ClipboardList className="w-10 h-10 text-blue-600 opacity-70" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-700 font-medium uppercase mb-1">Pending Rx</p>
                    <p className="text-3xl font-bold text-amber-900">{pendingRx}</p>
                    <p className="text-xs text-amber-600 mt-1">ready to issue</p>
                  </div>
                  <FileText className="w-10 h-10 text-amber-600 opacity-70" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/60 backdrop-blur-sm rounded-2xl p-4 border border-purple-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-purple-700 font-medium uppercase mb-1">Rating</p>
                    <p className="text-3xl font-bold text-purple-900">{displayRating}</p>
                    <p className="text-xs text-purple-600 mt-1">{profile.totalConsultations} reviews</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-600 opacity-70" />
                </div>
              </div>
            </div>

            {/* Consultation Fee */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50/60 backdrop-blur-sm rounded-2xl p-5 border border-teal-200/50 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Consultation Fee</h3>
                    <p className="text-xs text-gray-500">Set the fee patients pay per session</p>
                  </div>
                </div>
                {!editingFee ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-teal-700">{formatCurrency(profile.consultationFee)}</span>
                    <button
                      onClick={() => { setFeeValue(String(profile.consultationFee ?? '')); setEditingFee(true); setFeeError(null); }}
                      className="p-2 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                      title="Edit fee"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">BDT</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={feeValue}
                      onChange={(e) => setFeeValue(e.target.value)}
                      className="w-32 px-3 py-2 border border-teal-300 rounded-lg text-right font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveFee(); if (e.key === 'Escape') setEditingFee(false); }}
                    />
                    <button
                      onClick={handleSaveFee}
                      disabled={savingFee}
                      className="p-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50 transition-colors"
                      title="Save"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={() => { setEditingFee(false); setFeeError(null); }}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
              {feeError && <p className="text-sm text-red-600 mt-2">{feeError}</p>}
              {feeSuccess && <p className="text-sm text-emerald-600 mt-2">Fee updated successfully!</p>}
            </div>

            {/* Quick Launch */}
            <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl p-6 border border-gray-200/50 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
                  <p className="text-sm text-gray-600">Launch essential workflows instantly.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLaunch.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id as DoctorTab)}
                    className={`p-4 rounded-2xl bg-gradient-to-r ${item.accent} ${item.text} text-left shadow-md hover:shadow-xl hover:scale-[1.02] transition-all`}
                  >
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-white/80 mt-2">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <PatientQueue
              consultations={todayConsultations}
              onConsultationStatusChange={handleConsultationStatusChange}
            />
            {statusUpdateError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {statusUpdateError}
              </div>
            )}

            <div className="bg-gradient-to-b from-white/80 via-white/70 to-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Consultations</h2>
              {upcomingConsultations.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming consultations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingConsultations.slice(0, 5).map((consultation) => (
                    <div
                      key={consultation.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-200/40 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                          <Users size={20} className="text-teal-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{consultation.patientName || 'Unknown patient'}</p>
                          <p className="text-xs text-gray-600">
                            {(consultation.gestationalWeek === null ||
                            consultation.gestationalWeek === undefined)
                              ? '--'
                              : Number.isFinite(Number(consultation.gestationalWeek))
                              ? `${consultation.gestationalWeek} weeks`
                              : '--'}{' '}
                            pregnant
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(consultation.scheduledAt)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatTime(consultation.scheduledAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="animate-hero-content">
            <ConsultationList />
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="animate-hero-content">
            <ScheduleManager />
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="animate-hero-content">
            <EarningsOverview earnings={earnings} />
          </div>
        )}

        {activeTab === 'telemedicine' && (
          <div className="animate-hero-content">
            <TelemedicineHub
              todayConsultations={todayConsultations}
              upcomingConsultations={upcomingConsultations}
            />
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="animate-hero-content">
            <PatientManagement patients={recentPatients} consultations={allConsultations} />
          </div>
        )}

        {activeTab === 'clinical' && (
          <div className="animate-hero-content">
            <ClinicalTools />
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="animate-hero-content">
            <PracticeManagement />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="animate-hero-content">
            <AnalyticsReporting consultations={allConsultations} patients={recentPatients} earnings={earnings} />
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="animate-hero-content">
            <ComplianceCenter profile={profile} />
          </div>
        )}

        {activeTab === 'mobile' && (
          <div className="animate-hero-content">
            <MobileFeatures />
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
export { DoctorDashboard };
