import React, { useState, useRef } from 'react';
import { X, AlertTriangle, RefreshCw, Globe, Bell, ChevronLeft, Camera, Upload } from 'lucide-react';
import { useTranslations } from '../../../i18n/I18nContext';
import type { Language } from '../../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showResetConfirm: boolean;
  onShowResetConfirm: () => void;
  onCancelReset: () => void;
  onConfirmReset: () => void;
  onChangePhoto?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentAvatar?: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  showResetConfirm,
  onShowResetConfirm,
  onCancelReset,
  onConfirmReset,
  onChangePhoto,
  currentAvatar
}) => {
  const { t, locale, setLocale } = useTranslations();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [selectedSetting, setSelectedSetting] = useState<'main' | 'language' | 'notifications' | 'danger' | 'photo'>('main');
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('nurture_glow_notifications');
      return saved ? JSON.parse(saved) : { email: true, push: true, sms: false };
    } catch {
      return { email: true, push: true, sms: false };
    }
  });

  if (!isOpen) return null;

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' }
  ];

  const handleLanguageChange = (code: Language) => {
    setLocale(code);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem('nurture_glow_notifications', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-amber-50/30 px-8 py-6 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {selectedSetting !== 'main' && (
              <button
                onClick={() => setSelectedSetting('main')}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-all"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-2xl font-serif text-gray-900">
              {selectedSetting === 'main' && 'Settings'}
              {selectedSetting === 'photo' && 'Profile Photo'}
              {selectedSetting === 'language' && 'Language'}
              {selectedSetting === 'notifications' && 'Notifications'}
              {selectedSetting === 'danger' && 'Danger Zone'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Main Settings Menu */}
          {selectedSetting === 'main' && (
            <div className="space-y-4">
              {/* Profile Photo Option */}
              <button
                onClick={() => setSelectedSetting('photo')}
                className="w-full p-6 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-all">
                    <Camera size={24} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700">Profile Photo</h3>
                    <p className="text-xs text-gray-500 mt-1">Change your profile picture</p>
                  </div>
                  <ChevronLeft size={20} className="text-gray-400 rotate-180 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>

              {/* Language Option */}
              <button
                onClick={() => setSelectedSetting('language')}
                className="w-full p-6 rounded-xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-all">
                    <Globe size={24} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-700">Language</h3>
                    <p className="text-xs text-gray-500 mt-1">Choose your preferred language</p>
                  </div>
                  <ChevronLeft size={20} className="text-gray-400 rotate-180 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>

              {/* Notifications Option */}
              <button
                onClick={() => setSelectedSetting('notifications')}
                className="w-full p-6 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-all">
                    <Bell size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">Notifications</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage your notification preferences</p>
                  </div>
                  <ChevronLeft size={20} className="text-gray-400 rotate-180 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>

              {/* Danger Zone Option */}
              <button
                onClick={() => setSelectedSetting('danger')}
                className="w-full p-6 rounded-xl border-2 border-red-200 hover:border-red-400 hover:bg-red-50/50 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-all">
                    <AlertTriangle size={24} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-700">Danger Zone</h3>
                    <p className="text-xs text-gray-500 mt-1">Reset or delete your data</p>
                  </div>
                  <ChevronLeft size={20} className="text-gray-400 rotate-180 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            </div>
          )}

          {/* Language Settings Detail */}
          {selectedSetting === 'language' && (
            <div className="space-y-3">
              {languages.map((lang) => (
                <label
                  key={lang.code}
                  className="flex items-center p-4 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 cursor-pointer transition-all group"
                >
                  <input
                    type="radio"
                    name="language"
                    value={lang.code}
                    checked={locale === lang.code}
                    onChange={() => handleLanguageChange(lang.code)}
                    className="w-5 h-5 text-amber-600 cursor-pointer accent-amber-600"
                  />
                  <span className="ml-3 text-2xl mr-3">{lang.flag}</span>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-amber-700">
                    {lang.name}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Notifications Settings Detail */}
          {selectedSetting === 'notifications' && (
            <div className="space-y-3">
              <label className="flex items-start p-5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all group">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer accent-blue-600 mt-0.5"
                />
                <div className="ml-4 flex-1">
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">{t('settings.notif.email')}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('settings.notif.emailDesc')}</p>
                </div>
              </label>

              <label className="flex items-start p-5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all group">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) => handleNotificationChange('push', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer accent-blue-600 mt-0.5"
                />
                <div className="ml-4 flex-1">
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">{t('settings.notif.push')}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('settings.notif.pushDesc')}</p>
                </div>
              </label>

              <label className="flex items-start p-5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all group">
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer accent-blue-600 mt-0.5"
                />
                <div className="ml-4 flex-1">
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">{t('settings.notif.sms')}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('settings.notif.smsDesc')}</p>
                </div>
              </label>
            </div>
          )}

          {/* Profile Photo Settings Detail */}
          {selectedSetting === 'photo' && (
            <div className="space-y-6">
              {/* Current Avatar Preview */}
              <div className="flex flex-col items-center py-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-emerald-100 shadow-xl bg-gradient-to-br from-white to-slate-50">
                    {currentAvatar ? (
                      <img src={currentAvatar} loading="lazy" className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                        <Camera size={40} className="text-emerald-300" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4 font-medium">Current Profile Photo</p>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={photoInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (onChangePhoto) {
                    onChangePhoto(e);
                    // Close modal after successful upload
                    setTimeout(() => {
                      setSelectedSetting('main');
                      onClose();
                    }, 500);
                  }
                }}
              />

              {/* Upload Button */}
              <button
                onClick={() => photoInputRef.current?.click()}
                className="w-full p-6 rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-all">
                    <Upload size={28} className="text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700">
                      Choose New Photo
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG or GIF (max 5MB)
                    </p>
                  </div>
                </div>
              </button>

              {/* Tips */}
              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                <h4 className="text-sm font-semibold text-emerald-800 mb-2">Tips for a great profile photo:</h4>
                <ul className="text-xs text-emerald-700 space-y-1">
                  <li>• Use a clear, recent photo of yourself</li>
                  <li>• Make sure your face is visible</li>
                  <li>• Choose a well-lit photo</li>
                  <li>• Square images work best</li>
                </ul>
              </div>
            </div>
          )}

          {/* Danger Zone Detail */}
          {selectedSetting === 'danger' && (
            <div className="space-y-4">
              <p className="text-sm text-red-700/70 font-medium">{t('profile.resetDesc')}</p>

              {showResetConfirm ? (
                <div className="flex gap-3 animate-in zoom-in-95">
                  <button
                    onClick={onCancelReset}
                    className="flex-1 py-3 bg-slate-100 text-gray-700 rounded-lg font-semibold border border-slate-200 hover:bg-slate-200 transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={onConfirmReset}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all"
                  >
                    {t('profile.confirmReset')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={onShowResetConfirm}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-red-600 rounded-lg font-semibold border-2 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all w-full"
                >
                  <RefreshCw size={18} /> {t('profile.resetBtn')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer - Save Button (only on main view) */}
        {selectedSetting === 'main' && (
          <div className="border-t border-slate-200 bg-slate-50 px-8 py-4">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-lg font-semibold shadow-lg shadow-amber-700/20 hover:from-amber-800 hover:to-amber-900 transition-all"
            >
              Close Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
