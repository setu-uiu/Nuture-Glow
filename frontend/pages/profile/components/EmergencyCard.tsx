import React from 'react';
import { AlertCircle, Phone, Edit3, User, Heart } from 'lucide-react';

interface EmergencyCardProps {
  name?: string;
  phone?: string;
  relation?: string;
  onEdit: () => void;
}

const EmergencyCard: React.FC<EmergencyCardProps> = ({
  name,
  phone,
  relation,
  onEdit
}) => {
  const isComplete = name && phone && relation;

  return (
    <div className="relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      {/* Subtle decorative accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-red-400 to-orange-400 rounded-t-2xl" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mt-1 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-50 rounded-xl text-red-500">
            <AlertCircle size={18} />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Emergency Contact</h3>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-all"
          aria-label="Edit emergency contact"
        >
          <Edit3 size={13} />
          <span>Edit</span>
        </button>
      </div>

      {isComplete ? (
        <div className="space-y-3">
          {/* Name row */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl">
            <div className="p-1.5 bg-white rounded-lg shadow-sm text-slate-400">
              <User size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Name</p>
              <p className="text-sm font-bold text-gray-800 truncate">{name}</p>
            </div>
          </div>

          {/* Phone & Relation row */}
          <div className="grid grid-cols-[1fr,auto] gap-3">
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 p-3.5 bg-emerald-50/60 rounded-xl hover:bg-emerald-50 transition-colors min-w-0"
            >
              <div className="p-1.5 bg-white rounded-lg shadow-sm text-emerald-500">
                <Phone size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-bold text-gray-800 truncate">{phone}</p>
              </div>
            </a>

            <div className="flex items-center gap-3 p-3.5 bg-purple-50/50 rounded-xl min-w-[110px]">
              <div className="p-1.5 bg-white rounded-lg shadow-sm text-purple-400">
                <Heart size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Relation</p>
                <p className="text-sm font-bold text-gray-800 capitalize truncate">{relation}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 bg-gradient-to-br from-red-50/60 to-slate-50 rounded-xl border-2 border-dashed border-red-200/60 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
            <AlertCircle size={22} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">No Contact Added</p>
            <p className="text-xs text-slate-500 mt-1">Add someone to reach in urgent situations</p>
          </div>
          <button
            onClick={onEdit}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/20 active:scale-[0.98]"
          >
            + Add Emergency Contact
          </button>
        </div>
      )}
    </div>
  );
};

export default EmergencyCard;
