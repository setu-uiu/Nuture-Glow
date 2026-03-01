import React from 'react';
import { Briefcase, FileText, CreditCard, Users, MapPin, BadgeCheck } from 'lucide-react';

const PracticeManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70">Practice Management</p>
            <h2 className="text-2xl font-bold">Billing, staff, and clinic operations</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="text-emerald-600" />
              <h3 className="text-lg font-bold text-gray-900">Billing & Invoicing</h3>
            </div>
            <button className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all">
              Generate Invoice
            </button>
          </div>
          <div className="p-4 rounded-2xl border border-gray-200 bg-white text-sm text-gray-600">
            No invoices available yet.
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 via-white to-white rounded-3xl border border-blue-100/70 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Insurance Claims</h3>
          </div>
          <div className="p-4 rounded-2xl border border-blue-100 bg-white text-sm text-gray-600">
            No insurance claims submitted yet.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Staff Management</h3>
          </div>
          <div className="p-4 rounded-2xl border border-gray-200 bg-white text-sm text-gray-600">
            No staff profiles added yet.
          </div>
          <button className="mt-4 w-full py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all">
            Invite Staff Member
          </button>
        </div>

        <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="text-emerald-600" />
            <h3 className="text-lg font-bold text-gray-900">Multi-location Support</h3>
          </div>
          <div className="p-4 rounded-2xl border border-gray-200 bg-white text-sm text-gray-600">
            No clinic locations configured yet.
          </div>
          <button className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
            <BadgeCheck size={16} />
            Add New Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeManagement;
