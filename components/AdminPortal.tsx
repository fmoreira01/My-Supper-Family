
import React from 'react';
import { Expense, Workout, MiniApp, Language } from '../types';
import { useTranslation } from '../translations';

interface AdminPortalProps {
  expenses: Expense[];
  workouts: Workout[];
  apps: MiniApp[];
  language: Language;
  onToggleApp: (appId: string) => void;
  onLanguageChange: (lang: Language) => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ expenses, workouts, apps, language, onToggleApp, onLanguageChange }) => {
  const t = useTranslation(language);

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border-l-8 border-indigo-600">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.adminTitle}</h2>
        <p className="text-gray-500">{t.adminSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm">
            <h3 className="text-xl font-bold mb-6">{t.language}</h3>
            <div className="flex space-x-4">
              <button 
                onClick={() => onLanguageChange('en')}
                className={`flex-1 flex items-center justify-center space-x-2 p-4 rounded-2xl border-2 transition-all ${language === 'en' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <span className="text-2xl">🇺🇸</span>
                <span className="font-bold">{t.en_us}</span>
              </button>
              <button 
                onClick={() => onLanguageChange('pt')}
                className={`flex-1 flex items-center justify-center space-x-2 p-4 rounded-2xl border-2 transition-all ${language === 'pt' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <span className="text-2xl">🇧🇷</span>
                <span className="font-bold">{t.pt_br}</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm">
            <h3 className="text-xl font-bold mb-6">{t.miniAppMgmt}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.map(app => (
                <div key={app.id} className={`p-4 rounded-2xl border ${app.status === 'active' ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${app.color} text-white`}>
                      <span className="text-2xl">{app.icon}</span>
                    </div>
                    <button 
                      onClick={() => onToggleApp(app.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        app.status === 'active' 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      {app.status === 'active' ? t.deactivate : t.activate}
                    </button>
                  </div>
                  <h4 className="font-bold text-gray-900">{app.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{app.description}</p>
                </div>
              ))}
              <div className="p-4 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-indigo-500 hover:border-indigo-500 cursor-pointer transition-all">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-bold">{t.registerNew}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm">
            <h3 className="text-xl font-bold mb-6">{t.masterDataAudit}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="font-bold text-gray-900">{t.expenseRecords}</p>
                  <p className="text-sm text-gray-500">{expenses.length} entries stored in encrypted storage</p>
                </div>
                <button className="text-indigo-600 font-bold text-sm hover:underline">{t.downloadCsv}</button>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="font-bold text-gray-900">{t.workoutLogs}</p>
                  <p className="text-sm text-gray-500">{workouts.length} entries sync'ed with family profile</p>
                </div>
                <button className="text-indigo-600 font-bold text-sm hover:underline">{t.downloadCsv}</button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
            <h3 className="text-lg font-bold mb-4">{t.systemStatus}</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t.coreEngine}</span>
                <span className="text-green-400 font-mono">v2.4.1-STABLE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t.redundancy}</span>
                <span className="text-green-400 font-mono">99.9%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t.devices}</span>
                <span className="text-blue-400 font-mono">4</span>
              </div>
              <div className="pt-4 border-t border-gray-800">
                <button className="w-full bg-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-colors">
                  {t.selfCheck}
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4">{t.recentLogs}</h3>
            <div className="space-y-3 text-xs font-mono text-gray-500">
              <div className="flex space-x-2">
                <span className="text-indigo-600">[20:45:12]</span>
                <span>Mini-app 'Finance' cache synced</span>
              </div>
              <div className="flex space-x-2">
                <span className="text-indigo-600">[19:30:05]</span>
                <span>AI recommendation engine batch process finished</span>
              </div>
              <div className="flex space-x-2">
                <span className="text-indigo-600">[18:15:22]</span>
                <span>User 'Dad' logged 500kcal workout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
