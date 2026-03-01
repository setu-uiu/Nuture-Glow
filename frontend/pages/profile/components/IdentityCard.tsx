import React, { useState } from 'react';
import { User, Mail, Phone, Edit3, Check, X } from 'lucide-react';
import { useTranslations } from '../../../i18n/I18nContext';

interface IdentityCardProps {
  user: any;
  onSavePhone?: (phone: string) => Promise<void>;
}

const IdentityCard: React.FC<IdentityCardProps> = ({ user, onSavePhone }) => {
  const { t } = useTranslations();
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(user.phone || '');

  const handleSavePhone = async () => {
    if (!phoneValue.trim() || !onSavePhone) return;
    await onSavePhone(phoneValue.trim());
    setIsEditingPhone(false);
  };

  return (
    <div className="relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      {/* Subtle decorative accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 rounded-t-2xl" />

      {/* Header */}
      <div className="flex items-center gap-2.5 mt-1 mb-4">
        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
          <User size={18} />
        </div>
        <h3 className="text-sm font-bold text-gray-800">Personal Identity</h3>
      </div>

      {/* Info rows */}
      <div className="space-y-3">
        {/* Email row */}
        <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl">
          <div className="p-1.5 bg-white rounded-lg shadow-sm text-slate-400">
            <Mail size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
            <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
          </div>
        </div>

        {/* Phone row */}
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50/60 rounded-xl min-w-0">
          <div className="p-1.5 bg-white rounded-lg shadow-sm text-emerald-500">
            <Phone size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('profile.phone.title')}
            </p>
            {isEditingPhone ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="tel"
                  value={phoneValue}
                  onChange={(e) => setPhoneValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSavePhone();
                    if (e.key === 'Escape') setIsEditingPhone(false);
                  }}
                  placeholder={t('profile.phone.placeholder')}
                  autoFocus
                  className="text-sm font-bold text-gray-800 bg-white rounded-lg px-2 py-1 outline-none border border-emerald-300 w-full"
                />
                <button
                  onClick={handleSavePhone}
                  className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-all"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={() => setIsEditingPhone(false)}
                  className="p-1 bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a href={user.phone ? `tel:${user.phone}` : undefined} className="text-sm font-bold text-gray-800 truncate">
                  {user.phone || '—'}
                </a>
                {onSavePhone && (
                  <button
                    onClick={() => {
                      setPhoneValue(user.phone || '');
                      setIsEditingPhone(true);
                    }}
                    className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-all"
                    title={t('profile.phone.edit')}
                  >
                    <Edit3 size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityCard;
