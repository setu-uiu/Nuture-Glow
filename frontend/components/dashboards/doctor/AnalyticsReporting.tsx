import React, { useMemo } from 'react';
import { BarChart3, LineChart, Users, TrendingUp } from 'lucide-react';
import type { Consultation, DoctorEarnings, PatientBasicInfo } from '../../../types/dashboard';

interface AnalyticsReportingProps {
  consultations: Consultation[];
  patients: PatientBasicInfo[];
  earnings: DoctorEarnings;
}

const AnalyticsReporting: React.FC<AnalyticsReportingProps> = ({ consultations, patients, earnings }) => {
  const totalConsultations = consultations.length;
  const completed = consultations.filter((c) => c.status === 'completed').length;
  const completionRate = totalConsultations ? Math.round((completed / totalConsultations) * 100) : null;

  const ageBuckets = useMemo(() => {
    const buckets = [
      { label: '18-24', count: 0 },
      { label: '25-30', count: 0 },
      { label: '31-35', count: 0 },
      { label: '36+', count: 0 }
    ];
    patients.forEach((patient) => {
      const rawAge = patient.age;
      const ageValue = rawAge === null || rawAge === undefined ? null : Number(rawAge);
      if (!Number.isFinite(ageValue)) return;
      const safeAge = Number(ageValue);
      if (safeAge < 25) buckets[0].count += 1;
      else if (safeAge < 31) buckets[1].count += 1;
      else if (safeAge < 36) buckets[2].count += 1;
      else buckets[3].count += 1;
    });
    return buckets;
  }, [patients]);

  const trimesterBuckets = useMemo(() => {
    const buckets = [
      { label: '1-13w', count: 0 },
      { label: '14-27w', count: 0 },
      { label: '28-40w', count: 0 }
    ];
    patients.forEach((patient) => {
      const rawWeek = patient.gestationalWeek;
      const weekValue = rawWeek === null || rawWeek === undefined ? null : Number(rawWeek);
      if (!Number.isFinite(weekValue)) return;
      const safeWeek = Number(weekValue);
      if (safeWeek < 14) buckets[0].count += 1;
      else if (safeWeek < 28) buckets[1].count += 1;
      else buckets[2].count += 1;
    });
    return buckets;
  }, [patients]);

  const avgDuration = useMemo(() => {
    const durations = consultations
      .map((c) => c.duration)
      .filter((value) => value !== null && value !== undefined)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    if (!durations.length) return null;
    const sum = durations.reduce((acc, value) => acc + value, 0);
    return Math.round(sum / durations.length);
  }, [consultations]);

  const typeBreakdown = useMemo(() => {
    const counts = { video: 0, phone: 0, 'in-person': 0 };
    consultations.forEach((consultation) => {
      if (consultation.type && counts[consultation.type] !== undefined) {
        counts[consultation.type] += 1;
      }
    });
    return [
      { label: 'Video consults', count: counts.video, color: 'bg-emerald-500' },
      { label: 'Phone consults', count: counts.phone, color: 'bg-blue-500' },
      { label: 'In-person consults', count: counts['in-person'], color: 'bg-amber-500' }
    ];
  }, [consultations]);

  const revenueBreakdown = useMemo(() => {
    const totals = { video: 0, phone: 0, 'in-person': 0 };
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    consultations.forEach((consultation) => {
      if (consultation.status !== 'completed') return;
      if (!consultation.scheduledAt) return;
      const scheduled = new Date(consultation.scheduledAt);
      if (!Number.isFinite(scheduled.getTime())) return;
      if (scheduled < monthStart || scheduled >= monthEnd) return;
      const rawFee = consultation.fee;
      if (rawFee === null || rawFee === undefined) return;
      const fee = Number(consultation.fee);
      if (!Number.isFinite(fee)) return;
      if (consultation.type && totals[consultation.type] !== undefined) {
        totals[consultation.type] += fee;
      }
    });
    return [
      { label: 'Video', amount: totals.video, color: 'bg-emerald-500' },
      { label: 'Phone', amount: totals.phone, color: 'bg-blue-500' },
      { label: 'In-person', amount: totals['in-person'], color: 'bg-amber-500' }
    ];
  }, [consultations]);

  const revenueTotal = revenueBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const typeTotal = typeBreakdown.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70">Analytics & Reporting</p>
            <h2 className="text-2xl font-bold">Performance insights for better care</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-emerald-600" />
            <h3 className="text-lg font-bold text-gray-900">Patient Demographics</h3>
          </div>
          <div className="space-y-3">
            {ageBuckets.map((bucket) => (
              <div key={bucket.label}>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{bucket.label}</span>
                  <span className="font-semibold text-gray-900">{bucket.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${patients.length ? (bucket.count / patients.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <LineChart className="text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Gestational Distribution</h3>
          </div>
          <div className="space-y-3">
            {trimesterBuckets.map((bucket) => (
              <div key={bucket.label}>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{bucket.label}</span>
                  <span className="font-semibold text-gray-900">{bucket.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${patients.length ? (bucket.count / patients.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 via-white to-white rounded-3xl border border-amber-100/70 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-amber-600" />
            <h3 className="text-lg font-bold text-gray-900">Performance Metrics</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completion rate</span>
              <span className="font-semibold text-amber-700">
                {completionRate === null ? '--' : `${completionRate}%`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Patient satisfaction</span>
              <span className="font-semibold text-emerald-700">--</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Avg. consult duration</span>
              <span className="font-semibold text-blue-700">
                {avgDuration === null ? '--' : `${avgDuration} min`}
              </span>
            </div>
          </div>
          <button className="mt-4 w-full py-2.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-all">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Consultation Analytics</h3>
          {typeTotal === 0 ? (
            <p className="text-sm text-gray-500">No consultation data available yet.</p>
          ) : (
            <div className="space-y-4">
              {typeBreakdown.map((item) => {
                const percent = typeTotal ? Math.round((item.count / typeTotal) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{item.label}</span>
                      <span className="font-semibold text-gray-900">{percent}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Analytics</h3>
          {revenueTotal === 0 ? (
            <p className="text-sm text-gray-500">No revenue data recorded for this month.</p>
          ) : (
            <div className="space-y-4">
              {revenueBreakdown.map((item) => (
                <div key={item.label} className="p-4 rounded-2xl border border-gray-200 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">BDT {item.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${revenueTotal ? (item.amount / revenueTotal) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-3">Based on completed consultations this month.</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReporting;
