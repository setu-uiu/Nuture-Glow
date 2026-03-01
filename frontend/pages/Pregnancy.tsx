import React, { useState, useEffect } from 'react';
import { Baby, Info, Calendar, ChevronRight, Apple, Zap, Heart } from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';

interface WeekInfo {
  stage_name: string;
  baby_size: string;
  tips: string[];
  nutrients: string[];
  symptoms: string[];
}

const DEFAULT_WEEK_INFO: WeekInfo = {
  stage_name: 'Loading...',
  baby_size: '...',
  tips: [],
  nutrients: ['Loading nutrition data...'],
  symptoms: ['Loading symptom data...']
};

const Pregnancy: React.FC = () => {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(24);
  // SQL: Week info loaded from pregnancy_week_info table
  const [weekInfoMap, setWeekInfoMap] = useState<Record<number, WeekInfo>>({});

  // SQL: Fetch all pregnancy week info from database on mount
  useEffect(() => {
    const loadWeekInfo = async () => {
      try {
        const data = await apiFetch<{ items: (WeekInfo & { week_number: number })[] }>('/api/pregnancy/week-info');
        if (data.items && data.items.length > 0) {
          const map: Record<number, WeekInfo> = {};
          data.items.forEach(item => {
            map[item.week_number] = item;
          });
          setWeekInfoMap(map);
        }
      } catch (err) {
        console.error('Failed to load pregnancy week info from DB:', err);
      }
    };
    loadWeekInfo();
  }, []);

  useEffect(() => {
    const loadWeek = async () => {
      if (!user) return;
      const savedWeek = await db.getPregnancyWeek(user.id);
      setSelectedWeek(savedWeek);
    };
    loadWeek();
  }, [user]);

  const handleWeekChange = async (week: number) => {
    setSelectedWeek(week);
    if (user) await db.updatePregnancyWeek(user.id, week);
  };

  // SQL: Look up week info from database-loaded map, with fallback
  const getWeekInfo = (week: number): WeekInfo => {
    // Direct match
    if (weekInfoMap[week]) return weekInfoMap[week];
    // Fallback: find closest week or use trimester default
    const keys = Object.keys(weekInfoMap).map(Number).sort((a, b) => a - b);
    if (keys.length === 0) return DEFAULT_WEEK_INFO;
    // Find the closest week that is <= selected week
    let closest = keys[0];
    for (const k of keys) {
      if (k <= week) closest = k;
    }
    return weekInfoMap[closest] || DEFAULT_WEEK_INFO;
  };

  const current = getWeekInfo(selectedWeek);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 md:p-10 shadow-sm border border-emerald-100">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-md rounded-full border border-white/50 shadow-sm">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">{current.stage_name}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">Your Baby is the size <br/> of an <span className="text-emerald-700 italic">{current.baby_size}.</span></h1>
            <p className="text-base text-gray-600 font-light leading-relaxed">{current.tips && current.tips.length > 0 ? current.tips[0] : 'Track your pregnancy week by week.'}</p>
            <div className="flex gap-3 flex-wrap">
               <div className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-50 flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shadow-inner"><Calendar size={16}/></div>
                  <div><p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Weeks to Go</p><p className="font-bold text-gray-800 text-sm">{40 - selectedWeek} Weeks</p></div>
               </div>
               <div className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-50 flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600 shadow-inner"><Heart size={16}/></div>
                  <div><p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Due Date</p><p className="font-bold text-gray-800 text-sm">In ~{(40 - selectedWeek) * 7} Days</p></div>
               </div>
            </div>
          </div>
          <div className="flex justify-center">
             <div className="w-48 h-48 md:w-56 md:h-56 bg-white rounded-full flex items-center justify-center shadow-2xl relative">
                <Baby size={80} className="text-emerald-300" />
                <div className="absolute inset-0 rounded-full border-6 border-dashed border-emerald-100/50 animate-spin-slow"></div>
             </div>
          </div>
        </div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Timeline</h2>
          <div className="px-3 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-bold uppercase tracking-widest">Selected: Week {selectedWeek}</div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {[...Array(40)].map((_, i) => (
            <button 
              key={i} 
              onClick={() => handleWeekChange(i + 1)}
              className={`flex-shrink-0 w-12 h-12 rounded-lg font-bold text-sm transition-all border-2 flex items-center justify-center shadow-sm ${selectedWeek === i + 1 ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg scale-110' : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Apple size={18} className="text-green-500"/> Nutrients this stage</h3>
          <ul className="space-y-2">
             {current.nutrients.map((tip, i) => (
               <li key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg items-center group">
                 <div className="w-2 h-2 rounded-full bg-green-400 group-hover:scale-125 transition-transform"></div>
                 <span className="text-sm text-gray-700">{tip}</span>
               </li>
             ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Zap size={18} className="text-yellow-500"/> Symptoms to watch</h3>
          <ul className="space-y-2">
             {current.symptoms.map((tip, i) => (
               <li key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg items-center group">
                 <div className="w-2 h-2 rounded-full bg-yellow-400 group-hover:scale-125 transition-transform"></div>
                 <span className="text-sm text-gray-700">{tip}</span>
               </li>
             ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Pregnancy;
