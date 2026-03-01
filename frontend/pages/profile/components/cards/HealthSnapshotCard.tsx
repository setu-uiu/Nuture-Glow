import React from 'react';
import { Heart, Droplet, AlertTriangle } from 'lucide-react';
import { useTranslations } from '../../../../i18n/I18nContext';

interface HealthSnapshotCardProps {
  medical: any;
  healthIdStatus: string;
  lastVisit: string | null;
}

const HealthSnapshotCard: React.FC<HealthSnapshotCardProps> = ({
  medical,
  healthIdStatus,
  lastVisit
}) => {
  const { t } = useTranslations();

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl text-red-600">
          <Heart size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">Health Snapshot</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <span className="text-sm font-bold text-gray-600">Blood Group</span>
          <span className="text-lg font-bold text-gray-800">{medical.bloodGroup || '—'}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <span className="text-sm font-bold text-gray-600">Allergies</span>
          <span className="text-lg font-bold text-gray-800">{medical.allergies ? '⚠️ Yes' : '✓ None'}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <span className="text-sm font-bold text-gray-600">Diabetes</span>
          <span className="text-lg font-bold text-gray-800">{medical.diabetesStatus ? '⚠️ Yes' : '✓ No'}</span>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Status</p>
          <p className="text-sm font-bold text-gray-700">Health ID: <span className="text-teal-600">{healthIdStatus}</span></p>
          {lastVisit && <p className="text-xs text-gray-500 mt-2">Last visit: {lastVisit}</p>}
        </div>
      </div>
    </div>
  );
};

export default HealthSnapshotCard;
