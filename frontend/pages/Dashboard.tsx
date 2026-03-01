import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Activity, Droplet, Weight, Clock, CheckCircle, ChevronRight, BookOpen, 
  MessageSquare, Plus, Apple, Calendar, Sparkles, X, AlertCircle, GlassWater
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../i18n/I18nContext';
import { AIService, HealthData } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import { db, DashboardSummary } from '../services/db';
import type { Appointment, VaccineRecord } from '../types';

// REMOVED: Barrel re-exports of unrelated page components.
// Each page should be imported directly where needed (e.g., in Layout.tsx).
// This eliminates unnecessary coupling and enables proper tree-shaking.

const MAX_PREGNANCY_WEEKS = 40;
const HYDRATION_GOAL_GLASSES = 8;
const HYDRATION_GLASS_LITERS = 0.25;
const HYDRATION_WARNING_GLASSES = 17;
const HYDRATION_CAUTION_GLASSES = 11;
const WATER_VISUAL_MAX = 20;
const ACTIVITY_DAYS = 7;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getDateKey = (date: Date) => date.toISOString().split('T')[0];

const parseDateKey = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return getDateKey(parsed);
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, locale } = useTranslations();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Mom';
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [glassCount, setGlassCount] = useState(0);
  const [healthHistory, setHealthHistory] = useState<Record<string, { date: string; value: string }[]>>({});
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // Dashboard summary state (from consolidated API)
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  
  // Modal States
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [tempWeek, setTempWeek] = useState(0);

  const insightTimeoutRef = useRef<number | null>(null);

  const hydrationLiters = useMemo(
    () => (glassCount * HYDRATION_GLASS_LITERS).toFixed(1),
    [glassCount]
  );

  // Use summary data for appointment count (more accurate since it's calculated server-side)
  const appointmentCount = useMemo(
    () => dashboardSummary?.upcomingAppointments ?? 
      appointments.filter((appointment) => {
        const normalizedStatus = String(appointment.status || '').toLowerCase();
        return normalizedStatus === 'upcoming' || normalizedStatus === 'scheduled';
      }).length,
    [dashboardSummary, appointments]
  );

  // Use summary data for vaccine progress (calculated server-side)
  const vaccineProgress = useMemo(() => {
    if (dashboardSummary) return dashboardSummary.vaccineProgress;
    if (vaccines.length === 0) return 0;
    const taken = vaccines.filter((vaccine) => vaccine.status === 'Taken').length;
    return Math.round((taken / vaccines.length) * 100);
  }, [dashboardSummary, vaccines]);

  const vaccinesDueCount = useMemo(() => {
    if (vaccines.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const windowEnd = new Date(today);
    windowEnd.setDate(windowEnd.getDate() + 14);

    return vaccines.filter((vaccine) => {
      if (vaccine.status === 'Taken') return false;
      const dateKey = parseDateKey(vaccine.dueDate);
      if (!dateKey) return false;
      const dueDate = new Date(dateKey);
      return dueDate <= windowEnd;
    }).length;
  }, [vaccines]);

  const waterWarning = useMemo(() => {
    if (glassCount >= HYDRATION_WARNING_GLASSES) {
      return { severity: 'danger', message: 'Warning: excessive water intake can be harmful.' };
    }
    if (glassCount >= HYDRATION_CAUTION_GLASSES) {
      return { severity: 'caution', message: 'Caution: you are above the daily hydration target.' };
    }
    return null;
  }, [glassCount]);

  const latestMetrics = useMemo(() => {
    const getTime = (value: string) => {
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    };
    const formatMetricValue = (value?: string | null) => {
      if (!value) return '--';
      const [first] = value.split(' ');
      return first || value;
    };
    const getLatest = (key: string) => {
      const entries = healthHistory[key] || [];
      if (entries.length === 0) return null;
      return [...entries].sort((a, b) => getTime(b.date) - getTime(a.date))[0];
    };
    return {
      heartRate: formatMetricValue(getLatest('Heart Rate')?.value),
      weight: formatMetricValue(getLatest('Weight')?.value),
      sleep: formatMetricValue(getLatest('Sleep')?.value)
    };
  }, [healthHistory]);

  const activityData = useMemo(() => {
    const counts = new Map<string, number>();
    Object.values(healthHistory).forEach((entries) => {
      entries.forEach((entry) => {
        const key = parseDateKey(entry.date);
        if (!key) return;
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });

    const days: { name: string; active: number }[] = [];
    for (let i = ACTIVITY_DAYS - 1; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = getDateKey(date);
      const label = date.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });
      days.push({ name: label, active: counts.get(key) || 0 });
    }
    return days;
  }, [healthHistory, locale]);

  const hasActivity = useMemo(
    () => activityData.some((day) => day.active > 0),
    [activityData]
  );

  const defaultInsights = useMemo(
    () => [
      'Drink at least 8 glasses of water daily.',
      'Remember to take your prenatal vitamins.',
      'Light walking and stretching can support circulation.'
    ],
    []
  );

  useEffect(() => {
    setTempWeek(currentWeek);
  }, [currentWeek]);

  const handleWeekUpdate = async () => {
    const normalizedWeek = clamp(tempWeek, 1, MAX_PREGNANCY_WEEKS);
    setCurrentWeek(normalizedWeek);
    setShowWeekModal(false);
    if (!user) return;
    try {
      await db.updatePregnancyWeek(user.id, normalizedWeek);
    } catch (err) {
      console.error('Failed to update pregnancy week:', err);
    }
  };

  const updateHydrationCount = async (nextCount: number) => {
    const normalized = Math.max(0, Math.round(nextCount));
    setGlassCount(normalized);
    if (!user) return;
    try {
      await db.updateHydration(user.id, normalized);
    } catch (err) {
      console.error('Failed to update hydration:', err);
    }
  };

  const handleAddGlass = () => {
    updateHydrationCount(glassCount + 1);
  };

  const handleRemoveGlass = () => {
    if (glassCount > 0) {
      updateHydrationCount(glassCount - 1);
    }
  };

  const refreshDashboard = async (silent = false) => {
    if (!user) {
      if (!silent) setLoadingData(false);
      return;
    }
    if (!silent) setLoadingData(true);
    setDataError(null);
    try {
      // Use consolidated dashboard summary API for faster loading
      const [summary, appts, vacs] = await Promise.all([
        db.getDashboardSummary(),
        db.getAppointments(user.id),
        db.getVaccines(user.id)
      ]);

      setDashboardSummary(summary);
      setAppointments(appts || []);
      setVaccines(vacs || []);
      
      // Set individual state from summary for backward compatibility
      const safeHydration = Number.isFinite(summary.waterToday) ? Math.max(0, Math.round(summary.waterToday)) : 0;
      setGlassCount(safeHydration);
      setCurrentWeek(clamp(summary.pregnancyWeek || 0, 0, MAX_PREGNANCY_WEEKS));
      
      // Convert health summary metrics to health history format
      const historyFromSummary: Record<string, { date: string; value: string }[]> = {};
      summary.healthSummaryMetrics.forEach(metric => {
        historyFromSummary[metric.type] = [{
          date: metric.date,
          value: String(metric.value || '')
        }];
      });
      setHealthHistory(prev => ({
        ...prev,
        ...historyFromSummary
      }));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setDataError('Failed to load dashboard data. Please try again.');
    } finally {
      if (!silent) setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoadingData(false);
      return;
    }
    refreshDashboard();
    const handleUpdate = () => refreshDashboard(true);
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, [user]);

  useEffect(() => {
    if (!user || loadingData) return;

    if (insightTimeoutRef.current) {
      window.clearTimeout(insightTimeoutRef.current);
    }

    insightTimeoutRef.current = window.setTimeout(async () => {
      setLoadingInsights(true);
      try {
        const healthData: HealthData = {
          pregnancyWeek: currentWeek.toString(),
          vaccinesDue: vaccinesDueCount,
          hydrationLevel: `${hydrationLiters}L`
        };
        const aiInsights = await AIService.getHealthInsights(healthData, locale);
        setInsights(aiInsights && aiInsights.length > 0 ? aiInsights : defaultInsights);
      } catch (error) {
        setInsights(defaultInsights);
      } finally {
        setLoadingInsights(false);
      }
    }, 500);

    return () => {
      if (insightTimeoutRef.current) {
        window.clearTimeout(insightTimeoutRef.current);
      }
    };
  }, [user, loadingData, locale, currentWeek, hydrationLiters, vaccinesDueCount, defaultInsights]);
const quickActions = [
    { label: t('nav.appointments'), icon: <Plus size={18} />, path: '/appointments', badge: appointmentCount, bgGradient: 'from-emerald-400 to-emerald-500', text: 'text-white' },
    { label: t('nav.nutrition'), icon: <Apple size={18} />, path: '/nutrition', bgGradient: 'from-amber-300 to-amber-400', text: 'text-white' },
    { label: t('nav.community'), icon: <MessageSquare size={18} />, path: '/community', bgGradient: 'from-blue-300 to-blue-400', text: 'text-white' },
    { label: t('nav.journal'), icon: <BookOpen size={18} />, path: '/journal', bgGradient: 'from-rose-300 to-rose-400', text: 'text-white' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6f1] via-[#fafbf7] to-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-12">
        {dataError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">{dataError}</p>
              <p className="text-xs text-red-600">Check your connection and try again.</p>
            </div>
            <button
              onClick={() => refreshDashboard()}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden">
          <div className="relative z-10 rounded-3xl bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 p-8 md:p-12 shadow-xl">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 right-4 w-80 h-80 bg-white rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  {t('dashboard.welcome', { name: firstName })}
                </h1>
                <p className="text-white/90 text-base leading-relaxed max-w-md">
                  {t('dashboard.pregnancySub')}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Week Card - Interactive */}
                <button
                  onClick={() => setShowWeekModal(true)}
                  disabled={loadingData}
                  className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/25 transition-all group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#E6C77A]/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar size={16} className="text-[#E6C77A]" />
                    </div>
                    <span className="text-white/70 text-sm font-medium text-left">Week</span>
                  </div>
                  <p className="text-2xl font-bold text-white text-left group-hover:text-[#E6C77A] transition-colors">
                    {loadingData ? '--' : (currentWeek > 0 ? currentWeek : 'Set')}
                  </p>
                  <p className="text-xs text-white/50 mt-2 text-left">{currentWeek > 0 ? 'Click to edit' : 'Click to set'}</p>
                </button>
                
                {/* Water Card - Interactive with Glass Units */}
                <button
                  onClick={() => setShowWaterModal(true)}
                  disabled={loadingData}
                  className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/25 transition-all group cursor-pointer relative overflow-hidden h-40 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {/* Animated Water Container */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <svg 
                      className="absolute inset-0 w-full h-full" 
                      viewBox="0 0 100 100" 
                      preserveAspectRatio="none"
                      style={{
                        opacity: 0.3,
                      }}
                    >
                      <defs>
                        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#E6C77A" />
                          <stop offset="100%" stopColor="#d4a853" />
                        </linearGradient>
                        <style>{`
                          @keyframes wave1 {
                            0%, 100% { d: path('M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z'); }
                            25% { d: path('M0,45 Q25,25 50,45 T100,45 L100,100 L0,100 Z'); }
                            50% { d: path('M0,50 Q25,35 50,50 T100,50 L100,100 L0,100 Z'); }
                            75% { d: path('M0,48 Q25,28 50,48 T100,48 L100,100 L0,100 Z'); }
                          }
                          .wave-path {
                            animation: wave1 4s ease-in-out infinite;
                          }
                        `}</style>
                      </defs>
                      <rect 
                        x="0" 
                        y={String(100 - Math.min((glassCount / HYDRATION_GOAL_GLASSES) * 100, 100))} 
                        width="100" 
                        height={String(Math.min((glassCount / HYDRATION_GOAL_GLASSES) * 100, 100))} 
                        fill="url(#waterGradient)" 
                        opacity="0.6"
                      />
                      <path 
                        className="wave-path"
                        fill="url(#waterGradient)"
                        opacity="0.4"
                      />
                    </svg>
                  </div>

                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#E6C77A]/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <GlassWater size={16} className="text-[#E6C77A]" />
                      </div>
                      <span className="text-white/70 text-sm font-medium">Water</span>
                    </div>
                    
                    <div>
                      <p className="text-2xl font-bold text-white group-hover:text-[#E6C77A] transition-colors">{loadingData ? '--' : glassCount} Glasses</p>
                      <p className="text-xs text-white/50 mt-2">Click to update</p>
                    </div>
                  </div>
                </button>

                {/* Vaccines Card with Progress Theme */}
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all group relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 pointer-events-none">
                  </div>
                  <div className="relative z-10 flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#E6C77A]/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle size={16} className="text-[#E6C77A]" />
                    </div>
                    <span className="text-white/70 text-sm font-medium">{t('nav.vaccines')}</span>
                  </div>
                  <p className="text-2xl font-bold text-white relative z-10">{loadingData ? '--' : `${vaccineProgress}%`}</p>
                  <div className="mt-3 relative z-10">
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#E6C77A]/50 to-[#E6C77A] transition-all duration-500" style={{ width: `${loadingData ? 0 : vaccineProgress}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Appointments Card with Calendar Theme */}
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all group relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="grid grid-cols-3 gap-1 p-2">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-white rounded-sm"></div>
                      ))}
                    </div>
                  </div>
                  <div className="relative z-10 flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#E6C77A]/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar size={16} className="text-[#E6C77A]" />
                    </div>
                    <span className="text-white/70 text-sm font-medium">{t('nav.appointments')}</span>
                  </div>
                  <div className="flex items-end gap-2 relative z-10">
                    <p className="text-2xl font-bold text-white">{loadingData ? '--' : appointmentCount}</p>
                    <span className="text-xs text-white/60 pb-1">Upcoming</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Metrics Cards */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.healthSummary')}</h2>
            <button 
              onClick={() => navigate('/health')}
              className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-2 text-sm bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-all"
            >
              {t('common.viewAll')} <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { id: 'heart-rate', label: t('health.heartRate'), value: latestMetrics.heartRate, unit: 'bpm', icon: <Activity size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
              { id: 'hydration', label: t('health.hydration'), value: hydrationLiters, unit: 'L', icon: <Droplet size={24} />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
              { id: 'weight', label: t('health.weight'), value: latestMetrics.weight, unit: 'kg', icon: <Weight size={24} />, color: 'text-[#d4a853]', bg: 'bg-amber-50', border: 'border-amber-200' },
              { id: 'sleep', label: t('health.sleep'), value: latestMetrics.sleep, unit: '', icon: <Clock size={24} />, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
            ].map((m, idx) => (
              <button 
                key={idx} 
                onClick={() => navigate('/health')}
                className={`${m.bg} p-6 rounded-2xl shadow-sm hover:shadow-xl hover:scale-105 transition-all text-left group cursor-pointer border-2 ${m.border}`}
              >
                <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {m.icon}
                </div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">{m.label}</p>
                <p className="text-2xl font-bold text-gray-900">{m.value} <span className="text-sm font-normal text-gray-400">{m.unit}</span></p>
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid - AI Insights & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Insights & Chart */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* AI Health Insights */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t('dashboard.aiInsights')}</h3>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('dashboard.poweredAi')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/assistant')}
                  className="text-emerald-500 hover:text-emerald-600 p-2 rounded-xl hover:bg-emerald-50 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {loadingInsights ? (
                  <>
                    <div className="h-20 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl animate-pulse"></div>
                    <div className="h-20 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl animate-pulse"></div>
                    <div className="h-20 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl animate-pulse"></div>
                  </>
                ) : (
                  insights.map((insight, idx) => (
                    <div 
                      key={idx} 
                      className="relative p-5 bg-gradient-to-r from-emerald-100/50 to-white rounded-2xl border-l-4 border-emerald-400 shadow-sm hover:shadow-md hover:from-emerald-100 transition-all group"
                    >
                      <p className="text-gray-700 text-sm leading-relaxed font-medium">{insight}</p>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Sparkles size={16} className="text-emerald-500" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900">{t('dashboard.activity')}</h3>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider bg-gray-50 px-3 py-1 rounded-full">This Week</span>
              </div>
              <div className="h-72 w-full">
                {hasActivity ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#6ee7b7" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 500}} />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{fill: 'rgba(16, 185, 129, 0.1)', radius: 8}} 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)', backgroundColor: 'white'}}
                        formatter={(value) => [value, 'Activity']}
                      />
                      <Bar dataKey="active" fill="url(#barGradient)" radius={[8, 8, 0, 0]} isAnimationActive={true} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">
                    No recent activity yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Progress */}
          <div className="space-y-8">
            
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('dashboard.quickActions')}</h3>
              </div>
              <div className="space-y-3">
                {quickActions.map((action, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => navigate(action.path)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${action.bgGradient} ${action.text} shadow-md hover:shadow-xl hover:scale-105 transition-all font-semibold text-sm group relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all"></div>
                    <div className="relative z-10 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      {action.icon}
                    </div>
                    <span className="relative z-10 flex-1 text-left">{action.label}</span>
                    {action.badge !== undefined && action.badge > 0 && (
                      <span className="relative z-10 bg-white text-emerald-600 text-xs font-bold px-3 py-1 rounded-full">
                        {action.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Vaccine Progress Card */}
            <div className="bg-gradient-to-br from-emerald-100/60 via-emerald-50/40 to-white rounded-3xl p-8 shadow-sm border-2 border-emerald-200/70 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-200/60 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle size={20} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{t('dashboard.completion')}</h3>
                </div>
              </div>

              {!loadingData && (dashboardSummary?.vaccineCounts?.total || vaccines.length) === 0 ? (
                /* Empty state for vaccines */
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-emerald-400" />
                  </div>
                  <p className="text-gray-600 mb-4">No vaccines tracked yet</p>
                  <button 
                    onClick={() => navigate('/vaccines')}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all hover:scale-105"
                  >
                    Add Vaccines
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Vaccine Progress</span>
                      <span className="text-3xl font-bold text-emerald-600">{loadingData ? '--' : `${vaccineProgress}%`}</span>
                    </div>
                    <div className="h-3 bg-gray-200/50 rounded-full overflow-hidden shadow-sm">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg transition-all duration-1000"
                        style={{ width: `${loadingData ? 0 : vaccineProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {!loadingData && (
                    <div className="pt-6 border-t border-emerald-200/50">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 font-medium">Total Vaccines</span>
                          <span className="font-bold text-gray-900">{dashboardSummary?.vaccineCounts?.total ?? vaccines.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 font-medium">Completed</span>
                          <span className="font-bold text-emerald-600">{dashboardSummary?.vaccineCounts?.completed ?? vaccines.filter((vaccine) => vaccine.status === 'Taken').length}</span>
                        </div>
                        <button 
                          onClick={() => navigate('/vaccines')}
                          className="w-full mt-4 py-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all hover:scale-105"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Week Modal */}
      {showWeekModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Update Week</h2>
              <button onClick={() => { setTempWeek(currentWeek); setShowWeekModal(false); }} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-gray-600">{`Select your pregnancy week (1-${MAX_PREGNANCY_WEEKS}):`}</p>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setTempWeek(Math.max(1, tempWeek - 1))}
                  className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl font-bold text-lg hover:bg-emerald-200 transition-all"
                >
                  -
                </button>
                
                <div className="flex-1">
                  <input 
                    type="number" 
                    value={tempWeek}
                    onChange={(e) => setTempWeek(Math.min(MAX_PREGNANCY_WEEKS, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full text-center text-3xl font-bold text-emerald-600 border-2 border-emerald-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">Weeks</p>
                </div>
                
                <button 
                  onClick={() => setTempWeek(Math.min(MAX_PREGNANCY_WEEKS, tempWeek + 1))}
                  className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl font-bold text-lg hover:bg-emerald-200 transition-all"
                >
                  +
                </button>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleWeekUpdate}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {t('common.save')}
                </button>
                <button 
                  onClick={() => { setTempWeek(currentWeek); setShowWeekModal(false); }}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Water Modal */}
      {showWaterModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Track Water</h2>
              <button onClick={() => setShowWaterModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-gray-600 text-center">How many glasses of water have you had today?</p>
              
              {/* Glass Counter Display */}
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <GlassWater size={32} className="text-emerald-500" />
                  <span className="text-5xl font-bold text-emerald-600">{glassCount}</span>
                </div>
                <p className="text-sm text-gray-600">Glasses</p>
              </div>

              {/* Glass Progress Visual */}
              <div className="flex gap-2 justify-center flex-wrap">
                {[...Array(Math.min(glassCount + 1, WATER_VISUAL_MAX))].map((_, i) => {
                  let bgColor = 'border-gray-300 bg-gray-50';
                  let iconColor = 'text-gray-300';
                  
                  if (i < glassCount) {
                    if (glassCount >= HYDRATION_WARNING_GLASSES) {
                      bgColor = 'bg-red-400 border-red-600';
                      iconColor = 'text-white';
                    } else if (glassCount >= HYDRATION_CAUTION_GLASSES) {
                      bgColor = 'bg-amber-400 border-amber-600';
                      iconColor = 'text-white';
                    } else {
                      bgColor = 'bg-emerald-400 border-emerald-600';
                      iconColor = 'text-white';
                    }
                  }
                  
                  return (
                    <div 
                      key={i}
                      className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${bgColor}`}
                    >
                      <GlassWater size={20} className={iconColor} />
                    </div>
                  );
                })}
              </div>

              {/* Warning Message */}
              {waterWarning && (
                <div className={`p-4 rounded-xl flex gap-3 ${
                  waterWarning.severity === 'danger'
                    ? 'bg-red-100 border-l-4 border-red-500'
                    : 'bg-amber-100 border-l-4 border-amber-500'
                }`}>
                  <AlertCircle size={20} className={waterWarning.severity === 'danger' ? 'text-red-600' : 'text-amber-600'} />
                  <p className={waterWarning.severity === 'danger' ? 'text-red-700' : 'text-amber-700'}>
                    {waterWarning.message}
                  </p>
                </div>
              )}

              {/* Add/Remove Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={handleRemoveGlass}
                  disabled={loadingData || glassCount === 0}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  - Remove
                </button>
                <button 
                  onClick={handleAddGlass}
                  disabled={loadingData}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add Glass
                </button>
              </div>

              <button 
                onClick={() => setShowWaterModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;



