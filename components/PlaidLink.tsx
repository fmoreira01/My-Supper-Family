
import React, { useState } from 'react';
import { Language } from '../types';
import { useTranslation } from '../translations';

interface PlaidLinkProps {
  language: Language;
  onSuccess: (publicToken: string, publicKey: string) => void;
  onError: (errorMessage: string) => void;
  isLinked: boolean;
  lastSynced: string | null;
}

const BANKS = [
  { id: 'chase', name: 'Chase', logo: '🏦', color: 'bg-blue-600' },
  { id: 'boa', name: 'Bank of America', logo: '🏢', color: 'bg-red-600' },
  { id: 'wells', name: 'Wells Fargo', logo: '🐎', color: 'bg-yellow-600' },
  { id: 'citi', name: 'Citibank', logo: '🏛️', color: 'bg-indigo-600' },
  { id: 'capital', name: 'Capital One', logo: '💳', color: 'bg-blue-900' },
];

const PlaidLink: React.FC<PlaidLinkProps> = ({ language, onSuccess, onError, isLinked, lastSynced }) => {
  const t = useTranslation(language);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'select' | 'login' | 'success'>('select');
  const [selectedBank, setSelectedBank] = useState<typeof BANKS[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setStep('select');
  };

  const handleSelectBank = (bank: typeof BANKS[0]) => {
    setSelectedBank(bank);
    setStep('login');
  };

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate authentication lag
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
      // Simulate successful link after a short delay in the success screen
      setTimeout(() => {
        const mockPublicToken = `mock_public_token_${Math.random().toString(36).substr(2, 9)}`;
        const mockPublicKey = "7d76892e8a1240c4959461f38e07293b"; 
        onSuccess(mockPublicToken, mockPublicKey);
        setIsOpen(false);
      }, 1500);
    }, 2000);
  };

  if (isLinked) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-green-100 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-inner">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div>
            <h4 className="font-black text-gray-900 leading-tight">{t.plaidLinked}</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              {t.lastSynced}: {lastSynced || 'Just now'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleOpen} 
          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
          title="Update Connection"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 relative overflow-hidden group transition-all duration-300">
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="relative z-10">
          <h4 className="font-black text-indigo-900 mb-2">{t.bankSync}</h4>
          <p className="text-sm text-indigo-700/70 mb-5 leading-relaxed font-medium">
            {t.linkInfo}
          </p>
          <button
            onClick={handleOpen}
            className="w-full bg-[#0072E3] text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-[#005bb7] transition-all flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>{t.connectBank}</span>
          </button>
        </div>
      </div>

      {/* Simulated Plaid Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Plaid Brand Header */}
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-xs">P</div>
                <span className="font-black tracking-tighter text-xl">PLAID</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8">
              {step === 'select' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-gray-900">{t.selectBank}</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {BANKS.map(bank => (
                      <button
                        key={bank.id}
                        onClick={() => handleSelectBank(bank)}
                        className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
                      >
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl">{bank.logo}</span>
                          <span className="font-bold text-gray-900">{bank.name}</span>
                        </div>
                        <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 'login' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center space-x-4 mb-8">
                    <span className="text-3xl">{selectedBank?.logo}</span>
                    <h3 className="text-2xl font-black text-gray-900">{selectedBank?.name}</h3>
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="User ID" 
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-bold"
                    />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-bold"
                    />
                  </div>
                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-900 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    {isLoading && (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>{isLoading ? 'Authenticating...' : t.continue}</span>
                  </button>
                  <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {t.secureConnection}
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Success!</h3>
                  <p className="text-gray-500 font-medium">Your accounts are being synced.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlaidLink;
