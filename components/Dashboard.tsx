
import React from 'react';
import { Expense, Workout, HomeTask, Language, AppView } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { useTranslation } from '../translations';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface DashboardProps {
  expenses: Expense[];
  workouts: Workout[];
  tasks: HomeTask[];
  language: Language;
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, workouts, tasks, language, onNavigate }) => {
  const t = useTranslation(language);

  const financeData = expenses.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value).slice(0, 4);

  const fitnessData = workouts.slice(-5).map(w => ({
    name: w.date.split('-').slice(2).join('/'),
    calories: w.calories
  }));

  const pendingTasks = tasks.filter(task => task.status === 'pending');

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Finance Card */}
        <div 
          onClick={() => onNavigate(AppView.FINANCE)}
          className="card-glass p-8 rounded-[2.5rem] hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500/20"></div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-black text-gray-900 text-xl tracking-tight leading-none mb-2">{t.financeTitle}</h3>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Family Budget</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">💰</div>
          </div>
          <div className="flex items-center flex-1">
            <div className="w-1/2 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={financeData} 
                    innerRadius={35} 
                    outerRadius={50} 
                    paddingAngle={6} 
                    dataKey="value"
                    stroke="none"
                  >
                    {financeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => `$${value.toFixed(2)}`} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 pl-6 space-y-4">
              {financeData.map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="flex items-center justify-between text-[11px] font-black">
                    <span className="text-gray-400 uppercase tracking-tight truncate mr-2">{item.name}</span>
                    <span className="text-gray-900">${item.value.toFixed(0)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ 
                        width: `${Math.min(100, (item.value / (financeData[0]?.value || 1)) * 100)}%`,
                        backgroundColor: COLORS[idx % COLORS.length] 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fitness Card */}
        <div 
          onClick={() => onNavigate(AppView.FITNESS)}
          className="card-glass p-8 rounded-[2.5rem] hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-orange-500/20"></div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-black text-gray-900 text-xl tracking-tight leading-none mb-2">{t.fitnessTitle}</h3>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Activity Level</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🏋️</div>
          </div>
          <div className="h-44 -mx-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fitnessData}>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.03)'}} 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="calories" fill="#f97316" radius={[10, 10, 10, 10]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between items-center px-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Sessions</span>
            <span className="text-sm font-black text-orange-600">{fitnessData.length} Logged</span>
          </div>
        </div>

        {/* Tasks Card */}
        <div 
          onClick={() => onNavigate(AppView.HOME)}
          className="card-glass p-8 rounded-[2.5rem] hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-teal-500/20"></div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-black text-gray-900 text-xl tracking-tight leading-none mb-2">{t.homeTasksTitle}</h3>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Queue Status</p>
            </div>
            <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">📋</div>
          </div>
          <div className="space-y-4 flex-1">
            {pendingTasks.length > 0 ? (
              pendingTasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center space-x-4 p-4 bg-white/40 rounded-[1.5rem] border border-white/60 hover:bg-white/70 transition-colors">
                  <div className="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.4)] shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-bold truncate leading-tight">{task.title}</p>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider mt-0.5">{task.assignedTo}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 italic py-12">
                <div className="text-4xl mb-4 grayscale opacity-50">🎉</div>
                <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed">
                  {language === 'pt' ? 'Tudo em dia!' : 'All clear!'}
                </p>
              </div>
            )}
            {pendingTasks.length > 3 && (
              <div className="pt-2 flex items-center justify-center">
                <span className="px-4 py-1.5 bg-teal-500/10 text-teal-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                  +{pendingTasks.length - 3} {language === 'pt' ? 'Pendentes' : 'More'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
