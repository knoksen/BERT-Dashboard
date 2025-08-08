
import React, { useState } from 'react';
import { DreamInterpretation } from '../types';
import { generateDreamInterpretation } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { MoonIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface DreamInputViewProps {
  onInterpretationGenerated: (interpretation: DreamInterpretation) => void;
}

const placeholderDream = `I was in a library with impossibly tall shelves that seemed to go on forever into the darkness above. I wasn't looking for a specific book, but I felt a sense of calm urgency. The books had no titles on their spines. I opened one, and the pages were blank, but I could hear faint whispering coming from them.`;

const DreamInputView: React.FC<DreamInputViewProps> = ({ onInterpretationGenerated }) => {
  const [dream, setDream] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<DreamInterpretation | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['DREAMBERT'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setInterpretation(null);
    try {
      const result = await generateDreamInterpretation(dream || placeholderDream);
      spendCredits(cost);
      setInterpretation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (interpretation) {
        onInterpretationGenerated(interpretation);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <MoonIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Describe Your Dream</h2>
              <p className="text-dark-text-secondary">Describe your dream in as much detail as you can remember.</p>
            </div>
          </div>
          <div className="mb-4 p-3 bg-yellow-900/40 border border-yellow-500/50 text-yellow-300 rounded-lg text-sm">
             <strong>Note:</strong> This tool is for entertainment and self-reflection. It is not a substitute for professional psychological advice.
          </div>

          <textarea
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            placeholder={placeholderDream}
            className="w-full h-48 p-4 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-y"
            disabled={isLoading || !!interpretation}
          />
          <p className="text-sm text-dark-text-secondary mt-2">
            Enter your dream, or leave blank to use the example.
          </p>
        </div>

        {!interpretation && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <MoonIcon className="w-5 h-5" />}
                {isLoading ? 'Interpreting...' : `Interpret Dream (-${cost} Credits)`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {interpretation && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Your Dream Interpretation</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <DisplaySection title="Dream Title">
                    <h4 className="text-xl font-bold text-accent">{interpretation.title}</h4>
                </DisplaySection>
                <DisplaySection title="Summary"><p className="italic">{interpretation.summary}</p></DisplaySection>
                <DisplaySection title="Emotional Tone"><p>{interpretation.emotionalTone}</p></DisplaySection>
                <DisplaySection title="Key Symbols">
                    <ul className="space-y-2">
                        {interpretation.symbols.map((s, i) => <li key={i}><strong>{s.name}:</strong> {s.meaning}</li>)}
                    </ul>
                </DisplaySection>
                 <DisplaySection title="Questions to Consider">
                    <ul className="space-y-1 list-disc pl-5">
                        {interpretation.questionsToConsider.map((q, idx) => <li key={idx}>{q}</li>)}
                    </ul>
                </DisplaySection>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    Proceed to Analysis
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DisplaySection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h4 className="font-semibold text-accent/80 text-sm mb-1 block">{title}</h4>
        <div className="p-3 bg-gray-900/70 border border-dark-border rounded-lg text-dark-text">
            {children}
        </div>
    </div>
);

export default DreamInputView;
