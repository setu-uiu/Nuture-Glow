import React from 'react';
import { ShieldCheck, FileText, Lock, BadgeCheck, DownloadCloud, CheckCircle } from 'lucide-react';
import type { DoctorProfile } from '../../../types/dashboard';

interface ComplianceCenterProps {
  profile: DoctorProfile;
}

const ComplianceCenter: React.FC<ComplianceCenterProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70">Compliance & Documentation</p>
            <h2 className="text-2xl font-bold">Secure, audited, and board-ready</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 via-white to-white rounded-3xl border border-emerald-100/70 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <BadgeCheck className="text-emerald-600" />
            <h3 className="text-lg font-bold text-gray-900">BMDC Verification</h3>
          </div>
          <p className="text-sm text-gray-600">
            Registration ID: <span className="font-semibold text-gray-900">{profile.bmdcNumber || '--'}</span>
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <CheckCircle size={16} className={profile.verified ? 'text-emerald-600' : 'text-gray-400'} />
            <span className={profile.verified ? 'text-emerald-700 font-semibold' : 'text-gray-500 font-semibold'}>
              {profile.verified ? 'Verified' : 'Not verified'}
            </span>
          </div>
          <button className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all">
            Update Credentials
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-50 via-white to-white rounded-3xl border border-blue-100/70 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Digital Signatures</h3>
          </div>
          <p className="text-sm text-gray-600">
            Digital signature configuration is not connected yet.
          </p>
          <div className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-500 text-center">
            Not configured
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 via-white to-white rounded-3xl border border-amber-100/70 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Lock className="text-amber-600" />
            <h3 className="text-lg font-bold text-gray-900">Data Protection</h3>
          </div>
          <p className="text-sm text-gray-600">Security status will appear once protection monitoring is connected.</p>
          <div className="mt-3 text-sm text-gray-700">
            <p>Encryption: <span className="font-semibold text-gray-500">--</span></p>
            <p>Last audit: <span className="font-semibold text-gray-500">--</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Audit Trail</h3>
          <div className="p-4 rounded-2xl border border-gray-200 bg-white text-sm text-gray-600">
            No audit events recorded yet.
          </div>
        </div>

        <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Regulatory Reporting</h3>
          <div className="p-4 rounded-2xl border border-gray-200 bg-white text-sm text-gray-600">
            No regulatory reports available yet.
          </div>
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
            <DownloadCloud size={20} className="text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Backup status unavailable</p>
              <p className="text-xs text-gray-500">Connect backup service to view history.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceCenter;
