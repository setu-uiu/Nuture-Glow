import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Activity, Droplet, Weight, Clock, 
  ChevronRight, TrendingUp, History, Info, X, Save, Plus
} from 'lucide-react';
import { useTranslations } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';

const Health: React.FC = () => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { metric } = useParams();
  const navigate = useNavigate();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [activeMetric, setActiveMetric] = useState<any>(null);
  const [newValue, setNewValue] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  // Dynamic history data
  const [histories, setHistories] = useState<Record<string, {date: string, value: string}[]>>({});

  useEffect(() => {
    if (!user) return;
    const loadHistories = async () => {
      const keys = ['Heart Rate', 'Hydration', 'Weight', 'Sleep'];
      const updatedHistories: Record<string, {date: string, value: string}[]> = {};
      for (const key of keys) {
        const stored = await db.getHealthHistory(user.id, key);
        updatedHistories[key] = stored && stored.length > 0 ? stored : [];
      }
      setHistories(updatedHistories);
    };
    loadHistories();
    const handleUpdate = () => {
      loadHistories();
    };
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, [user]);

  // Scroll to metric if present in URL
  useEffect(() => {
    if (metric) {
      const element = document.getElementById(metric);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [metric]);

  const metrics = [
    { 
      label: t('health.heartRate'), 
      key: 'Heart Rate',
      id: 'heart-rate',
      unit: 'bpm', 
      icon: <Activity />, 
      color: 'text-red-500', 
      bg: 'bg-red-50',
    },
    { 
      label: t('health.hydration'), 
      key: 'Hydration',
      id: 'hydration',
      unit: 'L', 
      icon: <Droplet />, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50',
    },
    { 
      label: t('health.weight'), 
      key: 'Weight',
      id: 'weight',
      unit: 'kg', 
      icon: <Weight />, 
      color: 'text-orange-500', 
      bg: 'bg-orange-50',
    },
    { 
      label: t('health.sleep'), 
      key: 'Sleep',
      id: 'sleep',
      unit: '', 
      icon: <Clock />, 
      color: 'text-slate-600', 
      bg: 'bg-slate-50',
    },
  ];

  const handleOpenModal = (metric: any) => {
    setActiveMetric(metric);
    setNewValue('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setError('');
    setShowModal(true);
  };

  const handleSaveEntry = async () => {
    const val = parseFloat(newValue);
    if (isNaN(val) || val <= 0) {
      setError(t('health.error'));
      return;
    }

    if (!user || !activeMetric) return;

    const displayValue = `${newValue}${activeMetric.unit ? ' ' + activeMetric.unit : ''}`;
    const newRecord = { date: newDate, value: displayValue };

    await db.addHealthRecord(user.id, activeMetric.key, newRecord);
    
    // Update local state
    setHistories(prev => {
      const existing = prev[activeMetric.key] || [];
      return {
        ...prev,
        [activeMetric.key]: [newRecord, ...existing].slice(0, 10)
      };
    });

    setShowModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-teal-600 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('health.title')}</h1>
          <p className="text-gray-500">{t('health.desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {metrics.map((m, idx) => {
          const history = histories[m.key] || [];
          const currentVal = history[0]?.value.split(' ')[0] || '--';
          const isHighlighted = metric === m.id;

          return (
            <div 
              key={idx} 
              id={m.id}
              className={`bg-white rounded-[40px] shadow-sm border overflow-hidden flex flex-col transition-all duration-500 ${
                isHighlighted ? 'ring-4 ring-teal-500/20 border-teal-500 scale-[1.02]' : 'border-gray-100'
              }`}
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className={`w-14 h-14 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                    {m.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{currentVal} <span className="text-lg font-normal text-gray-400">{m.unit}</span></p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-3xl flex items-center gap-4 shadow-inner border border-gray-100">
                  <div className="p-2 bg-white rounded-xl text-teal-600 shadow-sm">
                    <TrendingUp size={18} />
                  </div>
                  <p className="text-sm font-medium text-gray-600 leading-tight">{t('health.stable')}</p>
                </div>
              </div>

              <div className="flex-1 bg-[#F7F5EF]/50 p-8 border-t border-gray-50 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <History size={14} /> {t('health.history')}
                </div>
                <div className="space-y-2">
                  {history.length > 0 ? (
                    history.slice(0, 3).map((h, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-none">
                        <span className="text-xs font-medium text-gray-500">{h.date}</span>
                        <span className="text-sm font-bold text-gray-800">{h.value}</span>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-xs text-gray-400 italic">{t('health.noRecords')}</p>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => handleOpenModal(m)}
                  className="w-full mt-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-400 hover:text-teal-600 transition-all cursor-pointer pointer-events-auto hover:border-teal-100 shadow-sm"
                >
                  {t('health.addEntry')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-teal-900 text-white p-10 rounded-[48px] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
        <div className="relative z-10 flex-1 space-y-4">
          <h3 className="text-3xl font-serif font-bold italic">{t('health.monitoring')}</h3>
          <p className="text-teal-200 font-light leading-relaxed max-w-lg">
            {t('health.monitoringDesc')}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
             <div className="px-4 py-2 bg-white/10 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest">Apple Health</div>
             <div className="px-4 py-2 bg-white/10 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest">Google Fit</div>
             <div className="px-4 py-2 bg-white/10 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest">Fitbit</div>
          </div>
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <button className="w-full md:w-auto px-10 py-5 bg-[#E6C77A] text-white rounded-3xl font-bold shadow-2xl shadow-[#E6C77A]/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs">
            {t('health.connect')}
          </button>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Manual Entry Modal */}
      {showModal && activeMetric && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{t('health.addValue', { label: activeMetric.label })}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">{t('health.value')} ({activeMetric.unit || 'n/a'})</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-4 focus:ring-teal-50 border-2 border-transparent focus:border-teal-100 transition-all font-bold text-lg"
                    placeholder={`e.g. 65`}
                    autoFocus
                    value={newValue}
                    onChange={e => {
                      setNewValue(e.target.value);
                      setError('');
                    }}
                  />
                  {activeMetric.unit && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                      {activeMetric.unit}
                    </span>
                  )}
                </div>
                {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-4">{error}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">{t('health.date')}</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-4 focus:ring-teal-50 border-2 border-transparent focus:border-teal-100 transition-all font-bold"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold transition-all hover:bg-gray-100"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  onClick={handleSaveEntry}
                  className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-xl shadow-teal-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {t('health.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Health;
