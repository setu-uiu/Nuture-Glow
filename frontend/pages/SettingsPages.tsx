
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Bell, Mail, MessageSquare, Monitor, Check, ChevronRight } from 'lucide-react';
import { useTranslations } from '../i18n/I18nContext';

export const LanguageSettings: React.FC = () => {
  const navigate = useNavigate();
  const { locale, setLocale, t } = useTranslations();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-teal-600 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('settings.lang.title')}</h1>
          <p className="text-gray-500">{t('settings.lang.desc')}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-4">
        {/* English Selection */}
        <div 
          onClick={() => setLocale('en')}
          className={`flex items-center justify-between p-6 border transition-all rounded-[32px] cursor-pointer group ${
            locale === 'en' ? 'bg-teal-50 border-teal-100' : 'bg-gray-50 border-transparent hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-white rounded-2xl shadow-sm ${locale === 'en' ? 'text-teal-600' : 'text-gray-400'}`}>
              <Globe size={24} />
            </div>
            <div>
              <p className={`font-bold transition-colors ${locale === 'en' ? 'text-gray-800' : 'text-gray-400'}`}>English</p>
              {locale === 'en' && <p className="text-xs text-teal-600 font-medium">{t('settings.lang.active')}</p>}
            </div>
          </div>
          {locale === 'en' && (
            <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
              <Check size={18} />
            </div>
          )}
        </div>

        {/* Bengali Selection */}
        <div 
          onClick={() => setLocale('bn')}
          className={`flex items-center justify-between p-6 border transition-all rounded-[32px] cursor-pointer group ${
            locale === 'bn' ? 'bg-teal-50 border-teal-100' : 'bg-gray-50 border-transparent hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-white rounded-2xl shadow-sm ${locale === 'bn' ? 'text-teal-600' : 'text-gray-400'}`}>
              <Globe size={24} />
            </div>
            <div>
              <p className={`font-bold transition-colors ${locale === 'bn' ? 'text-gray-800' : 'text-gray-400'}`}>Bengali (বাংলা)</p>
              {locale === 'bn' && <p className="text-xs text-teal-600 font-medium">{t('settings.lang.active')}</p>}
            </div>
          </div>
          {locale === 'bn' && (
            <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
              <Check size={18} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface NotificationChannels {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export const NotificationSettings: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();
  
  // Explicitly typing the state to NotificationChannels to fix potential 'any' inference
  const [channels, setChannels] = useState<NotificationChannels>(() => {
    const saved = localStorage.getItem('ng_notification_channels');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse notification settings", e);
      }
    }
    return { email: true, sms: true, push: true };
  });

  useEffect(() => {
    localStorage.setItem('ng_notification_channels', JSON.stringify(channels));
  }, [channels]);

  const toggleChannel = (key: keyof NotificationChannels) => {
    // Type checking for state update function
    setChannels((prev: NotificationChannels) => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationItems = [
    { key: 'email', icon: <Mail className="text-blue-500" />, label: t('settings.notif.email'), desc: t('settings.notif.emailDesc') },
    { key: 'sms', icon: <MessageSquare className="text-green-500" />, label: t('settings.notif.sms'), desc: t('settings.notif.smsDesc') },
    { key: 'push', icon: <Monitor className="text-slate-600" />, label: t('settings.notif.push'), desc: t('settings.notif.pushDesc') },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-teal-600 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('settings.notif.title')}</h1>
          <p className="text-gray-500">{t('settings.notif.desc')}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-4">
        {notificationItems.map((item) => {
          const isActive = channels[item.key];
          return (
            <div key={item.key} className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] transition-all border-2 border-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">{item.icon}</div>
                <div>
                  <p className="font-bold text-gray-700">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => toggleChannel(item.key)}
                className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner cursor-pointer focus:ring-4 focus:ring-teal-50 outline-none ${
                  isActive ? 'bg-teal-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                  isActive ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
