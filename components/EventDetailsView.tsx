
import React, { useState } from 'react';
import { AnniversaryPlan } from '../types';
import { generateAnniversaryPlan } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { GiftIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface EventDetailsViewProps {
  onPlanGenerated: (plan: AnniversaryPlan) => void;
}

const EventDetailsView: React.FC<EventDetailsViewProps> = ({ onPlanGenerated }) => {
  const [details, setDetails] = useState({
    occasion: '',
    recipient: '',
    interests: '',
    budget: '$$'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<AnniversaryPlan | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['ANNIBERT'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await generateAnniversaryPlan({
        occasion: details.occasion || "10th Wedding Anniversary",
        recipient: details.recipient || "My Wife",
        interests: details.interests || "Loves hiking, cooking, and reading fantasy novels",
        budget: details.budget
      });
      spendCredits(cost);
      setPlan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDetailChange = (field: keyof typeof details, value: string) => {
    setDetails(prev => ({...prev, [field]: value}));
  };

  const handlePlanChange = (field: keyof AnniversaryPlan, value: any) => {
    setPlan(prev => prev ? {...prev, [field]: value} : null);
  };
  
  const handleProceed = () => {
    if (plan) {
        onPlanGenerated(plan);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <GiftIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Event Details</h2>
              <p className="text-dark-text-secondary">Provide some details to generate a personalized plan.</p>
            </div>
          </div>

          {!plan && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableInput label="Occasion" placeholder="e.g., 10th Wedding Anniversary" value={details.occasion} onChange={e => handleDetailChange('occasion', e.target.value)} disabled={isLoading}/>
                <EditableInput label="Recipient(s)" placeholder="e.g., My Wife" value={details.recipient} onChange={e => handleDetailChange('recipient', e.target.value)} disabled={isLoading}/>
              </div>
              <EditableTextarea label="Interests" placeholder="e.g., Loves hiking, cooking, fantasy novels" value={details.interests} onChange={e => handleDetailChange('interests', e.target.value)} disabled={isLoading} rows={3}/>
              <div>
                <label className="font-semibold text-accent/80 text-sm mb-1 block">Budget</label>
                <div className="flex space-x-2">
                  {(['$', '$$', '$$$', '$$$$']).map(b => (
                    <button key={b} onClick={() => handleDetailChange('budget', b)} disabled={isLoading} className={`px-4 py-2 rounded-md font-mono transition-colors ${details.budget === b ? 'bg-accent text-gray-900' : 'bg-gray-900 hover:bg-dark-border'}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-dark-text-secondary mt-2">
                Fill out the details, or leave them blank to use the examples.
              </p>
            </div>
          )}
        </div>

        {!plan && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <GiftIcon className="w-5 h-5" />}
                {isLoading ? 'Generating...' : `Generate Plan (-${cost} Credits)`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {plan && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Curate Your Event Plan</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <EditableTextarea label="Gift Ideas" value={plan.giftIdeas.map(g => `- ${g.idea}: ${g.description}`).join('\n')} onChange={() => {}} rows={4} disabled />
              <EditableTextarea label="Activity Suggestions" value={plan.activitySuggestions.map(a => `- ${a.activity}: ${a.description}`).join('\n')} onChange={() => {}} rows={4} disabled />
              <EditableTextarea label="Message Starters" value={plan.messageStarters.map(m => `- "${m}"`).join('\n')} onChange={() => {}} rows={4} disabled />
            </div>
             <p className="text-sm text-dark-text-secondary mt-2">Generated plan is read-only for now. You can refine ideas in the chat step!</p>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    Proceed to Refinement
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const commonInputClass = "w-full p-2 border rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 bg-gray-900 border-dark-border disabled:bg-gray-800 disabled:cursor-not-allowed";

const EditableInput: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string, disabled?: boolean, placeholder?: string}> = ({value, onChange, label, disabled, placeholder}) => (
     <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <input type="text" value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className={commonInputClass} />
     </div>
);

const EditableTextarea: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, label: string, rows: number, disabled?: boolean, placeholder?: string}> = ({value, onChange, label, rows, disabled, placeholder}) => (
     <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <textarea value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className={`${commonInputClass} resize-y`} rows={rows} />
     </div>
);

export default EventDetailsView;
