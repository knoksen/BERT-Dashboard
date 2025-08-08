

import React from 'react';
import { AnniBERTStep, AnniversaryPlan } from '../types';
import EventDetailsView from './EventDetailsView';
import InteractivePlannerView from './InteractivePlannerView';
import Stepper from './shared/Stepper';
import { RestartIcon, GiftIcon, ChatBubbleIcon } from './shared/IconComponents';
import usePersistentState from '../hooks/usePersistentState';
import ProcessingView from './shared/ProcessingView';
import { PLAN_REFINING_STEPS } from '../constants';

const STEPS = [
  { id: 'DETAILS', name: 'Event Details', icon: GiftIcon },
  { id: 'REFINING', name: 'Refine Plan', icon: GiftIcon },
  { id: 'PLANNING', name: 'Interactive Plan', icon: ChatBubbleIcon },
];

const AnniBertPlanner: React.FC = () => {
    const [step, setStep, resetStep] = usePersistentState<AnniBERTStep>('annibert_step', 'DETAILS');
    const [anniversaryPlan, setAnniversaryPlan, resetPlan] = usePersistentState<AnniversaryPlan | null>('annibert_plan', null);

    const handleDetailsGenerated = (plan: AnniversaryPlan) => {
        setAnniversaryPlan(plan);
        setStep('REFINING');
    };

    const handlePlanRefined = () => {
        setStep('PLANNING');
    };

    const handleReset = () => {
        resetStep();
        resetPlan();
    };

    const renderStep = () => {
        switch (step) {
            case 'DETAILS':
                return <EventDetailsView onPlanGenerated={handleDetailsGenerated} />;
            case 'REFINING':
                return (
                    <ProcessingView
                        title="Step 2: Refine Event Plan"
                        description="Simulating the process of polishing ideas and logistics."
                        icon={GiftIcon}
                        processingSteps={PLAN_REFINING_STEPS}
                        onComplete={handlePlanRefined}
                        startButtonText="Start Refining"
                        processingButtonText="Refining..."
                        completeButtonText="Proceed to Planning"
                    />
                );
            case 'PLANNING':
                return anniversaryPlan ? <InteractivePlannerView anniversaryPlan={anniversaryPlan} /> : <p>Error: Anniversary plan is missing.</p>;
            default:
                return <EventDetailsView onPlanGenerated={handleDetailsGenerated} />;
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full relative px-4">
                 <Stepper steps={STEPS} currentStepId={step} />
                 {step !== 'DETAILS' && (
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

export default AnniBertPlanner;