
import React, { useState, useCallback, useEffect } from 'react';
import { Expense, Language } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { analyzeFinanceTrends } from '../services/geminiService';
import { useTranslation } from '../translations';
import PlaidLink from './PlaidLink';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f43f5e', '#8b5cf6', '#0ea5e9', '#64748b'];

const CATEGORY_MAP: Record<string, string> = {
  'Groceries': '🛒',
  'Dining': '🍕',
  'Travel': '✈️',
  'Utilities': '⚡',
  'Subscription': '🍿',
  'Shopping': '🛍️',
  'Health': '🏥',
  'Education': '🎓',
  'Other': '📦'
};

const EXPENSE_CATEGORIES = Object.keys(CATEGORY_MAP);

interface WebhookLog {
  id: string;
  type: string;
  timestamp: string;
  payload: any;
}

const FinanceApp: React.FC<{ expenses: Expense[], language: Language, onAddExpense: (e: Expense) => void }> = ({ expenses, language, onAddExpense }) => {
  const t = useTranslation(language);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTips, setAiTips] = useState<{title: string, suggestion: string}[]>([]);
  
  // Plaid integration state
  const [isLinked, setIsLinked] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Webhook State
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isWebhookProcessing, setIsWebhookProcessing] = useState(false);

  // Manual Expense State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'Groceries',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isRecurring: false,
    frequency: 'monthly' as 'weekly' | 'monthly'
  });

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const data = expenses.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []);

  const handleGetAiTips = async () => {
    setIsAiLoading(true);
    try {
      const tips = await analyzeFinanceTrends(expenses);
      setAiTips(tips);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePlaidSuccess = (publicToken: string, publicKey: string) => {
    setIsSyncing(true);
    setSyncError(null);
    
    setTimeout(() => {
      const mockTransactions: Expense[] = [
        { id: `p-${Date.now()}-1`, category: 'Travel', amount: 1240.00, date: new Date().toISOString().split('T')[0], description: 'Family Vacation Booking' },
        { id: `p-${Date.now()}-2`, category: 'Dining', amount: 65.20, date: new Date().toISOString().split('T')[0], description: 'Starbucks Coffee - Morning' },
        { id: `p-${Date.now()}-3`, category: 'Subscription', amount: 14.99, date: new Date().toISOString().split('T')[0], description: 'Netflix Family' },
      ];
      
      mockTransactions.forEach(onAddExpense);
      setIsLinked(true);
      setIsSyncing(false);
      setLastSynced(new Date().toLocaleTimeString());
      addWebhookLog('INITIAL_UPDATE', { transactions_added: 3 });
    }, 2500);
  };

  const addWebhookLog = (type: string, payload: any) => {
    const newLog: WebhookLog = {
      id: `wh-${Date.now()}`,
      type,
      timestamp: new Date().toLocaleTimeString(),
      payload
    };
    setWebhookLogs(prev => [newLog, ...prev].slice(0, 5));
  };

  const simulateWebhookEvent = () => {
    if (!isLinked) return;
    setIsWebhookProcessing(true);
    
    setTimeout(() => {
      const randomCategory = EXPENSE_CATEGORIES[Math.floor(Math.random() * EXPENSE_CATEGORIES.length)];
      const randomAmount = parseFloat((Math.random() * 150 + 5).toFixed(2));
      
      const incomingExpense: Expense = {
        id: `wh-tx-${Date.now()}`,
        category: randomCategory,
        amount: randomAmount,
        date: new Date().toISOString().split('T')[0],
        description: `External sync: ${randomCategory} purchase`
      };

      addWebhookLog('DEFAULT_UPDATE', { 
        new_transactions: 1, 
        item_id: "item_Lnb7vVkbvV",
        webhook_code: "DEFAULT_UPDATE"
      });
      
      onAddExpense(incomingExpense);
      setIsWebhookProcessing(false);
      setLastSynced(new Date().toLocaleTimeString());
    }, 1200);
  };

  const handlePlaidError = useCallback((errorMessage: string) => {
    setSyncError(errorMessage);
    setIsSyncing(false);
  }, []);

  const handleAddManualExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.amount || !newExpense.description) return;

    const expense: Expense = {
      id: `m-${Date.now()}`,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date,
      description: newExpense.description,
      isRecurring: newExpense.isRecurring,
      frequency: newExpense.isRecurring ? newExpense.frequency : undefined,
      lastProcessedDate: newExpense.isRecurring ? newExpense.date : undefined
    };

    onAddExpense(expense);
    setIsFormOpen(false);
    setNewExpense({
      category: 'Groceries',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      isRecurring: false,
      frequency: 'monthly'
    });
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">{t.financeTitle}</h2>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-gray-500 font-medium">Comprehensive family asset management.</p>
            {isLinked && (
              <div className="flex items-center bg-green-50 px-3 py-1 rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-2"></span>
                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{t.webhookActive}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{t.addExpense}</span>
          </button>
          <div className="flex-1 md:flex-none bg-white px-8 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 min-w-[200px]">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">{t.totalSpent}</p>
              <p className="text-2xl font-black text-gray-900 leading-none">${totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Manual Entry Form */}
          {isFormOpen && (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-indigo-50 animate-in slide-in-from-top-6 duration-300">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 flex items-center">
                  <span className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mr-4 text-lg shadow-inner">✍️</span>
                  {t.manualEntry}
                </h3>
                <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleAddManualExpense} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">{t.categoryLabel}</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {EXPENSE_CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewExpense({...newExpense, category: cat})}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all space-y-2 ${newExpense.category === cat ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                          <span className="text-2xl">{CATEGORY_MAP[cat]}</span>
                          <span className="text-[10px] font-black uppercase tracking-tight text-gray-700">{cat}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">{t.amountLabel}</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400 text-lg">$</span>
                      <input 
                        type="number" step="0.01" placeholder="0.00" value={newExpense.amount}
                        onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                        className="w-full p-4 pl-10 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-black text-xl text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">{t.dateLabel}</label>
                    <input 
                      type="date" value={newExpense.date}
                      onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-bold text-gray-900"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">{t.descriptionLabel}</label>
                    <input 
                      type="text" placeholder="e.g. Weekly Groceries" value={newExpense.description}
                      onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={newExpense.isRecurring}
                        onChange={e => setNewExpense({...newExpense, isRecurring: e.target.checked})}
                        className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500 border-gray-300 transition-all cursor-pointer"
                      />
                      <span className="text-sm font-black text-gray-700 uppercase tracking-widest">{t.isRecurringLabel}</span>
                    </label>
                    {newExpense.isRecurring && (
                      <div className="flex items-center space-x-4 animate-in fade-in slide-in-from-left-4">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.frequencyLabel}:</span>
                        <select 
                          value={newExpense.frequency}
                          onChange={e => setNewExpense({...newExpense, frequency: e.target.value as 'weekly' | 'monthly'})}
                          className="p-2 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-xs"
                        >
                          <option value="weekly">{t.weekly}</option>
                          <option value="monthly">{t.monthly}</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4 pt-4">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                    {t.saveExpense}
                  </button>
                  <button type="button" onClick={closeForm} className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all">
                    {t.cancel}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Syncing State */}
          {isSyncing && (
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl animate-pulse-subtle">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-black">{t.syncing}</h3>
                  <p className="text-indigo-100 font-medium">Connecting to your primary account via Plaid...</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center">
              <span className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mr-3 text-sm">📊</span>
              {t.spendingByCategory}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} innerRadius={80} outerRadius={100} paddingAngle={8} dataKey="value" animationBegin={0} animationDuration={1500}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center">
              <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mr-3 text-sm">🧾</span>
              {t.recentTransactions}
            </h3>
            <div className="space-y-4">
              {expenses.length > 0 ? expenses.map(exp => (
                <div key={exp.id} className="group flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all">
                  <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                      {CATEGORY_MAP[exp.category] || '📦'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-black text-gray-900 text-lg leading-tight">{exp.description}</p>
                        {exp.isRecurring && (
                          <span className="text-[9px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-black uppercase tracking-widest">{t.recurringBadge}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-black uppercase tracking-wider">{exp.category}</span>
                        <span className="text-xs text-gray-400 font-bold">• {exp.date}</span>
                        {exp.frequency && <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">({exp.frequency})</span>}
                      </div>
                    </div>
                  </div>
                  <p className="text-xl font-black text-gray-900">-${exp.amount.toFixed(2)}</p>
                </div>
              )) : (
                <div className="py-12 text-center text-gray-400"><p className="text-sm font-medium italic">No transactions recorded yet.</p></div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <PlaidLink 
            language={language} onSuccess={handlePlaidSuccess} onError={handlePlaidError}
            isLinked={isLinked} lastSynced={lastSynced}
          />

          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white overflow-hidden relative border border-slate-800">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-lg font-black uppercase tracking-widest">{t.webhookMonitor}</h3>
              <div className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest border transition-all ${isWebhookProcessing ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {isWebhookProcessing ? 'PROCESSING' : t.webhookIdle}
              </div>
            </div>

            <div className="space-y-4 mb-8 min-h-[160px]">
              {webhookLogs.length > 0 ? webhookLogs.map((log, idx) => (
                <div key={log.id} className="text-xs font-mono animate-in slide-in-from-left-4 fade-in duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-center text-indigo-400 space-x-2">
                    <span className="font-black">[{log.timestamp}]</span>
                    <span className="text-white font-bold">{log.type}</span>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl mt-2 border border-slate-800 text-slate-400 overflow-x-auto">
                    <pre className="text-[10px]">{JSON.stringify(log.payload, null, 2)}</pre>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 opacity-30">
                  <div className="text-2xl mb-2">📡</div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Waiting for events...</p>
                </div>
              )}
            </div>

            {isLinked && (
              <button 
                onClick={simulateWebhookEvent}
                disabled={isWebhookProcessing}
                className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                <span>{t.simulateWebhook}</span>
              </button>
            )}
            <p className="text-[9px] text-slate-500 font-bold mt-4 uppercase text-center leading-relaxed">
              {t.webhookDesc}
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900">{t.aiCoach}</h3>
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">✨</div>
            </div>
            <button onClick={handleGetAiTips} disabled={isAiLoading} className="w-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50">
              {isAiLoading ? t.analyzing : t.generateTips}
            </button>
            <div className="mt-8 space-y-4">
              {aiTips.map((tip, idx) => (
                <div key={idx} className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                  <p className="font-black text-purple-900 mb-1 leading-tight">{tip.title}</p>
                  <p className="text-sm text-purple-700/80 font-medium">{tip.suggestion}</p>
                </div>
              ))}
              {!isAiLoading && aiTips.length === 0 && (
                <div className="flex flex-col items-center py-10 opacity-40">
                  <div className="text-4xl mb-4 text-purple-200">🧠</div>
                  <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400 leading-relaxed px-4">{t.noTips}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceApp;
