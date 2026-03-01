
import React, { useState, useEffect } from 'react';
import { Apple, Droplet, Plus, Trash2, Clock, Zap, Target } from 'lucide-react';
import { db } from '../services/db';
import { MealLog } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';

interface NutritionGoal {
  calorie_goal: number;
  protein_goal_g: number;
  carbs_goal_g: number;
  fat_goal_g: number;
  water_glasses: number;
}

const Nutrition: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: '', calories: 0, type: 'Breakfast' as any });
  const [waterCount, setWaterCount] = useState(0);
  // SQL: Nutrition goals loaded from nutrition_goals table
  const [goals, setGoals] = useState<NutritionGoal>({ calorie_goal: 2200, protein_goal_g: 75, carbs_goal_g: 180, fat_goal_g: 70, water_glasses: 10 });

  // SQL: Fetch nutrition goals from database
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const data = await apiFetch<{ goals: NutritionGoal[] }>('/api/nutrition/goals');
        if (data.goals && data.goals.length > 0) {
          setGoals(data.goals[0]);
        }
      } catch (err) {
        console.error('Failed to load nutrition goals from DB:', err);
      }
    };
    if (user) loadGoals();
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    const [logsData, hydration] = await Promise.all([
      db.getNutritionLogs(user.id),
      db.getHydration(user.id)
    ]);
    setLogs(logsData);
    setWaterCount(hydration);
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => {
      refreshData();
    };
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, [user]);

  const handleAdd = async () => {
    if (!user || !newMeal.name) return;
    await db.addNutritionLog(user.id, newMeal);
    await refreshData();
    setShowAdd(false);
    setNewMeal({ name: '', calories: 0, type: 'Breakfast' });
  };

  const updateWater = async (count: number) => {
    if (!user) return;
    const next = Math.max(0, count);
    await db.updateHydration(user.id, next);
    setWaterCount(next);
  };

  const totalCalories = logs.reduce((sum, log) => sum + Number(log.calories), 0);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nutrition & Hydration</h1>
          <p className="text-gray-500">Fuel your body and your baby with the right nutrients.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20}/> Log Meal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><Zap size={24}/></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Daily Calorie Goal</span>
          </div>
          <h3 className="text-4xl font-bold text-gray-800">{totalCalories} <span className="text-lg text-gray-400">/ {goals.calorie_goal}</span></h3>
          <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
            <div className="h-full bg-orange-400" style={{ width: `${Math.min(100, (totalCalories / goals.calorie_goal) * 100)}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><Droplet size={24}/></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hydration Tracker</span>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-bold text-gray-800">{waterCount} <span className="text-lg text-gray-400">Glasses</span></h3>
            <div className="flex gap-2">
               <button onClick={() => updateWater(waterCount - 1)} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all">-</button>
               <button onClick={() => updateWater(waterCount + 1)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"><Plus size={20}/></button>
            </div>
          </div>
          <div className="flex gap-1.5 pt-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`flex-1 h-2 rounded-full ${i < waterCount ? 'bg-blue-400' : 'bg-gray-100'}`}></div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <div className="p-3 bg-green-50 text-green-500 rounded-2xl"><Target size={24}/></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Macro Balance</span>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between text-xs font-bold"><span>Protein</span><span className="text-green-600">{goals.protein_goal_g}g</span></div>
             <div className="h-1.5 w-full bg-gray-50 rounded-full"><div className="h-full bg-green-400" style={{ width: `${Math.min(100, (goals.protein_goal_g / 120) * 100)}%` }}></div></div>
             <div className="flex justify-between text-xs font-bold"><span>Carbs</span><span className="text-blue-600">{goals.carbs_goal_g}g</span></div>
             <div className="h-1.5 w-full bg-gray-50 rounded-full"><div className="h-full bg-blue-400" style={{ width: `${Math.min(100, (goals.carbs_goal_g / 300) * 100)}%` }}></div></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Today's Meal Log</h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{new Date().toDateString()}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {logs.length === 0 ? (
            <div className="p-20 text-center text-gray-300 italic">No meals logged for today.</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                    <Apple size={24}/>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{log.name}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{log.type} • {log.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{log.calories} kcal</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Log Your Meal</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Meal Name</label>
                <input className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none" placeholder="e.g. Avocado Toast" value={newMeal.name} onChange={e => setNewMeal({...newMeal, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Calories</label>
                  <input type="number" className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none" placeholder="250" onChange={e => setNewMeal({...newMeal, calories: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Type</label>
                  <select className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none" onChange={e => setNewMeal({...newMeal, type: e.target.value as any})}>
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snack</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold">Cancel</button>
                <button onClick={handleAdd} className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-xl">Save Log</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nutrition;
