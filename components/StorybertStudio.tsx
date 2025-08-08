

import React from 'react';
import { StoryStep, StoryPremise } from '../types';
import PremiseView from './PremiseView';
import WritingChatView from './WritingChatView';
import Stepper from './shared/Stepper';
import { RestartIcon, FeatherIcon, PaintBrushIcon, ChatBubbleIcon } from './shared/IconComponents';
import usePersistentState from '../hooks/usePersistentState';
import ProcessingView from './shared/ProcessingView';
import { STYLE_TUNING_STEPS } from '../constants';

const STEPS = [
  { id: 'PREMISE', name: 'Generate Premise', icon: FeatherIcon },
  { id: 'STYLE', name: 'Calibrate Style', icon: PaintBrushIcon },
  { id: 'WRITE', name: 'Write Story', icon: ChatBubbleIcon },
];

const StorybertStudio: React.FC = () => {
    const [step, setStep, resetStep] = usePersistentState<StoryStep>('storybert_step', 'PREMISE');
    const [storyPremise, setStoryPremise, resetPremise] = usePersistentState<StoryPremise | null>('storybert_premise', null);

    const handlePremiseGenerated = (premise: StoryPremise) => {
        setStoryPremise(premise);
        setStep('STYLE');
    };

    const handleStyleTuned = () => {
        setStep('WRITE');
    };

    const handleReset = () => {
        resetStep();
        resetPremise();
    };

    const renderStep = () => {
        switch (step) {
            case 'PREMISE':
                return <PremiseView onPremiseGenerated={handlePremiseGenerated} />;
            case 'STYLE':
                return (
                    <ProcessingView
                        title="Step 2: Calibrate Authorial Style"
                        description="Simulate preparing the AI muse for collaboration."
                        icon={PaintBrushIcon}
                        processingSteps={STYLE_TUNING_STEPS}
                        onComplete={handleStyleTuned}
                        startButtonText="Start Calibration"
                        processingButtonText="Calibrating..."
                        completeButtonText="Proceed to Writing"
                    />
                );
            case 'WRITE':
                return storyPremise ? <WritingChatView storyPremise={storyPremise} /> : <p>Error: Story premise is missing.</p>;
            default:
                return <PremiseView onPremiseGenerated={handlePremiseGenerated} />;
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full relative px-4">
                 <Stepper steps={STEPS} currentStepId={step} />
                 {step !== 'PREMISE' && (
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

export default StorybertStudio;