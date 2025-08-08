
import React, { useState } from 'react';
import { CaseBrief } from '../types';
import { generateCaseBrief } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { ScaleIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface CaseBriefViewProps {
  onBriefGenerated: (brief: CaseBrief) => void;
}

const placeholderIdea = `My landlord is refusing to return my security deposit of $1500, even though I left the apartment in perfect condition. They are claiming they needed it for 'general cleaning' but won't provide receipts. My lease ended on the 1st of last month.`;

const CaseBriefView: React.FC<CaseBriefViewProps> = ({ onBriefGenerated }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState<CaseBrief | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['LABERT'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setBrief(null);
    try {
      const result = await generateCaseBrief(text || placeholderIdea);
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

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <ScaleIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Case Intake</h2>
              <p className="text-dark-text-secondary">Describe a legal situation or document to generate a case brief.</p>
            </div>
          </div>
           <div className="mb-4 p-3 bg-yellow-900/40 border border-yellow-500/50 text-yellow-300 rounded-lg text-sm">
             <strong>Disclaimer:</strong> This tool is for informational and research purposes only and does not constitute legal advice. Consult with a qualified legal professional for any legal concerns.
           </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholderIdea}
            className="w-full h-40 p-4 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-y"
            disabled={isLoading || !!brief}
          />
          <p className="text-sm text-dark-text-secondary mt-2">
            Describe your situation, or leave blank to use the example.
          </p>
        </div>

        {!brief && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <ScaleIcon className="w-5 h-5" />}
                {isLoading ? 'Generating...' : `Generate Brief (-${cost} Credits)`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {brief && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Review Your Case Brief</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <EditableInput label="Case Title" value={brief.caseTitle} onChange={() => {}} disabled />
                <EditableTextarea label="Summary of Facts" value={brief.summaryOfFacts} onChange={() => {}} rows={4} disabled />
                <DisplayList label="Identified Legal Issues" items={brief.identifiedLegalIssues} />
                <DisplayList label="Relevant Areas of Law" items={brief.relevantAreasOfLaw} />
                <DisplayList label="Initial Questions for Clarification" items={brief.initialQuestions} />
            </div>
             <p className="text-sm text-dark-text-secondary mt-2">Generated brief is read-only. You can explore these points in the Q&A step.</p>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    Proceed to Legal Research
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

const EditableTextarea: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, label: string, rows: number, disabled: boolean}> = ({value, onChange, label, rows, disabled}) => (
     <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <textarea value={value} onChange={onChange} className={`${commonInputClass} resize-y`} rows={rows} disabled={disabled}/>
     </div>
);

const DisplayList: React.FC<{label: string, items: string[]}> = ({label, items}) => (
    <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <div className="p-3 bg-gray-900/70 border border-dark-border rounded-lg">
            <ul className="space-y-2 list-disc pl-5 text-dark-text">
                {items.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
    </div>
);


export default CaseBriefView;
