
import React, { useState, useEffect } from 'react';
import { AppView, Expense, Workout, MiniApp, HomeTask, Language, FitnessGoals } from './types';
import FinanceApp from './components/FinanceApp';
import FitnessApp from './components/FitnessApp';
import HomeTasksApp from './components/HomeTasksApp';
import AdminPortal from './components/AdminPortal';
import Dashboard from './components/Dashboard';
import { useTranslation } from './translations';

const INITIAL_APPS: MiniApp[] = [
  { id: AppView.FINANCE, name: 'Finance', description: 'Budgeting & Expense Tracking', icon: '💰', color: 'bg-blue-500', status: 'active' },
  { id: AppView.FITNESS, name: 'Fitness', description: 'Activity & Health Monitoring', icon: '🏋️', color: 'bg-orange-500', status: 'active' },
  { id: AppView.HOME, name: 'Home Tasks', description: 'Chores & Home Management', icon: '📋', color: 'bg-teal-500', status: 'active' },
  { id: AppView.MARKETPLACE, name: 'Marketplace', description: 'Discover new mini-apps', icon: '🛒', color: 'bg-green-500', status: 'available' },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: '1', category: 'Groceries', amount: 85.50, date: '2023-10-24', description: 'Weekly groceries' },
  { id: '2', category: 'Dining', amount: 42.00, date: '2023-10-23', description: 'Pizza night' },
  { id: '3', category: 'Utilities', amount: 120.00, date: '2023-10-22', description: 'Electric bill' },
  { id: '4', category: 'Subscription', amount: 15.99, date: '2023-10-20', description: 'Streaming service', isRecurring: true, frequency: 'monthly', lastProcessedDate: '2023-10-20' },
];

const INITIAL_WORKOUTS: Workout[] = [
  { id: '1', type: 'Morning Run', duration: 30, date: new Date().toISOString().split('T')[0], calories: 350 },
  { id: '2', type: 'Weight Lifting', duration: 45, date: '2023-10-23', calories: 280 },
  { id: '3', type: 'Yoga', duration: 60, date: '2023-10-22', calories: 150 },
];

const INITIAL_HOME_TASKS: HomeTask[] = [
  { id: '1', title: 'Vacuum Living Room', category: 'Cleaning', assignedTo: 'Dad', dueDate: 'Today', status: 'pending' },
  { id: '2', title: 'Weekly Laundry', category: 'Laundry', assignedTo: 'Mom', dueDate: 'Tomorrow', status: 'pending' },
  { id: '3', title: 'Clean Kitchen Counters', category: 'Kitchen', assignedTo: 'Kid', dueDate: 'Today', status: 'completed' },
  { id: '4', title: 'Water Garden Plants', category: 'Garden', assignedTo: 'Dad', dueDate: 'Weekly', status: 'pending' },
];

const INITIAL_FITNESS_GOALS: FitnessGoals = {
  dailyCalories: 500,
  dailyDuration: 45
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [apps, setApps] = useState<MiniApp[]>(INITIAL_APPS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [workouts, setWorkouts] = useState<Workout[]>(INITIAL_WORKOUTS);
  const [homeTasks, setHomeTasks] = useState<HomeTask[]>(INITIAL_HOME_TASKS);
  const [fitnessGoals, setFitnessGoals] = useState<FitnessGoals>(INITIAL_FITNESS_GOALS);

  const t = useTranslation(language);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newExpenses: Expense[] = [];
    let updatedExpenses = [...expenses];

    updatedExpenses = updatedExpenses.map(exp => {
      if (exp.isRecurring && exp.frequency && exp.lastProcessedDate) {
        const lastDate = new Date(exp.lastProcessedDate);
        let nextDueDate = new Date(lastDate);
        
        if (exp.frequency === 'weekly') {
          nextDueDate.setDate(nextDueDate.getDate() + 7);
        } else if (exp.frequency === 'monthly') {
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }

        if (nextDueDate <= today) {
          const spawnedExpense: Expense = {
            ...exp,
            id: `${exp.id}-auto-${nextDueDate.getTime()}`,
            date: nextDueDate.toISOString().split('T')[0],
            description: `${exp.description} (${t.recurringAutoAdded})`,
            isRecurring: false,
            lastProcessedDate: undefined
          };
          newExpenses.push(spawnedExpense);
          return { ...exp, lastProcessedDate: nextDueDate.toISOString().split('T')[0] };
        }
      }
      return exp;
    });

    if (newExpenses.length > 0) {
      setExpenses([...newExpenses, ...updatedExpenses]);
    }
  }, []);

  const handleToggleApp = (appId: string) => {
    setApps(prev => prev.map(app => 
      app.id === appId 
      ? { ...app, status: app.status === 'active' ? 'installed' : 'active' } 
      : app
    ));
  };

  const handleToggleTask = (taskId: string) => {
    setHomeTasks(prev => prev.map(task => 
      task.id === taskId 
      ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' } 
      : task
    ));
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.FINANCE:
        return <FinanceApp expenses={expenses} language={language} onAddExpense={(e) => setExpenses([e, ...expenses])} />;
      case AppView.FITNESS:
        return (
          <FitnessApp 
            workouts={workouts} 
            expenses={expenses}
            language={language} 
            goals={fitnessGoals}
            onUpdateGoals={setFitnessGoals}
            onAddWorkout={(w) => setWorkouts([w, ...workouts])}
          />
        );
      case AppView.HOME:
        return <HomeTasksApp tasks={homeTasks} language={language} onToggleTask={handleToggleTask} />;
      case AppView.ADMIN:
        return (
          <AdminPortal 
            expenses={expenses} 
            workouts={workouts} 
            apps={apps} 
            language={language}
            onToggleApp={handleToggleApp} 
            onLanguageChange={setLanguage}
          />
        );
      case AppView.MARKETPLACE:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-green-100 text-green-600 p-8 rounded-full mb-8 shadow-inner">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t.marketplaceTitle}</h2>
            <p className="text-gray-500 text-xl max-w-lg mb-10">{t.marketplaceComingSoon}</p>
            <button 
              onClick={() => setCurrentView(AppView.DASHBOARD)}
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
            >
              {t.backToDashboard}
            </button>
          </div>
        );
      default:
        return (
          <div className="space-y-12">
            <header className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.5em] mb-1">Ecosystem Hub</p>
                <p className="text-gray-600 text-xl font-bold">{t.tagline}</p>
              </div>
              <div className="hidden lg:flex items-center space-x-3 card-glass px-6 py-4 rounded-[2rem]">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 leading-tight">Sync Active</p>
                  <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">Nodes Operational</p>
                </div>
              </div>
            </header>

            <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t.overviewTitle}</h2>
                <div className="h-[2px] flex-1 bg-gray-200/50 mx-8 rounded-full"></div>
              </div>
              <Dashboard 
                expenses={expenses} 
                workouts={workouts} 
                tasks={homeTasks} 
                language={language}
                onNavigate={setCurrentView}
              />
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* iOS Background Blobs */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#f0f2f5]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-orange-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-teal-200/30 rounded-full blur-[110px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Compact Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] md:sticky md:top-0 md:bottom-auto glass-effect border-t md:border-t-0 md:border-b shadow-xl md:shadow-none">
        <div className="max-w-6xl mx-auto px-8 h-16 md:h-20 flex items-center justify-between">
          <button
            onClick={() => setCurrentView(AppView.DASHBOARD)}
            className={`p-2.5 rounded-2xl flex items-center transition-all ${currentView === AppView.DASHBOARD ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'text-gray-400 hover:text-gray-900 hover:bg-white/50'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          
          <button
            onClick={() => setCurrentView(AppView.ADMIN)}
            className={`p-2.5 rounded-2xl flex items-center transition-all ${currentView === AppView.ADMIN ? 'bg-gray-900 text-white shadow-xl scale-110' : 'text-gray-400 hover:text-gray-900 hover:bg-white/50'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 pt-12 pb-24 md:pb-12">
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
          {renderContent()}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-8 py-12 border-t border-gray-200/50 flex flex-col md:flex-row justify-between items-center opacity-30">
        <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 md:mb-0">&copy; 2024 Node-Hub Governance</p>
        <div className="flex space-x-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Audit</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">License</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
