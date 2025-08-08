

import React from 'react';
import { DreamBERTStep, DreamInterpretation } from '../types';
import DreamInputView from './DreamInputView';
import DreamInterpretationView from './DreamInterpretationView';
import Stepper from './shared/Stepper';
import { RestartIcon, MoonIcon, ChatBubbleIcon } from './shared/IconComponents';
import usePersistentState from '../hooks/usePersistentState';
import ProcessingView from './shared/ProcessingView';
import { SUBCONSCIOUS_ANALYSIS_STEPS } from '../constants';

const STEPS = [
  { id: 'DREAM_INPUT', name: 'Enter Dream', icon: MoonIcon },
  { id: 'ANALYSIS', name: 'Analysis', icon: MoonIcon },
  { id: 'INTERPRETATION', name: 'Interpretation', icon: ChatBubbleIcon },
];

const DreamBertAnalyzer: React.FC = () => {
    const [step, setStep, resetStep] = usePersistentState<DreamBERTStep>('dreambert_step', 'DREAM_INPUT');
    const [dreamInterpretation, setDreamInterpretation, resetInterpretation] = usePersistentState<DreamInterpretation | null>('dreambert_interpretation', null);

    const handleInterpretationGenerated = (interpretation: DreamInterpretation) => {
        setDreamInterpretation(interpretation);
        setStep('ANALYSIS');
    };

    const handleAnalysisComplete = () => {
        setStep('INTERPRETATION');
    };

    const handleReset = () => {
        resetStep();
        resetInterpretation();
    };

    const renderStep = () => {
        switch (step) {
            case 'DREAM_INPUT':
                return <DreamInputView onInterpretationGenerated={handleInterpretationGenerated} />;
            case 'ANALYSIS':
                return (
                    <ProcessingView
                        title="Step 2: Subconscious Analysis"
                        description="Simulating analysis of dream symbols and archetypes."
                        icon={MoonIcon}
                        processingSteps={SUBCONSCIOUS_ANALYSIS_STEPS}
                        onComplete={handleAnalysisComplete}
                        startButtonText="Start Analysis"
                        processingButtonText="Analyzing..."
                        completeButtonText="Begin Interpretation Session"
                        autoStart={true}
                    />
                );
            case 'INTERPRETATION':
                return dreamInterpretation ? <DreamInterpretationView dreamInterpretation={dreamInterpretation} /> : <p>Error: Dream interpretation is missing.</p>;
            default:
                return <DreamInputView onInterpretationGenerated={handleInterpretationGenerated} />;
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full relative px-4">
                 <Stepper steps={STEPS} currentStepId={step} />
                 {step !== 'DREAM_INPUT' && (
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

export default DreamBertAnalyzer;