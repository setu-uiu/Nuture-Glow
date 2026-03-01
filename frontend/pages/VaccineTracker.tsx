import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Syringe, CheckCircle, Clock, Search, X,
  Calendar as CalendarIcon, Check, ChevronDown, ChevronRight,
  Shield, AlertTriangle, Bell, Baby, Info, RotateCcw, Award, ArrowRight
} from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { VaccineRecord } from '../types';
import {
  buildVaccineDoseOptions,
  getVaccinesByTimingGroup,
  VaccineDoseOption,
  VaccineInfo,
  formatAge,
  normalizeScheduleRows,
} from '../data/vaccineSchedule';

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */

interface MergedVaccine {
  doseOption: VaccineDoseOption;
  vaccineInfo: VaccineInfo;
  savedRecord: VaccineRecord | null;
  status: 'Taken' | 'Pending' | 'Overdue' | 'Upcoming';
  dueDate: string;
  daysUntilDue: number | null;
  reminderText: string;
}

/** Per-parent-vaccine aggregation for dose tracking */
interface VaccineAggregation {
  vaccineInfo: VaccineInfo;
  totalDoses: number;
  givenDoses: number;
  remainingDoses: number;
  percent: number;
  isComplete: boolean;
  nextDose: {
    label: string;
    dose: string;
    dueDate: string;
    daysUntil: number | null;
    ageLabel: string;
    doseNumber: number;
  } | null;
  doseStatuses: {
    label: string;
    dose: string;
    dueDate: string;
    status: MergedVaccine['status'];
    isTaken: boolean;
    doseNumber: number;
    ageLabel: string;
  }[];
}

type CategoryFilter = 'All' | 'EPI' | 'Additional';
type StatusFilter = 'All' | 'Taken' | 'Pending' | 'Overdue' | 'Upcoming';

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

function getDaysUntilDue(dueDate: string): number | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getReminderText(days: number | null, hasDob: boolean): string {
  if (days === null) return hasDob ? '' : 'Set DOB for dates';
  if (days < -365) return `Overdue by ${Math.abs(Math.round(days / 365))}y`;
  if (days < -30) return `Overdue by ${Math.abs(Math.round(days / 30))}mo`;
  if (days < -7) return `Overdue by ${Math.abs(Math.round(days / 7))}w`;
  if (days < 0) return `Overdue by ${Math.abs(days)}d`;
  if (days === 0) return 'Due today!';
  if (days <= 7) return `Due in ${days}d`;
  if (days <= 30) return `Due in ${Math.round(days / 7)}w`;
  if (days <= 365) return `Due in ${Math.round(days / 30)}mo`;
  return `Due in ${(days / 365).toFixed(1)}y`;
}

function getStatusFromDays(days: number | null, isTaken: boolean): MergedVaccine['status'] {
  if (isTaken) return 'Taken';
  if (days === null) return 'Pending';
  if (days < 0) return 'Overdue';
  if (days <= 14) return 'Pending';
  return 'Upcoming';
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ═══════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════ */

const VaccineTracker: React.FC = () => {
  const { user } = useAuth();

  /* ─── State ─── */
  const [vaccineSchedule, setVaccineSchedule] = useState<VaccineInfo[]>([]);
  const [savedVaccines, setSavedVaccines] = useState<VaccineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [childDob, setChildDob] = useState('');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [detailVaccine, setDetailVaccine] = useState<VaccineInfo | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchHighlight, setSearchHighlight] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Completion celebration toast
  const [completionToast, setCompletionToast] = useState<string | null>(null);

  /* ─── Computed dose options (from live DB schedule) ─── */
  const allDoseOptions = useMemo(() => buildVaccineDoseOptions(vaccineSchedule, childDob || undefined), [vaccineSchedule, childDob]);
  const timingGroups = useMemo(() => getVaccinesByTimingGroup(vaccineSchedule), [vaccineSchedule]);

  /* ─── Search ─── */
  const searchResults = useMemo(() => {
    if (!query.trim()) return allDoseOptions;
    const q = query.toLowerCase();
    return allDoseOptions.filter(v =>
      v.label.toLowerCase().includes(q) ||
      v.vaccineName.toLowerCase().includes(q) ||
      v.shortName.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q)
    );
  }, [query, allDoseOptions]);

  const searchGrouped = useMemo(() => {
    const groups: { group: string; items: VaccineDoseOption[] }[] = [];
    const groupMap = new Map<string, VaccineDoseOption[]>();
    for (const opt of searchResults) {
      const tg = timingGroups.find(g => g.vaccines.some(v => v.label === opt.label));
      const groupName = tg?.group || 'Other';
      if (!groupMap.has(groupName)) groupMap.set(groupName, []);
      groupMap.get(groupName)!.push(opt);
    }
    for (const tg of timingGroups) {
      const items = groupMap.get(tg.group);
      if (items && items.length > 0) groups.push({ group: tg.group, items });
    }
    const other = groupMap.get('Other');
    if (other && other.length > 0) groups.push({ group: 'Other', items: other });
    return groups;
  }, [searchResults, timingGroups]);

  /* ─── Load data ─── */
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch vaccine schedule catalog from DB (live data)
        const scheduleRows = await db.getVaccineSchedule();
        const parsed = normalizeScheduleRows(scheduleRows);
        if (parsed.length > 0) {
          setVaccineSchedule(parsed);
        }

        const data = await db.getVaccines(user.id);
        setSavedVaccines(data);
        try {
          const meta = await db.getUserMeta(user.id, ['childDob']);
          if (meta.childDob) setChildDob(meta.childDob);
        } catch { /* ignore */ }
      } catch (err) {
        console.error('Failed to load vaccines:', err);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!loading && timingGroups.length > 0) {
      const initial = new Set(timingGroups.slice(0, 3).map(g => g.group));
      setExpandedGroups(initial);
    }
  }, [loading, timingGroups]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Auto-dismiss completion toast after 4s
  useEffect(() => {
    if (completionToast) {
      const timer = setTimeout(() => setCompletionToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [completionToast]);

  /* ─── Build merged vaccine list ─── */
  const mergedVaccines: MergedVaccine[] = useMemo(() => {
    const savedMap = new Map<string, VaccineRecord>();
    for (const sv of savedVaccines) {
      savedMap.set(sv.name, sv);
    }

    return allDoseOptions.map(opt => {
      const vaccineInfo = vaccineSchedule.find(v => v.name === opt.vaccineName)!;
      const saved = savedMap.get(opt.label);
      const isTaken = saved?.status === 'Taken';
      const dueDate = opt.suggestedDate || '';
      const days = getDaysUntilDue(dueDate);
      const status = getStatusFromDays(days, isTaken);
      const reminderText = isTaken ? 'Completed \u2713' : getReminderText(days, !!childDob);

      return {
        doseOption: opt,
        vaccineInfo,
        savedRecord: saved || null,
        status,
        dueDate,
        daysUntilDue: days,
        reminderText,
      };
    });
  }, [allDoseOptions, savedVaccines, childDob, vaccineSchedule]);

  /* ─── Overall Stats ─── */
  const stats = useMemo(() => {
    const total = mergedVaccines.length;
    const taken = mergedVaccines.filter(v => v.status === 'Taken').length;
    const overdue = mergedVaccines.filter(v => v.status === 'Overdue').length;
    const pending = mergedVaccines.filter(v => v.status === 'Pending').length;
    const upcoming = mergedVaccines.filter(v => v.status === 'Upcoming').length;
    const percent = total > 0 ? Math.round((taken / total) * 100) : 0;
    return { total, taken, overdue, pending, upcoming, percent };
  }, [mergedVaccines]);

  /* ─── Per-Vaccine Dose Tracking Aggregation ─── */
  const vaccineAggMap = useMemo(() => {
    const map = new Map<string, VaccineAggregation>();

    for (const vInfo of vaccineSchedule) {
      const doseStatuses = vInfo.doses.map((d, idx) => {
        const label = vInfo.doses.length === 1
          ? vInfo.shortName
          : `${vInfo.shortName} \u2013 ${d.dose}`;
        const merged = mergedVaccines.find(m => m.doseOption.label === label);
        return {
          label,
          dose: d.dose,
          dueDate: merged?.dueDate || '',
          status: (merged?.status || 'Upcoming') as MergedVaccine['status'],
          isTaken: merged?.status === 'Taken',
          doseNumber: idx + 1,
          daysUntil: merged?.daysUntilDue ?? null,
          ageLabel: d.ageLabel,
        };
      });

      const totalDoses = vInfo.doses.length;
      const givenDoses = doseStatuses.filter(d => d.isTaken).length;
      const remainingDoses = totalDoses - givenDoses;
      const isComplete = remainingDoses === 0;
      const nextDoseStatus = doseStatuses.find(d => !d.isTaken);

      map.set(vInfo.shortName, {
        vaccineInfo: vInfo,
        totalDoses,
        givenDoses,
        remainingDoses,
        percent: totalDoses > 0 ? Math.round((givenDoses / totalDoses) * 100) : 0,
        isComplete,
        nextDose: nextDoseStatus
          ? {
              label: nextDoseStatus.label,
              dose: nextDoseStatus.dose,
              dueDate: nextDoseStatus.dueDate,
              daysUntil: nextDoseStatus.daysUntil,
              ageLabel: nextDoseStatus.ageLabel,
              doseNumber: nextDoseStatus.doseNumber,
            }
          : null,
        doseStatuses,
      });
    }

    return map;
  }, [mergedVaccines, vaccineSchedule]);

  /* ─── Next Due Vaccines (soonest first) ─── */
  const nextDueVaccines = useMemo(() => {
    return Array.from(vaccineAggMap.values())
      .filter(agg => !agg.isComplete && agg.nextDose && agg.nextDose.dueDate)
      .sort((a, b) => {
        const dA = a.nextDose?.daysUntil ?? 99999;
        const dB = b.nextDose?.daysUntil ?? 99999;
        return dA - dB;
      })
      .slice(0, 5);
  }, [vaccineAggMap]);

  /* ─── Completed vaccines count ─── */
  const completedVaccinesCount = useMemo(() => {
    return Array.from(vaccineAggMap.values()).filter(a => a.isComplete).length;
  }, [vaccineAggMap]);

  /* ─── Grouped & filtered ─── */
  const groupedFiltered = useMemo(() => {
    return timingGroups.map(group => {
      const vaccines = group.vaccines
        .map(opt => mergedVaccines.find(m => m.doseOption.label === opt.label))
        .filter((m): m is MergedVaccine => !!m)
        .filter(m => {
          if (query) {
            const q = query.toLowerCase();
            const match = m.doseOption.label.toLowerCase().includes(q) ||
              m.doseOption.vaccineName.toLowerCase().includes(q) ||
              m.doseOption.description.toLowerCase().includes(q);
            if (!match) return false;
          }
          if (categoryFilter !== 'All' && m.doseOption.category !== categoryFilter) return false;
          if (statusFilter !== 'All' && m.status !== statusFilter) return false;
          return true;
        });

      const groupTaken = vaccines.filter(v => v.status === 'Taken').length;
      return { ...group, filteredVaccines: vaccines, groupTaken, groupTotal: vaccines.length };
    }).filter(g => g.filteredVaccines.length > 0);
  }, [timingGroups, mergedVaccines, query, categoryFilter, statusFilter]);

  /* ─── Toggle vaccine status ─── */
  const toggleVaccine = useCallback(async (merged: MergedVaccine) => {
    if (!user || saving) return;
    const label = merged.doseOption.label;
    setSaving(label);

    try {
      let newlyTaken = false;

      if (merged.savedRecord) {
        const newStatus = merged.savedRecord.status === 'Taken' ? 'Pending' : 'Taken';
        await db.updateVaccineStatus(user.id, merged.savedRecord.id, newStatus);
        newlyTaken = newStatus === 'Taken';
      } else {
        await db.addVaccine(user.id, {
          name: label,
          dueDate: merged.dueDate || new Date().toISOString().split('T')[0],
          status: 'Taken',
          notes: `${merged.doseOption.vaccineName} \u2014 ${merged.doseOption.dose}`,
        });
        newlyTaken = true;
      }

      const data = await db.getVaccines(user.id);
      setSavedVaccines(data);

      // Check if all doses of this vaccine are now completed → show celebration
      if (newlyTaken) {
        const vInfo = merged.vaccineInfo;
        const allDone = vInfo.doses.every(d => {
          const doseLabel = vInfo.doses.length === 1
            ? vInfo.shortName
            : `${vInfo.shortName} \u2013 ${d.dose}`;
          const saved = data.find((sv: VaccineRecord) => sv.name === doseLabel);
          return saved?.status === 'Taken';
        });
        if (allDone) {
          setCompletionToast(vInfo.shortName);
        }
      }
    } catch (err) {
      console.error('Failed to update vaccine:', err);
    }
    setSaving(null);
  }, [user, saving]);

  /* ─── Save child DOB ─── */
  const saveChildDob = useCallback(async (dob: string) => {
    setChildDob(dob);
    if (!user) return;
    try {
      await db.setUserMeta(user.id, { childDob: dob });
    } catch { /* ignore */ }
  }, [user]);

  /* ─── Group toggle helpers ─── */
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const expandAll = () => setExpandedGroups(new Set(groupedFiltered.map(g => g.group)));
  const collapseAll = () => setExpandedGroups(new Set());

  /* ─── Search dropdown ─── */
  const handleSearchSelect = (opt: VaccineDoseOption) => {
    setQuery(opt.label);
    setShowSearchDropdown(false);
    setSearchHighlight(-1);
    const group = timingGroups.find(g => g.vaccines.some(v => v.label === opt.label));
    if (group) {
      setExpandedGroups(prev => new Set([...prev, group.group]));
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSearchDropdown || searchResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchHighlight(prev => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchHighlight(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && searchHighlight >= 0) {
      e.preventDefault();
      handleSearchSelect(searchResults[searchHighlight]);
    } else if (e.key === 'Escape') {
      setShowSearchDropdown(false);
    }
  };

  /* ─── Status icons ─── */
  const statusIcons: Record<MergedVaccine['status'], React.ReactNode> = {
    Taken: <CheckCircle size={18} className="text-emerald-500" />,
    Pending: <Clock size={18} className="text-blue-500" />,
    Overdue: <AlertTriangle size={18} className="text-red-500" />,
    Upcoming: <CalendarIcon size={18} className="text-gray-400" />,
  };

  /* ═══════════════════════════════════════════════════════
     Loading state
     ═══════════════════════════════════════════════════════ */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Syringe size={48} className="mx-auto mb-4 text-teal-300 animate-pulse" />
          <p className="text-gray-400 font-medium">Loading vaccine schedule...</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════ */

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500 pb-20">

      {/* ══════════ Completion Toast ══════════ */}
      {completionToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[400] animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Award size={22} />
            </div>
            <div>
              <p className="font-bold text-sm">All {completionToast} doses completed successfully!</p>
              <p className="text-emerald-100 text-xs">Vaccination schedule fully completed &mdash; great job!</p>
            </div>
            <button onClick={() => setCompletionToast(null)} className="p-1 hover:bg-white/20 rounded-full ml-2">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════ Header + DOB ══════════ */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Syringe className="text-teal-600" size={28} />
            Vaccine Tracker
          </h1>
          <p className="text-gray-500 mt-1">
            {vaccineSchedule.length} vaccines &middot; {allDoseOptions.length} total doses &middot; {completedVaccinesCount} fully completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Baby size={18} className="text-teal-500" />
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Child&apos;s Date of Birth</label>
            <input
              type="date"
              value={childDob}
              onChange={e => saveChildDob(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-200 focus:border-teal-300 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ══════════ Progress Section ══════════ */}
      <div className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" stroke="#f0f0f0" strokeWidth="10" fill="none" />
              <circle
                cx="60" cy="60" r="52"
                stroke={stats.percent === 100 ? '#10b981' : '#14b8a6'}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - stats.percent / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-gray-800">{stats.percent}%</span>
              <span className="text-[10px] text-gray-400 font-medium">Complete</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
            {[
              { label: 'Completed', value: stats.taken, icon: <CheckCircle size={16} />, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', filterKey: 'Taken' as StatusFilter },
              { label: 'Pending', value: stats.pending, icon: <Clock size={16} />, color: 'text-blue-600 bg-blue-50 border-blue-100', filterKey: 'Pending' as StatusFilter },
              { label: 'Overdue', value: stats.overdue, icon: <AlertTriangle size={16} />, color: 'text-red-600 bg-red-50 border-red-100', filterKey: 'Overdue' as StatusFilter },
              { label: 'Remaining', value: stats.total - stats.taken, icon: <Syringe size={16} />, color: 'text-gray-600 bg-gray-50 border-gray-100', filterKey: 'All' as StatusFilter },
            ].map(stat => (
              <button
                key={stat.label}
                onClick={() => setStatusFilter(statusFilter === stat.filterKey && stat.filterKey !== 'All' ? 'All' : stat.filterKey)}
                className={`p-3 rounded-2xl flex items-center gap-2.5 border transition-all hover:scale-[1.02] ${stat.color} ${
                  statusFilter === stat.filterKey && stat.filterKey !== 'All' ? 'ring-2 ring-teal-400 ring-offset-1' : ''
                }`}
              >
                {stat.icon}
                <div className="text-left">
                  <span className="text-xl font-black block leading-none">{stat.value}</span>
                  <span className="text-[10px] font-medium opacity-70">{stat.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-4 border-t border-gray-50">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>{stats.taken} of {stats.total} doses completed</span>
            <span>{stats.total - stats.taken} remaining</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${stats.percent}%`,
                background: stats.percent === 100
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : 'linear-gradient(90deg, #14b8a6, #0d9488)',
              }}
            />
          </div>
        </div>

        {/* All-done achievement */}
        {stats.percent === 100 && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center gap-3">
            <Award size={24} className="text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-800 text-sm">{'\ud83c\udf89'} All vaccine doses completed successfully!</p>
              <p className="text-emerald-600 text-xs">Every vaccine in the schedule has been administered. Status: Completed</p>
            </div>
          </div>
        )}
      </div>

      {/* ══════════ Next Due Vaccines ══════════ */}
      {nextDueVaccines.length > 0 && childDob && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon size={14} />
            Next Scheduled Doses
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nextDueVaccines.map(agg => (
              <div
                key={agg.vaccineInfo.shortName}
                onClick={() => setDetailVaccine(agg.vaccineInfo)}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${agg.vaccineInfo.category === 'EPI' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
                      <Syringe size={14} />
                    </div>
                    <span className="font-bold text-sm text-gray-800">{agg.vaccineInfo.shortName}</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-teal-500 transition-colors" />
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Next: <span className="font-semibold text-gray-700">{agg.nextDose?.dose}</span>
                  {agg.totalDoses > 1 && (
                    <span className="text-gray-400"> (Dose {agg.nextDose?.doseNumber} of {agg.totalDoses})</span>
                  )}
                </p>
                {agg.nextDose?.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{formatDateShort(agg.nextDose.dueDate)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      agg.nextDose.daysUntil !== null && agg.nextDose.daysUntil < 0
                        ? 'bg-red-100 text-red-600'
                        : agg.nextDose.daysUntil !== null && agg.nextDose.daysUntil <= 7
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {getReminderText(agg.nextDose.daysUntil, true)}
                    </span>
                  </div>
                )}
                {/* Mini dose progress */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-400 rounded-full transition-all"
                      style={{ width: `${agg.percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">{agg.givenDoses}/{agg.totalDoses}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ Search + Filters ══════════ */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search with Dropdown */}
        <div className="flex-1 relative" ref={searchRef}>
          <div className="bg-white rounded-2xl border border-gray-100 flex items-center gap-3 px-4 shadow-sm">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search vaccines..."
              className="flex-1 py-3 bg-transparent outline-none font-medium text-gray-700 text-sm"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setShowSearchDropdown(true);
                setSearchHighlight(-1);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              onKeyDown={handleSearchKeyDown}
            />
            {query && (
              <button onClick={() => { setQuery(''); setShowSearchDropdown(false); }} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={14} />
              </button>
            )}
            <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${showSearchDropdown ? 'rotate-180' : ''}`} />
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
              {searchResults.length === 0 ? (
                <div className="px-5 py-4 text-sm text-gray-400 text-center">No vaccines found for &quot;{query}&quot;</div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {searchGrouped.map(group => (
                    <div key={group.group}>
                      <div className="sticky top-0 bg-gray-50 px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 z-10">
                        {group.group} ({group.items.length})
                      </div>
                      {group.items.map((opt) => {
                        const saved = savedVaccines.find(sv => sv.name === opt.label);
                        const isDone = saved?.status === 'Taken';
                        const agg = vaccineAggMap.get(opt.shortName);
                        return (
                          <button
                            key={opt.label}
                            onClick={() => handleSearchSelect(opt)}
                            className="w-full text-left px-5 py-2.5 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none hover:bg-teal-50/50"
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                              isDone ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {isDone ? <Check size={12} strokeWidth={3} /> : <Syringe size={12} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium truncate ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                  {opt.label}
                                </span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                                  opt.category === 'EPI' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-600'
                                }`}>
                                  {opt.category}
                                </span>
                                {isDone && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">Done</span>}
                                {agg && agg.totalDoses > 1 && (
                                  <span className="text-[9px] text-gray-400">{agg.givenDoses}/{agg.totalDoses}</span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 truncate">
                                {opt.ageLabel}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-1.5 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm">
          {(['All', 'EPI', 'Additional'] as CategoryFilter[]).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === cat
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Expand/Collapse */}
        <div className="flex gap-1.5">
          <button onClick={expandAll} className="px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-50 shadow-sm" title="Expand all">
            <ChevronDown size={16} />
          </button>
          <button onClick={collapseAll} className="px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-50 shadow-sm" title="Collapse all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Active filter indicator */}
      {(statusFilter !== 'All' || categoryFilter !== 'All' || query) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">Filters:</span>
          {statusFilter !== 'All' && (
            <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold flex items-center gap-1">
              {statusFilter}
              <button onClick={() => setStatusFilter('All')} className="ml-1 hover:text-red-500"><X size={10} /></button>
            </span>
          )}
          {categoryFilter !== 'All' && (
            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold flex items-center gap-1">
              {categoryFilter}
              <button onClick={() => setCategoryFilter('All')} className="ml-1 hover:text-red-500"><X size={10} /></button>
            </span>
          )}
          {query && (
            <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
              &quot;{query}&quot;
              <button onClick={() => setQuery('')} className="ml-1 hover:text-red-500"><X size={10} /></button>
            </span>
          )}
          <button
            onClick={() => { setStatusFilter('All'); setCategoryFilter('All'); setQuery(''); }}
            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
          >
            <RotateCcw size={10} /> Clear all
          </button>
        </div>
      )}

      {/* ══════════ Vaccine Groups ══════════ */}
      <div className="space-y-4">
        {groupedFiltered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-[28px] border border-dashed border-gray-200">
            <Search size={40} className="mx-auto mb-4 text-gray-200" />
            <p className="text-gray-400 font-medium">No vaccines match your filters.</p>
            <button
              onClick={() => { setStatusFilter('All'); setCategoryFilter('All'); setQuery(''); }}
              className="mt-3 text-teal-600 font-bold hover:underline text-sm"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          groupedFiltered.map(group => {
            const isExpanded = expandedGroups.has(group.group);
            const allGroupComplete = group.groupTaken === group.groupTotal && group.groupTotal > 0;
            return (
              <div key={group.group} className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.group)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-800">{group.group}</h3>
                      <p className="text-xs text-gray-400">
                        {group.groupTaken}/{group.groupTotal} completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Mini progress bar */}
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: group.groupTotal > 0 ? `${(group.groupTaken / group.groupTotal) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      allGroupComplete
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {allGroupComplete ? '\u2713 Done' : `${group.groupTotal - group.groupTaken} left`}
                    </span>
                  </div>
                </button>

                {/* Completion banner for fully-completed group */}
                {allGroupComplete && isExpanded && (
                  <div className="mx-6 mb-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                    <Award size={16} className="text-emerald-500 flex-shrink-0" />
                    <p className="text-xs text-emerald-700 font-medium">
                      All vaccine doses in this period completed successfully! Status: <span className="font-bold">Completed</span>
                    </p>
                  </div>
                )}

                {/* Group Content — Individual Dose Items */}
                {isExpanded && (
                  <div className="border-t border-gray-50 divide-y divide-gray-50">
                    {group.filteredVaccines.map(merged => {
                      const isSaving = saving === merged.doseOption.label;
                      const agg = vaccineAggMap.get(merged.doseOption.shortName);
                      const doseIdx = agg?.doseStatuses.findIndex(d => d.label === merged.doseOption.label) ?? -1;
                      const doseNumber = doseIdx + 1;
                      const totalForVaccine = agg?.totalDoses || 1;
                      const isMultiDose = totalForVaccine > 1;
                      const vaccineComplete = agg?.isComplete ?? false;

                      return (
                        <div
                          key={merged.doseOption.label}
                          className={`px-6 py-4 flex items-center gap-4 transition-all hover:bg-gray-50/50 ${
                            isSaving ? 'opacity-50 pointer-events-none' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleVaccine(merged)}
                            disabled={isSaving}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all border-2 ${
                              merged.status === 'Taken'
                                ? 'bg-emerald-500 border-emerald-500 text-white scale-100'
                                : 'bg-white border-gray-200 hover:border-teal-400 hover:bg-teal-50'
                            }`}
                          >
                            {merged.status === 'Taken' && <Check size={16} strokeWidth={3} />}
                          </button>

                          {/* Vaccine Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-semibold text-sm ${
                                merged.status === 'Taken' ? 'text-gray-400 line-through' : 'text-gray-800'
                              }`}>
                                {merged.doseOption.label}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                merged.doseOption.category === 'EPI'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-purple-100 text-purple-600'
                              }`}>
                                {merged.doseOption.category}
                              </span>
                              {/* Dose X of Y badge for multi-dose vaccines */}
                              {isMultiDose && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold">
                                  Dose {doseNumber} of {totalForVaccine}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-gray-400 truncate">
                                {merged.doseOption.vaccineName}
                              </p>
                              {/* Per-vaccine mini progress for multi-dose */}
                              {isMultiDose && agg && (
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${vaccineComplete ? 'bg-emerald-400' : 'bg-teal-400'}`}
                                      style={{ width: `${agg.percent}%` }}
                                    />
                                  </div>
                                  <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap">
                                    {agg.givenDoses}/{agg.totalDoses}
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Remaining doses info */}
                            {isMultiDose && agg && merged.status === 'Taken' && agg.remainingDoses > 0 && (
                              <p className="text-[10px] text-blue-500 mt-0.5 font-medium">
                                {agg.remainingDoses} more dose{agg.remainingDoses > 1 ? 's' : ''} remaining
                                {agg.nextDose?.dueDate && ` \u2022 Next: ${formatDateShort(agg.nextDose.dueDate)}`}
                              </p>
                            )}
                            {/* All done for this vaccine */}
                            {isMultiDose && vaccineComplete && merged.status === 'Taken' && (
                              <p className="text-[10px] text-emerald-600 mt-0.5 font-bold flex items-center gap-1">
                                <CheckCircle size={10} /> All {totalForVaccine} doses completed
                              </p>
                            )}
                          </div>

                          {/* Due Date / Reminder */}
                          <div className="text-right flex-shrink-0 hidden sm:block">
                            {merged.dueDate && merged.status !== 'Taken' ? (
                              <div>
                                <p className="text-xs text-gray-400">{formatDateShort(merged.dueDate)}</p>
                                <p className={`text-[11px] font-bold ${
                                  merged.status === 'Overdue' ? 'text-red-500' :
                                  merged.daysUntilDue !== null && merged.daysUntilDue <= 14 ? 'text-amber-500' :
                                  'text-gray-400'
                                }`}>
                                  {merged.reminderText}
                                </p>
                              </div>
                            ) : merged.status === 'Taken' ? (
                              <span className="text-xs text-emerald-500 font-medium">Completed &#10003;</span>
                            ) : (
                              <span className="text-xs text-gray-300">{merged.doseOption.ageLabel}</span>
                            )}
                          </div>

                          {/* Status Icon */}
                          <div className="flex-shrink-0">
                            {statusIcons[merged.status]}
                          </div>

                          {/* Info button */}
                          <button
                            onClick={() => setDetailVaccine(merged.vaccineInfo)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            title="View details"
                          >
                            <Info size={16} className="text-gray-300 hover:text-teal-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ══════════ Overdue Alert Banner ══════════ */}
      {stats.overdue > 0 && statusFilter !== 'Overdue' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={() => { setStatusFilter('Overdue'); expandAll(); }}
            className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-red-500/30 font-bold text-sm flex items-center gap-3 hover:bg-red-600 transition-colors"
          >
            <Bell size={18} className="animate-bounce" />
            {stats.overdue} overdue vaccine{stats.overdue > 1 ? 's' : ''} &mdash; Tap to view
          </button>
        </div>
      )}

      {/* ══════════ Detail Modal ══════════ */}
      {detailVaccine && (() => {
        const agg = vaccineAggMap.get(detailVaccine.shortName);
        return (
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setDetailVaccine(null)}
          >
            <div
              className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${detailVaccine.category === 'EPI' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
                    <Shield size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{detailVaccine.shortName}</h2>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      detailVaccine.category === 'EPI' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {detailVaccine.category === 'EPI' ? 'Government (EPI)' : 'Additional'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setDetailVaccine(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Full Name & Description */}
              <h3 className="text-base font-semibold text-gray-700 mb-2">{detailVaccine.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{detailVaccine.description}</p>

              {/* Dose Summary Card */}
              {agg && (
                <div className={`p-4 rounded-2xl mb-6 ${agg.isComplete ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-100'}`}>
                  <div className="grid grid-cols-3 gap-3 text-center mb-3">
                    <div>
                      <span className="text-2xl font-black text-gray-800">{agg.totalDoses}</span>
                      <p className="text-[10px] text-gray-500 font-medium">Total</p>
                    </div>
                    <div>
                      <span className="text-2xl font-black text-emerald-600">{agg.givenDoses}</span>
                      <p className="text-[10px] text-emerald-500 font-medium">Given</p>
                    </div>
                    <div>
                      <span className={`text-2xl font-black ${agg.remainingDoses > 0 ? 'text-blue-600' : 'text-gray-300'}`}>{agg.remainingDoses}</span>
                      <p className="text-[10px] text-gray-500 font-medium">Remaining</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${agg.isComplete ? 'bg-emerald-500' : 'bg-teal-500'}`}
                        style={{ width: `${agg.percent}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${agg.isComplete ? 'text-emerald-600' : 'text-gray-500'}`}>{agg.percent}%</span>
                  </div>
                  {/* Next scheduled dose */}
                  {!agg.isComplete && agg.nextDose && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Next: <strong className="text-gray-700">{agg.nextDose.dose}</strong>
                        {agg.totalDoses > 1 && ` (Dose ${agg.nextDose.doseNumber} of ${agg.totalDoses})`}
                      </span>
                      {agg.nextDose.dueDate && (
                        <span className="text-xs text-teal-600 font-medium">{formatDateShort(agg.nextDose.dueDate)}</span>
                      )}
                    </div>
                  )}
                  {/* Status label */}
                  <div className="mt-2 text-center">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                      agg.isComplete
                        ? 'bg-emerald-100 text-emerald-700'
                        : agg.givenDoses > 0
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      Status: {agg.isComplete ? 'Completed' : agg.givenDoses > 0 ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                </div>
              )}

              {/* Dose Timeline */}
              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Dose Timeline ({detailVaccine.doses.length} dose{detailVaccine.doses.length > 1 ? 's' : ''})
                </h4>
                <div className="relative">
                  {/* Connecting line */}
                  {detailVaccine.doses.length > 1 && (
                    <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-gray-200" />
                  )}
                  <div className="space-y-2 relative">
                    {detailVaccine.doses.map((dose, idx) => {
                      const label = detailVaccine.doses.length === 1
                        ? detailVaccine.shortName
                        : `${detailVaccine.shortName} \u2013 ${dose.dose}`;
                      const merged = mergedVaccines.find(m => m.doseOption.label === label);
                      const isDone = merged?.status === 'Taken';
                      const isOverdue = merged?.status === 'Overdue';
                      const isPending = merged?.status === 'Pending';
                      const isNext = !isDone && agg?.nextDose?.doseNumber === idx + 1;

                      let dueStr = '';
                      if (childDob) {
                        const dob = new Date(childDob);
                        const due = new Date(dob);
                        due.setDate(due.getDate() + dose.ageWeeks * 7);
                        dueStr = due.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                      }

                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all relative ${
                            isDone
                              ? 'bg-emerald-50 border-emerald-200'
                              : isNext
                              ? 'bg-teal-50 border-teal-200 ring-2 ring-teal-100'
                              : isOverdue
                              ? 'bg-red-50 border-red-200'
                              : 'bg-gray-50 border-gray-100'
                          }`}
                        >
                          {/* Step circle */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm z-10 ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : isOverdue
                              ? 'bg-red-500 text-white'
                              : isNext
                              ? 'bg-teal-500 text-white animate-pulse'
                              : 'bg-white border-2 border-gray-200 text-gray-400'
                          }`}>
                            {isDone ? <Check size={16} strokeWidth={3} /> : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold ${isDone ? 'text-emerald-700 line-through' : 'text-gray-700'}`}>
                                {dose.dose}
                              </span>
                              {detailVaccine.doses.length > 1 && (
                                <span className="text-[9px] text-gray-400">
                                  Dose {idx + 1} of {detailVaccine.doses.length}
                                </span>
                              )}
                              {isNext && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 font-bold animate-pulse">
                                  NEXT
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">{dose.ageLabel}</span>
                          </div>
                          {isDone ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Completed</span>
                          ) : isOverdue ? (
                            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Overdue</span>
                          ) : isPending ? (
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Pending</span>
                              {dueStr && <p className="text-[9px] text-gray-400 mt-0.5">{dueStr}</p>}
                            </div>
                          ) : (
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Upcoming</span>
                              {dueStr && <p className="text-[9px] text-gray-400 mt-0.5">{dueStr}</p>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Completion status footer */}
              {agg && (
                <div className={`p-4 rounded-2xl ${agg.isComplete ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200' : 'bg-gray-50 border border-gray-100'}`}>
                  {agg.isComplete ? (
                    <div className="text-center">
                      <p className="font-bold text-emerald-700 text-sm flex items-center justify-center gap-2">
                        <Award size={18} /> {'\ud83c\udf89'} All {detailVaccine.shortName} doses completed successfully!
                      </p>
                      <p className="text-emerald-600 text-xs mt-1">Status: Completed &middot; {agg.totalDoses} of {agg.totalDoses} doses administered</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-gray-700">
                          {agg.givenDoses}/{agg.totalDoses} doses given
                        </span>
                        <span className="text-xs text-gray-400">{agg.remainingDoses} remaining</span>
                      </div>
                      {agg.nextDose && agg.nextDose.dueDate && (
                        <p className="text-xs text-teal-600 mt-1">
                          Next scheduled: <strong>{agg.nextDose.dose}</strong> on {formatDateShort(agg.nextDose.dueDate)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Close */}
              <button
                onClick={() => setDetailVaccine(null)}
                className="w-full mt-6 py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default VaccineTracker;
