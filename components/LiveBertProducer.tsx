

import React from 'react';
import { LiveBertStep, ProductionPlan } from '../types';
import EventConceptView from './EventConceptView';
import ShowControlView from './ShowControlView';
import Stepper from './shared/Stepper';
import { RestartIcon, ClipboardListIcon, ChatBubbleIcon } from './shared/IconComponents';
import usePersistentState from '../hooks/usePersistentState';
import ProcessingView from './shared/ProcessingView';
import { PRE_PRODUCTION_STEPS } from '../constants';

const STEPS = [
  { id: 'CONCEPT', name: 'Event Concept', icon: ClipboardListIcon },
  { id: 'PREPRODUCTION', name: 'Pre-Production', icon: ClipboardListIcon },
  { id: 'SHOW_CONTROL', name: 'Show Control', icon: ChatBubbleIcon },
];

const LiveBertProducer: React.FC = () => {
    const [step, setStep, resetStep] = usePersistentState<LiveBertStep>('livebert_step', 'CONCEPT');
    const [productionPlan, setProductionPlan, resetPlan] = usePersistentState<ProductionPlan | null>('livebert_plan', null);

    const handlePlanGenerated = (plan: ProductionPlan) => {
        setProductionPlan(plan);
        setStep('PREPRODUCTION');
    };

    const handlePreProductionComplete = () => {
        setStep('SHOW_CONTROL');
    };

    const handleReset = () => {
        resetStep();
        resetPlan();
    };

    const renderStep = () => {
        switch (step) {
            case 'CONCEPT':
                return <EventConceptView onPlanGenerated={handlePlanGenerated} />;
            case 'PREPRODUCTION':
                return (
                    <ProcessingView
                        title="Step 2: Pre-Production"
                        description="Simulating checklists, crew coordination, and scheduling."
                        icon={ClipboardListIcon}
                        processingSteps={PRE_PRODUCTION_STEPS}
                        onComplete={handlePreProductionComplete}
                        startButtonText="Start Pre-Production"
                        processingButtonText="Working..."
                        completeButtonText="Go to Show Control"
                    />
                );
            case 'SHOW_CONTROL':
                return productionPlan ? <ShowControlView productionPlan={productionPlan} /> : <p>Error: Production plan is missing.</p>;
            default:
                return <EventConceptView onPlanGenerated={handlePlanGenerated} />;
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

export default LiveBertProducer;