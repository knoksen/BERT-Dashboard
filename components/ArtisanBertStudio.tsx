

import React from 'react';
import { ArtisanBERTStep, ArtConcept } from '../types';
import ArtConceptView from './ArtConceptView';
import ArtGalleryView from './ArtGalleryView';
import Stepper from './shared/Stepper';
import { RestartIcon, PaintBrushIcon, ChatBubbleIcon } from './shared/IconComponents';
import usePersistentState from '../hooks/usePersistentState';
import ProcessingView from './shared/ProcessingView';
import { ART_GENERATION_STEPS } from '../constants';

const STEPS = [
  { id: 'CONCEPT', name: 'Art Concept', icon: PaintBrushIcon },
  { id: 'GENERATION', name: 'Generate Art', icon: PaintBrushIcon },
  { id: 'GALLERY', name: 'Gallery', icon: ChatBubbleIcon },
];

const ArtisanBertStudio: React.FC = () => {
    const [step, setStep, resetStep] = usePersistentState<ArtisanBERTStep>('artisanbert_step', 'CONCEPT');
    const [artConcept, setArtConcept, resetConcept] = usePersistentState<ArtConcept | null>('artisanbert_concept', null);

    const handleConceptGenerated = (concept: ArtConcept) => {
        setArtConcept(concept);
        setStep('GENERATION');
    };

    const handleGenerationComplete = () => {
        setStep('GALLERY');
    };

    const handleReset = () => {
        resetStep();
        resetConcept();
    };

    const renderStep = () => {
        switch (step) {
            case 'CONCEPT':
                return <ArtConceptView onConceptGenerated={handleConceptGenerated} />;
            case 'GENERATION':
                return (
                    <ProcessingView
                        title="Step 2: Generating Artwork"
                        description="Simulating the AI art generation process."
                        icon={PaintBrushIcon}
                        processingSteps={ART_GENERATION_STEPS}
                        onComplete={handleGenerationComplete}
                        startButtonText="Start Generation"
                        processingButtonText="Generating..."
                        completeButtonText="View in Gallery"
                        autoStart={true}
                    />
                );
            case 'GALLERY':
                return artConcept ? <ArtGalleryView artConcept={artConcept} /> : <p>Error: Art concept is missing.</p>;
            default:
                return <ArtConceptView onConceptGenerated={handleConceptGenerated} />;
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full relative px-4">
                 <Stepper steps={STEPS} currentStepId={step} />
                 {step !== 'CONCEPT' && (
                    <button
                        onClick={handleReset}
                        title="Start Over"
                        className="absolute top-0 right-4 p-2 text-dark-text-secondary hover:text-accent transition-colors duration-200"
                        aria-label="Start Over"
                    >
                        <RestartIcon className="w-6 h-6" />
                    </button>
                 )}
            </div>
            {renderStep()}
        </div>
    );
};

export default ArtisanBertStudio;