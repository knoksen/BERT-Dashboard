
import React, { useState } from 'react';
import { Itinerary } from '../types';
import { generateItinerary } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { GlobeIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface DestinationViewProps {
  onItineraryGenerated: (plan: Itinerary) => void;
}

const DestinationView: React.FC<DestinationViewProps> = ({ onItineraryGenerated }) => {
  const [details, setDetails] = useState({
    destination: '',
    duration: '',
    interests: '',
    budget: '$$'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Itinerary | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['TRAVELBERT'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await generateItinerary({
        destination: details.destination || "Kyoto, Japan",
        duration: details.duration || "7 days",
        interests: details.interests || "A mix of historic temples, amazing food experiences, and nature.",
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

  const handleProceed = () => {
    if (plan) {
        onItineraryGenerated(plan);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <GlobeIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Plan Your Trip</h2>
              <p className="text-dark-text-secondary">Provide some details to generate a custom travel itinerary.</p>
            </div>
          </div>

          {!plan && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableInput label="Destination" placeholder="e.g., Kyoto, Japan" value={details.destination} onChange={e => handleDetailChange('destination', e.target.value)} disabled={isLoading}/>
                <EditableInput label="Trip Duration" placeholder="e.g., 7 Days" value={details.duration} onChange={e => handleDetailChange('duration', e.target.value)} disabled={isLoading}/>
              </div>
              <EditableTextarea label="Interests & Vibe" placeholder="e.g., History, food, nature walks" value={details.interests} onChange={e => handleDetailChange('interests', e.target.value)} disabled={isLoading} rows={3}/>
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
                {isLoading ? <LoadingSpinner size={20} /> : <GlobeIcon className="w-5 h-5" />}
                {isLoading ? 'Generating...' : `Generate Itinerary (-${cost} Credits)`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {plan && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Your Custom Itinerary</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <DisplaySection title="Trip Name">
                    <h4 className="text-xl font-bold text-accent">{plan.tripName}</h4>
                </DisplaySection>
                <DisplaySection title="Daily Plan">
                    {plan.dailyPlan.map((day) => (
                        <div key={day.day} className="mb-4 last:mb-0">
                            <h5 className="font-bold text-dark-text">Day {day.day}: {day.theme}</h5>
                            <ul className="list-disc pl-5 mt-1 text-dark-text-secondary space-y-1">
                                {day.activities.map((act, i) => <li key={i}><strong>{act.name}:</strong> {act.description}</li>)}
                            </ul>
                        </div>
                    ))}
                </DisplaySection>
                <DisplaySection title="Packing Suggestions">
                    <ul className="space-y-1 list-disc pl-5">
                        {plan.packingSuggestions.map((tip, idx) => <li key={idx}>{tip}</li>)}
                    </ul>
                </DisplaySection>
                <DisplaySection title="Local Tips & Etiquette">
                    <ul className="space-y-1 list-disc pl-5">
                        {plan.localTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                    </ul>
                </DisplaySection>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    Proceed to Booking
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

const DisplaySection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h4 className="font-semibold text-accent/80 text-sm mb-1 block">{title}</h4>
        <div className="p-3 bg-gray-900/70 border border-dark-border rounded-lg text-dark-text">
            {children}
        </div>
    </div>
);

export default DestinationView;
