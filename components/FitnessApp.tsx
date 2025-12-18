
import React, { useState } from 'react';
import { Workout, Expense, Language, FitnessGoals } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '../translations';
import { getFamilyAdvice } from '../services/geminiService';

interface FitnessAppProps {
  workouts: Workout[];
  expenses: Expense[];
  language: Language;
  goals: FitnessGoals;
  onUpdateGoals: (goals: FitnessGoals) => void;
  onAddWorkout: (workout: Workout) => void;
}

const FitnessApp: React.FC<FitnessAppProps> = ({ workouts, expenses, language, goals, onUpdateGoals, onAddWorkout }) => {
  const t = useTranslation(language);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [tempGoals, setTempGoals] = useState<FitnessGoals>(goals);
  
  const [newWorkout, setNewWorkout] = useState({
    type: 'Running',
    duration: '',
    calories: '',
    date: new Date().toISOString().split('T')[0]
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayWorkouts = workouts.filter(w => w.date === todayStr);
  
  const todayCalories = todayWorkouts.reduce((acc, curr) => acc + curr.calories, 0);
  const todayMinutes = todayWorkouts.reduce((acc, curr) => acc + curr.duration, 0);

  const totalCalories = workouts.reduce((acc, curr) => acc + curr.calories, 0);
  const totalMinutes = workouts.reduce((acc, curr) => acc + curr.duration, 0);

  const calorieProgress = Math.min(100, (todayCalories / (goals.dailyCalories || 1)) * 100);
  const durationProgress = Math.min(100, (todayMinutes / (goals.dailyDuration || 1)) * 100);

  const chartData = workouts.slice(-7).map(w => ({
    name: w.date.split('-').slice(1).join('/'),
    calories: w.calories
  }));

  const handleSaveGoals = () => {
    onUpdateGoals(tempGoals);
    setIsEditingGoals(false);
  };

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkout.type || !newWorkout.duration || !newWorkout.calories) return;

    const workout: Workout = {
      id: `w-${Date.now()}`,
      type: newWorkout.type,
      duration: parseInt(newWorkout.duration),
      calories: parseInt(newWorkout.calories),
      date: newWorkout.date
    };

    onAddWorkout(workout);
    setIsAddingWorkout(false);
    setNewWorkout({ type: 'Running', duration: '', calories: '', date: todayStr });
  };

  const handleGetAiAdvice = async () => {
    setIsAiLoading(true);
    try {
      const advice = await getFamilyAdvice(expenses, workouts);
      setAiAdvice(advice);
    } catch (e) {
      console.error(e);
      setAiAdvice("Sorry, I couldn't generate advice right now.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">{t.fitnessTitle}</h2>
          <p className="text-gray-500 font-medium">Keep your family active and healthy.</p>
        </div>
        <button 
          onClick={() => setIsAddingWorkout(true)}
          className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-700 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Log Workout</span>
        </button>
      </div>

      {/* Workout Logging Form (Overlay) */}
      {isAddingWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 flex items-center">
                <span className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mr-4 text-xl shadow-inner">🏋️</span>
                Log Session
              </h3>
              <button onClick={() => setIsAddingWorkout(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddWorkout} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Activity Type</label>
                  <select 
                    value={newWorkout.type}
                    onChange={e => setNewWorkout({...newWorkout, type: e.target.value})}
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-orange-600/10 focus:border-orange-600 transition-all font-bold text-gray-900"
                  >
                    <option>Running</option>
                    <option>Yoga</option>
                    <option>Weight Lifting</option>
                    <option>Swimming</option>
                    <option>Cycling</option>
                    <option>HIIT</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Duration (mins)</label>
                    <input 
                      type="number" placeholder="45" value={newWorkout.duration}
                      onChange={e => setNewWorkout({...newWorkout, duration: e.target.value})}
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-orange-600/10 focus:border-orange-600 transition-all font-black text-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Calories Burned</label>
                    <input 
                      type="number" placeholder="300" value={newWorkout.calories}
                      onChange={e => setNewWorkout({...newWorkout, calories: e.target.value})}
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-orange-600/10 focus:border-orange-600 transition-all font-black text-xl"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Date</label>
                  <input 
                    type="date" value={newWorkout.date}
                    onChange={e => setNewWorkout({...newWorkout, date: e.target.value})}
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 pt-4">
                <button type="submit" className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all">
                  Log Entry
                </button>
                <button type="button" onClick={() => setIsAddingWorkout(false)} className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals Card */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-xl">🎯</div>
            <h3 className="text-xl font-black text-gray-900">{t.fitnessGoals}</h3>
          </div>
          {!isEditingGoals && (
            <button 
              onClick={() => { setTempGoals(goals); setIsEditingGoals(true); }}
              className="text-xs font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
            >
              {t.setGoals}
            </button>
          )}
        </div>

        {isEditingGoals ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.calorieGoal}</label>
              <input 
                type="number" 
                value={tempGoals.dailyCalories}
                onChange={(e) => setTempGoals({ ...tempGoals, dailyCalories: parseInt(e.target.value) || 0 })}
                className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-black text-xl"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.durationGoal}</label>
              <input 
                type="number" 
                value={tempGoals.dailyDuration}
                onChange={(e) => setTempGoals({ ...tempGoals, dailyDuration: parseInt(e.target.value) || 0 })}
                className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-black text-xl"
              />
            </div>
            <div className="md:col-span-2 flex items-center space-x-4">
              <button 
                onClick={handleSaveGoals}
                className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all"
              >
                {t.saveGoals}
              </button>
              <button 
                onClick={() => setIsEditingGoals(false)}
                className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t.calorieGoal}</p>
                  <p className="text-3xl font-black text-gray-900">{todayCalories} <span className="text-sm text-gray-400 font-bold">/ {goals.dailyCalories} kcal</span></p>
                </div>
                <p className="text-xl font-black text-orange-600">{Math.round(calorieProgress)}%</p>
              </div>
              <div className="w-full h-4 bg-gray-50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-1000 ease-out shadow-sm"
                  style={{ width: `${calorieProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t.durationGoal}</p>
                  <p className="text-3xl font-black text-gray-900">{todayMinutes} <span className="text-sm text-gray-400 font-bold">/ {goals.dailyDuration} mins</span></p>
                </div>
                <p className="text-xl font-black text-green-600">{Math.round(durationProgress)}%</p>
              </div>
              <div className="w-full h-4 bg-gray-50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-1000 ease-out shadow-sm"
                  style={{ width: `${durationProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 flex flex-col justify-between">
          <p className="text-xs text-orange-600 font-black uppercase tracking-widest mb-4">{t.totalCalories}</p>
          <p className="text-4xl font-black text-orange-900">{totalCalories}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100 flex flex-col justify-between">
          <p className="text-xs text-green-600 font-black uppercase tracking-widest mb-4">{t.activeMinutes}</p>
          <p className="text-4xl font-black text-green-900">{totalMinutes}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex flex-col justify-between">
          <p className="text-xs text-blue-600 font-black uppercase tracking-widest mb-4">{t.avgDay}</p>
          <p className="text-4xl font-black text-blue-900">{Math.round(totalCalories / (workouts.length || 1))}</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100 flex flex-col justify-between">
          <p className="text-xs text-purple-600 font-black uppercase tracking-widest mb-4">{t.workouts}</p>
          <p className="text-4xl font-black text-purple-900">{workouts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center">
              <span className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 mr-3 text-sm">📈</span>
              {t.caloriesBurned}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="calories" fill="#f97316" radius={[12, 12, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center">
              <span className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mr-3 text-sm">📋</span>
              {t.activityLog}
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {workouts.length > 0 ? workouts.map(w => (
                <div key={w.id} className="group flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-transparent hover:border-orange-100 hover:bg-white transition-all">
                  <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 text-xl shadow-sm group-hover:scale-110 transition-transform">
                      {w.type.toLowerCase().includes('run') ? '🏃' : w.type.toLowerCase().includes('yoga') ? '🧘' : w.type.toLowerCase().includes('swim') ? '🏊' : '🏋️'}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg leading-tight">{w.type}</p>
                      <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">{w.date} • {w.duration} mins</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-gray-900">{w.calories} kcal</p>
                  </div>
                </div>
              )) : (
                <p className="text-center py-10 text-gray-400 font-medium italic">No workouts recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900">{t.aiInsightsTitle}</h3>
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">✨</div>
            </div>
            <button 
              onClick={handleGetAiAdvice}
              disabled={isAiLoading}
              className="w-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50"
            >
              {isAiLoading ? t.loadingAdvice : t.getAdvice}
            </button>
            
            <div className="mt-8">
              {aiAdvice ? (
                <div className="prose prose-sm text-gray-600 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in duration-500">
                  <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                    {aiAdvice}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 opacity-40 text-center">
                  <div className="text-4xl mb-4">🧘</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-relaxed px-4">
                    {t.advicePlaceholder}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <h4 className="text-lg font-black uppercase tracking-widest mb-2">Pro Tip</h4>
            <p className="text-sm font-bold opacity-90 leading-relaxed">
              Family members who workout together are 40% more likely to stick to their daily goals!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitnessApp;
