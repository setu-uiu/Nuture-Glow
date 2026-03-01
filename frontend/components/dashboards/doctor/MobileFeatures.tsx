import React from 'react';
import { Smartphone, Mic, CloudOff, Zap, Bell, Shield } from 'lucide-react';

const MobileFeatures: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Smartphone size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70">Mobile Experience</p>
            <h2 className="text-2xl font-bold">Always-on care for on-call shifts</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Mobile Toggles</h3>
          <div className="space-y-3">
            {[
              { label: 'Emergency consultations', color: 'text-rose-600' },
              { label: 'Offline access', color: 'text-amber-600' },
              { label: 'Voice commands', color: 'text-blue-600' },
              { label: 'Quick prescriptions', color: 'text-emerald-600' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                  <span className={`text-sm font-semibold ${item.color}`}>{item.label}</span>
                </div>
                <span className="text-xs font-semibold text-gray-500">Not configured</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 via-white to-white rounded-3xl border border-blue-100/70 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Mobile Readiness</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudOff size={16} className="text-amber-600" />
                <span>Offline sync</span>
              </div>
              <span className="font-semibold text-gray-500">--</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic size={16} className="text-blue-600" />
                <span>Voice control</span>
              </div>
              <span className="font-semibold text-gray-500">--</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-emerald-600" />
                <span>Quick Rx templates</span>
              </div>
              <span className="font-semibold text-gray-500">--</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-rose-600" />
                <span>Critical alerts</span>
              </div>
              <span className="font-semibold text-gray-500">--</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 via-white to-white rounded-3xl border border-emerald-100/70 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Shield size={20} className="text-emerald-600" />
          <h3 className="text-lg font-bold text-gray-900">On-call Safety</h3>
        </div>
        <p className="text-sm text-gray-600">
          Safety protocols will appear once mobile policies are configured.
        </p>
      </div>
    </div>
  );
};

export default MobileFeatures;
