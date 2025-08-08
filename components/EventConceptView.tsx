
import React, { useState } from 'react';
import { ProductionPlan } from '../types';
import { generateProductionPlan } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { ClipboardListIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface EventConceptViewProps {
  onPlanGenerated: (plan: ProductionPlan) => void;
}

const placeholderIdea = `A three-day indie music festival in a city park, with two stages and a focus on local food vendors.`;

const EventConceptView: React.FC<EventConceptViewProps> = ({ onPlanGenerated }) => {
  const [concept, setConcept] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['LIVEBERT'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await generateProductionPlan(concept || placeholderIdea);
      spendCredits(cost);
      setPlan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
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
            <ClipboardListIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Event Concept</h2>
              <p className="text-dark-text-secondary">Describe your event to generate a production plan.</p>
            </div>
          </div>

          <textarea
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder={placeholderIdea}
            className="w-full h-24 p-4 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-y"
            disabled={isLoading || !!plan}
          />
          <p className="text-sm text-dark-text-secondary mt-2">
            Enter an event concept, or leave blank to use the example.
          </p>
        </div>

        {!plan && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <ClipboardListIcon className="w-5 h-5" />}
                {isLoading ? 'Generating...' : `Generate Plan (-${cost} Credits)`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {plan && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Review Your Production Plan</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <EditableInput label="Event Title" value={plan.eventTitle} onChange={() => {}} disabled />
                <EditableInput label="Event Type" value={plan.eventType} onChange={() => {}} disabled />
                <DisplayListComplex label="Key Personnel" items={plan.personnel.map(p => ({title: p.role, description: p.responsibilities}))} />
                <DisplayListNested label="Equipment Checklist" items={plan.equipment.map(d => ({title: d.department, items: d.items}))} />
                <DisplayListComplex label="Run of Show" items={plan.runOfShow.map(s => ({title: s.time, description: s.action}))} />
            </div>
             <p className="text-sm text-dark-text-secondary mt-2">Generated plan is read-only for now. You can use it in the chat step!</p>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    Proceed to Pre-Production
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const commonInputClass = "w-full p-2 border rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 bg-gray-800 border-gray-700 cursor-not-allowed";

const EditableInput: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string, disabled: boolean}> = ({value, onChange, label, disabled}) => (
     <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <input type="text" value={value} onChange={onChange} className={commonInputClass} disabled={disabled} />
     </div>
);

const DisplayListComplex: React.FC<{label: string, items: {title: string, description: string}[]}> = ({label, items}) => (
    <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <div className="p-3 bg-gray-900/70 border border-dark-border rounded-lg space-y-2">
            {items.map((item, index) => 
              <div key={index}><strong className="text-dark-text">{item.title}:</strong> <span className="text-dark-text-secondary">{item.description}</span></div>
            )}
        </div>
    </div>
);

const DisplayListNested: React.FC<{label: string, items: {title: string, items: string[]}[]}> = ({label, items}) => (
    <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <div className="p-3 bg-gray-900/70 border border-dark-border rounded-lg space-y-3">
            {items.map((item, index) => 
              <div key={index}>
                <strong className="text-dark-text">{item.title}</strong>
                <ul className="list-disc pl-6 text-dark-text-secondary mt-1">
                  {item.items.map((subItem, subIndex) => <li key={subIndex}>{subItem}</li>)}
                </ul>
              </div>
            )}
        </div>
    </div>
);

export default EventConceptView;
