
import React, { useState } from 'react';
import { PaymentGatewayConfig } from '../types';
import { generatePaymentGatewayConfig } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { CreditCardIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface GatewaySetupViewProps {
  onConfigGenerated: (config: PaymentGatewayConfig) => void;
}

const paymentProviders = ['Stripe', 'PayPal'];
const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

const GatewaySetupView: React.FC<GatewaySetupViewProps> = ({ onConfigGenerated }) => {
  const [details, setDetails] = useState({
    companyName: '',
    currency: 'USD',
    providers: ['Stripe']
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['FINANCEBERT'] ?? 15;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generatePaymentGatewayConfig({
        ...details,
        companyName: details.companyName || 'My Awesome Startup',
      });
      spendCredits(cost);
      onConfigGenerated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProviderToggle = (provider: string) => {
    setDetails(prev => {
        const newProviders = prev.providers.includes(provider)
            ? prev.providers.filter(p => p !== provider)
            : [...prev.providers, provider];
        return {...prev, providers: newProviders};
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <CreditCardIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Gateway Setup</h2>
              <p className="text-dark-text-secondary">Configure your desired payment gateway.</p>
            </div>
          </div>
          <div className="mb-4 p-3 bg-yellow-900/40 border border-yellow-500/50 text-yellow-300 rounded-lg text-sm">
             <strong>Note:</strong> This tool generates simulated code and FAKE API keys for development and learning purposes only. Do not use in production.
          </div>

          <div className="space-y-6">
              <EditableInput label="Company Name" placeholder="e.g., My Awesome Startup" value={details.companyName} onChange={e => setDetails({...details, companyName: e.target.value})} disabled={isLoading}/>
              
              <div>
                <label className="font-semibold text-accent/80 text-sm mb-2 block">Payment Providers</label>
                <div className="flex flex-wrap gap-3">
                  {paymentProviders.map(p => (
                    <button key={p} onClick={() => handleProviderToggle(p)} disabled={isLoading} className={`px-5 py-2 rounded-md font-semibold transition-all duration-200 text-lg flex items-center gap-2 ${details.providers.includes(p) ? 'bg-accent text-gray-900 shadow-md scale-105' : 'bg-gray-900 hover:bg-dark-border border border-dark-border'}`}>
                      {details.providers.includes(p) && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>}
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="currency" className="font-semibold text-accent/80 text-sm mb-1 block">Currency</label>
                <select id="currency" value={details.currency} onChange={e => setDetails({...details, currency: e.target.value})} disabled={isLoading} className="w-full p-3 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200">
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

          </div>
        </div>

        <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading || details.providers.length === 0}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <CreditCardIcon className="w-5 h-5" />}
                {isLoading ? 'Generating...' : `Generate Code (-${cost} Credits)`}
            </button>
        </div>
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}
      </div>
    </div>
  );
};

const EditableInput: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string, disabled?: boolean, placeholder?: string}> = ({value, onChange, label, disabled, placeholder}) => (
     <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <input type="text" value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className="w-full p-3 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 disabled:bg-gray-800 disabled:cursor-not-allowed" />
     </div>
);


export default GatewaySetupView;