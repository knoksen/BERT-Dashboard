
import React, { useState, useEffect } from 'react';
import { ArtConcept } from '../types';
import { generateArtImage } from '../services/geminiService';
import { PaintBrushIcon, RocketIcon } from './shared/IconComponents';
import LoadingSpinner from './shared/LoadingSpinner';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface ArtGalleryViewProps {
  artConcept: ArtConcept;
}

const ArtGalleryView: React.FC<ArtGalleryViewProps> = ({ artConcept }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const { credits, spendCredits, showPaywall } = useCredits();
    const cost = TOOL_COSTS['ARTISANBERT'] ?? 0;

    const generateImage = async () => {
        if (credits < cost) {
            showPaywall();
            setError("Insufficient credits to generate an image.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const result = await generateArtImage(artConcept.imagePrompt);
            spendCredits(cost);
            setImageBase64(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        generateImage();
    }, [artConcept]);


  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <PaintBrushIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 3: Art Gallery</h2>
              <p className="text-dark-text-secondary">View your generated masterpiece.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-900 rounded-lg border border-dark-border aspect-square flex items-center justify-center overflow-hidden">
                {isLoading && <LoadingSpinner size={48} className="text-accent"/>}
                {error && !isLoading && <p className="p-4 text-center text-red-400">{error}</p>}
                {imageBase64 && !isLoading && <img src={`data:image/jpeg;base64,${imageBase64}`} alt={artConcept.title} className="w-full h-full object-cover"/>}
            </div>

            <div className="space-y-4">
                <DisplaySection title="Title"><p className="text-lg font-bold text-accent">{artConcept.title}</p></DisplaySection>
                <div className="grid grid-cols-2 gap-4">
                    <DisplaySection title="Medium"><p>{artConcept.medium}</p></DisplaySection>
                    <DisplaySection title="Style"><p>{artConcept.style}</p></DisplaySection>
                </div>
                <DisplaySection title="Description"><p className="italic">{artConcept.description}</p></DisplaySection>
                <button
                    onClick={generateImage}
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-200"
                >
                    {isLoading ? <LoadingSpinner size={20} /> : <RocketIcon className="w-5 h-5" />}
                    {isLoading ? 'Generating...' : `Generate Another Variation (-${cost} Credits)`}
                </button>
            </div>
          </div>
        </div>
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


export default ArtGalleryView;
