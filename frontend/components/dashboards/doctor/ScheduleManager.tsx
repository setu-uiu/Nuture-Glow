import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Save } from 'lucide-react';
import { DoctorDashboardService } from '../../../services/dashboardService';
import type { DoctorSchedule } from '../../../types/dashboard';

const ScheduleManager: React.FC = () => {
  const [schedule, setSchedule] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await DoctorDashboardService.getSchedule();
      setSchedule(data);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await DoctorDashboardService.updateSchedule(schedule);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to save schedule:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDay = (dayOfWeek: number) => {
    const existingDay = schedule.find(s => s.dayOfWeek === dayOfWeek);
    if (existingDay) {
      setSchedule(schedule.map(s => 
        s.dayOfWeek === dayOfWeek 
          ? { ...s, isAvailable: !s.isAvailable }
          : s
      ));
    } else {
      setSchedule([...schedule, {
        id: `new-${dayOfWeek}`,
        doctorId: '',
        dayOfWeek,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
        maxConsultations: 10
      }]);
    }
  };

  const handleUpdateTime = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(schedule.map(s => 
      s.dayOfWeek === dayOfWeek 
        ? { ...s, [field]: value }
        : s
    ));
  };

  const handleUpdateMax = (dayOfWeek: number, value: number) => {
    setSchedule(schedule.map(s => 
      s.dayOfWeek === dayOfWeek 
        ? { ...s, maxConsultations: value }
        : s
    ));
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-white/80 via-white/70 to-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 p-12 text-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-b from-white/80 via-white/70 to-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={24} className="text-teal-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Weekly Schedule</h2>
              <p className="text-sm text-gray-600">Set your availability for consultations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-all"
              >
                Edit Schedule
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-gradient-to-b from-white/80 via-white/70 to-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 p-6">
        <div className="space-y-3">
          {daysOfWeek.map((day, index) => {
            const daySchedule = schedule.find(s => s.dayOfWeek === index);
            const isAvailable = daySchedule?.isAvailable ?? false;

            return (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all ${
                  isAvailable
                    ? 'bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200/40'
                    : 'bg-gray-50/50 border-gray-200/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Day Name */}
                  <div className="flex items-center gap-4 min-w-[120px]">
                    <button
                      onClick={() => editMode && handleToggleDay(index)}
                      disabled={!editMode}
                      className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${
                        isAvailable
                          ? 'bg-teal-600 border-teal-600'
                          : 'bg-white border-gray-300'
                      } ${editMode ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                    >
                      {isAvailable && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`font-bold ${isAvailable ? 'text-teal-900' : 'text-gray-500'}`}>
                      {day}
                    </span>
                  </div>

                  {/* Time Settings */}
                  {isAvailable && (
                    <div className="flex items-center gap-4">
                      {/* Start Time */}
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-teal-600" />
                        <input
                          type="time"
                          value={daySchedule?.startTime || '09:00'}
                          onChange={(e) => editMode && handleUpdateTime(index, 'startTime', e.target.value)}
                          disabled={!editMode}
                          className="px-3 py-2 rounded-lg border border-gray-200/40 bg-white/80 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                        />
                      </div>

                      <span className="text-gray-400">to</span>

                      {/* End Time */}
                      <input
                        type="time"
                        value={daySchedule?.endTime || '17:00'}
                        onChange={(e) => editMode && handleUpdateTime(index, 'endTime', e.target.value)}
                        disabled={!editMode}
                        className="px-3 py-2 rounded-lg border border-gray-200/40 bg-white/80 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                      />

                      {/* Max Consultations */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Max:</span>
                        <input
                          type="number"
                          value={daySchedule?.maxConsultations || 10}
                          onChange={(e) => editMode && handleUpdateMax(index, parseInt(e.target.value))}
                          disabled={!editMode}
                          min={1}
                          max={50}
                          className="w-16 px-3 py-2 rounded-lg border border-gray-200/40 bg-white/80 text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                        />
                        <span className="text-xs text-gray-500">patients</span>
                      </div>
                    </div>
                  )}

                  {/* Unavailable Label */}
                  {!isAvailable && (
                    <span className="text-sm text-gray-500 italic">Not available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 rounded-xl bg-blue-50/50 border border-blue-200/40">
          <p className="text-sm text-blue-800">
            <span className="font-medium">💡 Tip:</span> Set your availability based on your preferred working hours. 
            Patients will be able to book consultations during these time slots.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;
