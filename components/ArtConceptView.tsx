
import React, { useState } from 'react';
import { ArtConcept } from '../types';
import { generateArtConcept } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { PaintBrushIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface ArtConceptViewProps {
  onConceptGenerated: (concept: ArtConcept) => void;
}

const placeholderIdea = `A lonely robot tending a glowing garden on an asteroid.`;

const ArtConceptView: React.FC<ArtConceptViewProps> = ({ onConceptGenerated }) => {
  const [idea, setIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [concept, setConcept] = useState<ArtConcept | null>(null);
  const { credits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['ARTISANBERT'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setConcept(null);
    try {
      const result = await generateArtConcept(idea || placeholderIdea);
      // We don't spend credits here, we spend them on image generation
      setConcept(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (concept) {
        onConceptGenerated(concept);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <PaintBrushIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Create an Art Concept</h2>
              <p className="text-dark-text-secondary">Provide a core idea to generate a detailed artistic prompt.</p>
            </div>
          </div>

          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder={placeholderIdea}
            className="w-full h-24 p-4 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-none"
            disabled={isLoading || !!concept}
          />
          <p className="text-sm text-dark-text-secondary mt-2">
            Enter your idea, or leave it blank to use the example.
          </p>
        </div>

        {!concept && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <PaintBrushIcon className="w-5 h-5" />}
                {isLoading ? 'Generating...' : `Generate Concept`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {concept && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Your Generated Art Concept</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <DisplaySection title="Title"><p className="text-lg font-bold text-accent">{concept.title}</p></DisplaySection>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplaySection title="Medium"><p>{concept.medium}</p></DisplaySection>
                    <DisplaySection title="Style"><p>{concept.style}</p></DisplaySection>
                </div>
                <DisplaySection title="Description"><p className="italic">{concept.description}</p></DisplaySection>
                <DisplaySection title="Image Generation Prompt">
                    <p className="text-dark-text-secondary">{concept.imagePrompt}</p>
                </DisplaySection>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    Proceed to Image Generation (-{cost} Credits)
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


export default ArtConceptView;
