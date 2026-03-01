import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  Apple,
  BarChart3,
  Bell,
  Calendar,
  FileText,
  RefreshCw,
  Utensils,
  Users
} from 'lucide-react';
import {
  AppNotification,
  NutritionistDashboardService,
  NutritionistDashboardData,
  NutritionPlan,
  PatientRef
} from '../../services/dashboardService';

type NutritionistTab = 'overview' | 'patients' | 'plans' | 'analytics' | 'notifications';

interface NutritionistPatient extends PatientRef {
  age?: number;
  bmi?: number;
  dietaryRestrictions?: string;
  goals?: string;
  lastConsultation?: string;
}

const NutritionistDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<NutritionistTab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<NutritionistDashboardData | null>(null);
  const [patients, setPatients] = useState<NutritionistPatient[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [patientFilter, setPatientFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'draft' | 'active' | 'completed'>('all');

  const [newPlanForm, setNewPlanForm] = useState({
    patientId: '',
    title: '',
    description: '',
    goals: '',
    dietaryRestrictions: '',
    status: 'draft' as 'draft' | 'active' | 'completed',
    recommendations: ''
  });
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    const validTabs: NutritionistTab[] = ['overview', 'patients', 'plans', 'analytics', 'notifications'];
    if (tab && validTabs.includes(tab as NutritionistTab)) {
      setActiveTab(tab as NutritionistTab);
      return;
    }
    setActiveTab('overview');
  }, [location.search]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadDashboard(),
          loadPatients(patientFilter),
          loadNutritionPlans(planFilter),
          loadNotifications()
        ]);
      } catch (err) {
        console.error('Failed to load nutritionist dashboard:', err);
        setError('Failed to load nutritionist workspace');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setTab = (tab: NutritionistTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate({ pathname: '/dashboard', search: params.toString() }, { replace: true });
  };

  const loadDashboard = async () => {
    try {
      const data = await NutritionistDashboardService.getDashboardData();
      setDashboard(data);
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      throw err;
    }
  };

  const loadPatients = async (filter: 'all' | 'active' | 'completed') => {
    try {
      const items = await NutritionistDashboardService.getPatients(filter);
      setPatients(items);
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  };

  const loadNutritionPlans = async (filter: 'all' | 'draft' | 'active' | 'completed') => {
    try {
      const items = await NutritionistDashboardService.getNutritionPlans(filter);
      setNutritionPlans(items);
    } catch (err) {
      console.error('Error loading nutrition plans:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const items = await NutritionistDashboardService.getNotifications();
      setNotifications(items);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const refreshAll = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadDashboard(),
        loadPatients(patientFilter),
        loadNutritionPlans(planFilter),
        loadNotifications()
      ]);
    } catch (err) {
      setError('Refresh failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNutritionPlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!newPlanForm.patientId || !newPlanForm.title.trim()) {
      setError('Patient and plan title are required.');
      return;
    }

    try {
      setCreatingPlan(true);
      await NutritionistDashboardService.createNutritionPlan({
        patientId: newPlanForm.patientId,
        title: newPlanForm.title.trim(),
        description: newPlanForm.description.trim() || undefined,
        goals: newPlanForm.goals.trim() || undefined,
        dietaryRestrictions: newPlanForm.dietaryRestrictions.trim() || undefined,
        status: newPlanForm.status,
        recommendations: newPlanForm.recommendations.trim() || undefined
      });

      setNewPlanForm({
        patientId: '',
        title: '',
        description: '',
        goals: '',
        dietaryRestrictions: '',
        status: 'draft',
        recommendations: ''
      });

      await Promise.all([
        loadNutritionPlans(planFilter),
        loadDashboard(),
        loadPatients(patientFilter)
      ]);

      setTab('plans');
    } catch (err: any) {
      setError(err?.message || 'Failed to create nutrition plan');
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleUpdatePlan = async (
    planId: string,
    payload: Partial<{
      status: 'draft' | 'active' | 'completed';
      goals?: string;
      recommendations?: string;
    }>
  ) => {
    try {
      setUpdatingPlanId(planId);
      await NutritionistDashboardService.updateNutritionPlan(planId, payload);
      await Promise.all([
        loadNutritionPlans(planFilter),
        loadDashboard(),
        loadPatients(patientFilter)
      ]);
    } catch (err) {
      setError('Failed to update nutrition plan');
    } finally {
      setUpdatingPlanId(null);
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await NutritionistDashboardService.markNotificationRead(notificationId);
      setNotifications((current) =>
        current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item))
      );
    } catch (err) {
      setError('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NutritionistDashboardService.markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      setError('Failed to mark all notifications');
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f6f1] via-[#fafbf7] to-white flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-lime-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading nutrition workspace...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f6f1] via-[#fafbf7] to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-lime-600 text-white rounded-xl font-medium hover:bg-lime-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f6f1] via-[#fafbf7] to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Nutritionist dashboard unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6f1] via-[#fafbf7] to-white p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-lime-700 via-green-600 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Nutritionist Workspace</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              {dashboard.profile?.name ? `Nutritionist ${dashboard.profile.name}` : 'Nutrition Specialist'}
            </h1>
            <p className="text-sm text-white/85 mt-1">Manage nutrition plans and patient consultations.</p>
          </div>
          <button
            onClick={refreshAll}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white text-lime-700 text-sm font-bold inline-flex items-center gap-2 hover:bg-white/90 disabled:opacity-50"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/80 rounded-2xl border border-gray-200 p-2 inline-flex gap-2 flex-wrap">
        {(['overview', 'patients', 'plans', 'analytics', 'notifications'] as NutritionistTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-lime-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab === 'notifications' ? (
              <>Notifications {unreadCount > 0 && `(${unreadCount})`}</>
            ) : (
              tab.charAt(0).toUpperCase() + tab.slice(1)
            )}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Patients"
              value={dashboard.stats?.totalPatients || 0}
              icon={<Users size={20} />}
              trend={dashboard.stats?.newPatientsThisMonth}
            />
            <MetricCard
              label="Active Plans"
              value={dashboard.stats?.activePlans || 0}
              icon={<FileText size={20} />}
            />
            <MetricCard
              label="Consultations This Month"
              value={dashboard.stats?.consultationsThisMonth || 0}
              icon={<Calendar size={20} />}
            />
            <MetricCard
              label="Nutrition Plans"
              value={dashboard.stats?.totalPlans || 0}
              icon={<Apple size={20} />}
            />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Consultations */}
            <div className="bg-white/85 rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Consultations</h2>
              {dashboard.recentConsultations && dashboard.recentConsultations.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.recentConsultations.slice(0, 5).map((consultation: any) => (
                    <div
                      key={consultation.id}
                      className="p-4 rounded-xl border border-gray-200 bg-white hover:border-lime-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{consultation.patientName}</p>
                          <p className="text-xs text-gray-500 mt-1">{consultation.topic}</p>
                        </div>
                        <span className="text-xs font-medium text-lime-700 bg-lime-50 px-2 py-1 rounded-lg">
                          {consultation.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No consultations yet.</p>
              )}
            </div>

            {/* Upcoming Follow-ups */}
            <div className="bg-white/85 rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Follow-ups</h2>
              {dashboard.upcomingFollowUps && dashboard.upcomingFollowUps.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.upcomingFollowUps.slice(0, 5).map((followUp: any) => (
                    <div
                      key={followUp.id}
                      className="p-4 rounded-xl border border-lime-200 bg-lime-50 hover:border-lime-400 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{followUp.patientName}</p>
                          <p className="text-xs text-gray-600 mt-1">{followUp.reason}</p>
                        </div>
                        <span className="text-xs font-bold text-lime-700">{followUp.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No upcoming follow-ups scheduled.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="bg-white/85 rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Patient Roster</h2>
            <div className="inline-flex gap-2 bg-gray-100 rounded-xl p-1">
              {(['all', 'active', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={async () => {
                    setPatientFilter(status);
                    await loadPatients(status);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    patientFilter === status
                      ? 'bg-lime-600 text-white'
                      : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {patients.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No patients in this category</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Age</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">BMI</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Restrictions</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Consultation</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-lime-50/50">
                      <td className="py-3 px-4 font-medium text-gray-900">{patient.name}</td>
                      <td className="py-3 px-4 text-gray-600">{patient.age || '--'}</td>
                      <td className="py-3 px-4 text-gray-600">{patient.bmi || '--'}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{patient.dietaryRestrictions || 'None'}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{patient.lastConsultation || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Plan Form */}
          <div className="lg:col-span-1 bg-white/85 rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create Plan</h2>
            <form onSubmit={handleCreateNutritionPlan} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Patient</label>
                <select
                  value={newPlanForm.patientId}
                  onChange={(e) => setNewPlanForm((c) => ({ ...c, patientId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <FormField
                label="Plan Title"
                value={newPlanForm.title}
                onChange={(value) => setNewPlanForm((c) => ({ ...c, title: value }))}
                required
              />

              <FormField
                label="Description"
                value={newPlanForm.description}
                onChange={(value) => setNewPlanForm((c) => ({ ...c, description: value }))}
                isTextarea
              />

              <FormField
                label="Goals"
                value={newPlanForm.goals}
                onChange={(value) => setNewPlanForm((c) => ({ ...c, goals: value }))}
                isTextarea
              />

              <FormField
                label="Dietary Restrictions"
                value={newPlanForm.dietaryRestrictions}
                onChange={(value) => setNewPlanForm((c) => ({ ...c, dietaryRestrictions: value }))}
              />

              <FormField
                label="Recommendations"
                value={newPlanForm.recommendations}
                onChange={(value) => setNewPlanForm((c) => ({ ...c, recommendations: value }))}
                isTextarea
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={newPlanForm.status}
                  onChange={(e) =>
                    setNewPlanForm((c) => ({
                      ...c,
                      status: e.target.value as 'draft' | 'active' | 'completed'
                    }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creatingPlan}
                className="w-full px-4 py-2.5 rounded-xl bg-lime-600 text-white font-semibold hover:bg-lime-700 disabled:opacity-50 text-sm"
              >
                {creatingPlan ? 'Creating...' : 'Create Plan'}
              </button>
            </form>
          </div>

          {/* Plans List */}
          <div className="lg:col-span-2 bg-white/85 rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Nutrition Plans</h2>
              <div className="inline-flex gap-2 bg-gray-100 rounded-xl p-1">
                {(['all', 'draft', 'active', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={async () => {
                      setPlanFilter(status);
                      await loadNutritionPlans(status);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      planFilter === status
                        ? 'bg-lime-600 text-white'
                        : 'text-gray-700 hover:bg-white'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {nutritionPlans.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No nutrition plans yet.</p>
            ) : (
              <div className="space-y-3">
                {nutritionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:border-lime-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{plan.title}</p>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-lg uppercase ${
                              plan.status === 'active'
                                ? 'bg-lime-100 text-lime-700'
                                : plan.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {plan.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{plan.patientName}</p>
                      </div>
                      <select
                        value={plan.status}
                        onChange={(e) =>
                          handleUpdatePlan(plan.id, {
                            status: e.target.value as 'draft' | 'active' | 'completed'
                          })
                        }
                        disabled={updatingPlanId === plan.id}
                        className="text-xs px-2 py-1 rounded-lg border border-gray-300 bg-white hover:border-lime-500 cursor-pointer disabled:opacity-50"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    {plan.description && (
                      <p className="text-xs text-gray-600 mb-2">{plan.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Created: {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/85 rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-lime-600" />
                Plan Distribution
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Plans</span>
                  <span className="text-2xl font-bold text-lime-600">{dashboard.stats?.activePlans || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Draft Plans</span>
                  <span className="text-2xl font-bold text-yellow-600">{dashboard.stats?.draftPlans || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed Plans</span>
                  <span className="text-2xl font-bold text-green-600">{dashboard.stats?.completedPlans || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/85 rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Utensils size={20} className="text-lime-600" />
                Performance Metrics
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Plan Completion</span>
                  <span className="text-2xl font-bold text-lime-600">
                    {dashboard.stats?.avgCompletionRate ? `${dashboard.stats.avgCompletionRate}%` : '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Patient Satisfaction</span>
                  <span className="text-2xl font-bold text-lime-600">
                    {dashboard.stats?.patientSatisfaction ? `${dashboard.stats.patientSatisfaction}%` : '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Consultations This Month</span>
                  <span className="text-2xl font-bold text-lime-600">
                    {dashboard.stats?.consultationsThisMonth || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white/85 rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-lime-600 hover:text-lime-700"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No notifications</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.isRead && handleMarkNotificationRead(notification.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    notification.isRead
                      ? 'border-gray-200 bg-white'
                      : 'border-lime-300 bg-lime-50 hover:border-lime-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Bell
                      size={16}
                      className={`mt-1 flex-shrink-0 ${
                        notification.isRead ? 'text-gray-400' : 'text-lime-600'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper component for metric cards
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, trend }) => (
  <div className="bg-white/85 rounded-2xl border border-gray-200 p-6 hover:border-lime-300 transition-colors">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend !== undefined && (
          <p className={`text-xs mt-2 font-semibold ${trend > 0 ? 'text-green-600' : 'text-gray-500'}`}>
            {trend > 0 ? `+${trend}` : trend} this month
          </p>
        )}
      </div>
      <div className="p-2 rounded-xl bg-lime-50 text-lime-600">{icon}</div>
    </div>
  </div>
);

// Helper component for form fields
interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isTextarea?: boolean;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ label, value, onChange, isTextarea, required }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {isTextarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm resize-none"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
      />
    )}
  </div>
);

export default NutritionistDashboard;
