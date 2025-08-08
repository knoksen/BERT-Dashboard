
import React, { useState } from 'react';
import { ResearchBrief } from '../types';
import { generateResearchBrief } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { BookOpenIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface ResearchBriefViewProps {
  onBriefGenerated: (brief: ResearchBrief) => void;
}

const placeholderIdea = `The Fall of the Roman Empire`;

const ResearchBriefView: React.FC<ResearchBriefViewProps> = ({ onBriefGenerated }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState<ResearchBrief | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['BARTHOLOMEW'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setBrief(null);
    try {
      const result = await generateResearchBrief(topic || placeholderIdea);
      spendCredits(cost);
      setBrief(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (brief) {
        onBriefGenerated(brief);
    }
  };
  
  const handleBriefChange = <K extends keyof ResearchBrief>(field: K, value: ResearchBrief[K]) => {
    if (brief) {
      setBrief({ ...brief, [field]: value });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <BookOpenIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Generate Research Brief</h2>
              <p className="text-dark-text-secondary">Provide a historical topic to generate a research brief.</p>
            </div>
          </div>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={placeholderIdea}
            className="w-full h-20 p-4 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-none"
            disabled={isLoading || !!brief}
          />
          <p className="text-sm text-dark-text-secondary mt-2">
            Enter a topic (e.g., 'The Silk Road', 'The Battle of Hastings'), or leave blank for the example.
          </p>
        </div>

        {!brief && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <BookOpenIcon className="w-5 h-5" />}
                {isLoading ? 'Generating...' : `Generate Brief (-${cost} Credits)`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {brief && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Curate Your Research Brief</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <EditableInput label="Topic" value={brief.topic} onChange={e => handleBriefChange('topic', e.target.value)} />
                <EditableTextarea label="Summary" value={brief.summary} onChange={e => handleBriefChange('summary', e.target.value)} rows={3} />
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    Proceed to Indexing
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const commonInputClass = "w-full p-2 border rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 bg-gray-900 border-dark-border";

const EditableInput: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string}> = ({value, onChange, label}) => (
     <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <input type="text" value={value} onChange={onChange} className={commonInputClass} />
     </div>
);

const EditableTextarea: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, label: string, rows: number}> = ({value, onChange, label, rows}) => (
     <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <textarea value={value} onChange={onChange} className={`${commonInputClass} resize-y`} rows={rows} />
     </div>
);


export default ResearchBriefView;
