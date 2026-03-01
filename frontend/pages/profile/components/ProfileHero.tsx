import React from 'react';
import { User, ShieldCheck, Edit3, Camera, Check, X, Share2, Activity, Settings } from 'lucide-react';
import { useTranslations } from '../../../i18n/I18nContext';
import IdentityCard from './IdentityCard';
import HealthIdCard from './HealthIdCard';
import EmergencyCard from './EmergencyCard';

interface ProfileHeroProps {
  user: any;
  healthIdStatus: string;
  healthIdStatusLabels: Record<string, string>;
  healthIdStatusClasses: Record<string, string>;
  canRequestVerification: boolean;
  isEditingName: boolean;
  tempName: string;
  onStartEditName: () => void;
  onCancelEditName: () => void;
  onSaveName: () => void;
  onChangeName: (name: string) => void;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  avatarRef: React.RefObject<HTMLInputElement>;
  onShareHealth: () => void;
  onRequestVerification: () => void;
  onOpenSettings: () => void;
  showSettings: boolean;
  emergencyContact?: any;
  onEditEmergencyContact: () => void;
  onSavePhone?: (phone: string) => Promise<void>;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({
  user,
  healthIdStatus,
  healthIdStatusLabels,
  healthIdStatusClasses,
  canRequestVerification,
  isEditingName,
  tempName,
  onStartEditName,
  onCancelEditName,
  onSaveName,
  onChangeName,
  onAvatarUpload,
  avatarRef,
  onShareHealth,
  onRequestVerification,
  onOpenSettings,
  showSettings,
  emergencyContact,
  onEditEmergencyContact,
  onSavePhone
}) => {
  const { t } = useTranslations();

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/30 to-amber-50/20 border-b border-slate-200 py-8 md:py-16 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        {/* Main Profile Header - Premium Design */}
        <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
          {/* Avatar - Enhanced with Premium Styling */}
          <div className="relative group flex-shrink-0">
            <div className="w-36 h-36 md:w-48 md:h-48 rounded-3xl overflow-hidden ring-8 ring-amber-100/40 shadow-2xl bg-gradient-to-br from-white to-slate-50">
              <img src={user.avatar} loading="lazy" className="w-full h-full object-cover" alt={user.name} />
            </div>
            {/* Premium camera button */}
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute bottom-3 right-3 p-3 bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-2xl shadow-lg shadow-amber-600/30 hover:shadow-xl hover:from-amber-700 hover:to-amber-800 transition-all border-4 border-white group-hover:scale-110"
            >
              <Camera size={20} />
            </button>
            <input type="file" ref={avatarRef} className="hidden" accept="image/*" onChange={onAvatarUpload} />
          </div>

          {/* Name & Basic Info - Premium Typography */}
          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={tempName}
                    onChange={(e) => onChangeName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSaveName();
                      if (e.key === 'Escape') onCancelEditName();
                    }}
                    autoFocus
                    className="text-4xl md:text-5xl font-serif font-bold text-gray-900 bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-2xl px-6 py-3 outline-none border-2 border-amber-300 max-w-md transition-all"
                    aria-label={t('profile.editUsername')}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={onSaveName}
                      className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-90"
                      aria-label={t('profile.saveName')}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={onCancelEditName}
                      className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-all active:scale-90"
                      aria-label={t('profile.cancelEdit')}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 group/name">
                    <div className="space-y-1">
                      <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">{user.name}</h1>
                      <p className="text-sm text-amber-700 font-semibold tracking-wider">{t('profile.hero.member')}</p>
                    </div>
                    <button
                      onClick={onStartEditName}
                      className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50/50 rounded-lg transition-all md:opacity-0 md:group-hover/name:opacity-100 focus:opacity-100"
                      aria-label={t('profile.editUsername')}
                    >
                      <Edit3 size={20} />
                    </button>
                  </div>
                  <div
                    className={`w-fit px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
                      user.verified === 'Verified' 
                        ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {user.verified === 'Verified' ? <ShieldCheck size={14} /> : <Activity size={14} />}
                    {user.verified === 'Verified' ? t('profile.verified') : t('profile.notVerified')}
                  </div>
                </div>
              )}
              <p className="text-gray-600 font-medium text-sm">{user.email}</p>
            </div>

            {/* Action Buttons - Premium Styling */}
            <div className="flex flex-wrap gap-3 pt-6">
              <button
                onClick={onShareHealth}
                className="px-7 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:from-emerald-700 hover:to-emerald-800 active:scale-95 transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
              >
                <Share2 size={16} /> {t('profile.shareId')}
              </button>
              <button
                onClick={onRequestVerification}
                disabled={!canRequestVerification}
                className={`px-7 py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 text-xs uppercase tracking-wider ${
                  canRequestVerification
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-600/20 hover:shadow-lg hover:from-amber-700 hover:to-amber-800 active:scale-95'
                    : 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400'
                }`}
              >
                {t('profile.requestVerification')}
              </button>
              <button
                onClick={onOpenSettings}
                className={`p-3 rounded-xl transition-all ${
                  showSettings
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Hero Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <IdentityCard user={user} onSavePhone={onSavePhone} />
          <HealthIdCard
            user={user}
            healthIdStatus={healthIdStatus}
            healthIdStatusLabels={healthIdStatusLabels}
            healthIdStatusClasses={healthIdStatusClasses}
          />
          <EmergencyCard
            name={emergencyContact?.name}
            phone={emergencyContact?.phone}
            relation={emergencyContact?.relation}
            onEdit={onEditEmergencyContact}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileHero;
