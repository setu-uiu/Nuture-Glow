import React from 'react';
import { ShieldCheck, Hash, CheckCircle2 } from 'lucide-react';

interface HealthIdCardProps {
  user: any;
  healthIdStatus: string;
  healthIdStatusLabels: Record<string, string>;
  healthIdStatusClasses: Record<string, string>;
}

const HealthIdCard: React.FC<HealthIdCardProps> = ({
  user,
  healthIdStatus,
  healthIdStatusLabels,
  healthIdStatusClasses
}) => {
  return (
    <div className="relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      {/* Subtle decorative accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-t-2xl" />

      {/* Header */}
      <div className="flex items-center gap-2.5 mt-1 mb-4">
        <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
          <ShieldCheck size={18} />
        </div>
        <h3 className="text-sm font-bold text-gray-800">Health ID</h3>
      </div>

      {/* Info rows */}
      <div className="space-y-3">
        {/* Health ID Number */}
        <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl">
          <div className="p-1.5 bg-white rounded-lg shadow-sm text-slate-400">
            <Hash size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Your Health ID Number</p>
            <p className="text-sm font-bold text-gray-800 tracking-tight">{user.healthId}</p>
          </div>
        </div>

        {/* Verification Status */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl min-w-0"
          style={{
            backgroundColor: healthIdStatus === 'accepted' ? 'rgb(236 253 245 / 0.6)' 
              : healthIdStatus === 'pending' ? 'rgb(255 251 235 / 0.6)' 
              : 'rgb(248 250 252)'
          }}
        >
          <div className={`p-1.5 bg-white rounded-lg shadow-sm ${
            healthIdStatus === 'accepted' ? 'text-emerald-500' 
            : healthIdStatus === 'pending' ? 'text-amber-500' 
            : 'text-slate-400'
          }`}>
            <CheckCircle2 size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Verification Status</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${
                healthIdStatus === 'accepted' ? 'bg-emerald-500' : healthIdStatus === 'pending' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              <p className={`text-sm font-bold ${
                healthIdStatus === 'accepted' ? 'text-emerald-700' 
                : healthIdStatus === 'pending' ? 'text-amber-700' 
                : 'text-gray-800'
              }`}>
                {healthIdStatusLabels[healthIdStatus]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthIdCard;
