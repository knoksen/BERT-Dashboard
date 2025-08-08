

import React from 'react';
import { LaBERTStep, CaseBrief } from '../types';
import CaseBriefView from './CaseBriefView';
import LegalQaView from './LegalQaView';
import Stepper from './shared/Stepper';
import { RestartIcon, ScaleIcon, ChatBubbleIcon } from './shared/IconComponents';
import usePersistentState from '../hooks/usePersistentState';
import ProcessingView from './shared/ProcessingView';
import { LEGAL_RESEARCH_STEPS } from '../constants';

const STEPS = [
  { id: 'BRIEF', name: 'Case Intake', icon: ScaleIcon },
  { id: 'RESEARCH', name: 'Legal Research', icon: ScaleIcon },
  { id: 'QA', name: 'Legal Q&A', icon: ChatBubbleIcon },
];

const LaBertAssistant: React.FC = () => {
    const [step, setStep, resetStep] = usePersistentState<LaBERTStep>('labert_step', 'BRIEF');
    const [caseBrief, setCaseBrief, resetBrief] = usePersistentState<CaseBrief | null>('labert_brief', null);

    const handleBriefGenerated = (brief: CaseBrief) => {
        setCaseBrief(brief);
        setStep('RESEARCH');
    };

    const handleResearchComplete = () => {
        setStep('QA');
    };

    const handleReset = () => {
        resetStep();
        resetBrief();
    };

    const renderStep = () => {
        switch (step) {
            case 'BRIEF':
                return <CaseBriefView onBriefGenerated={handleBriefGenerated} />;
            case 'RESEARCH':
                return (
                    <ProcessingView
                        title="Step 2: Legal Research"
                        description="Simulating review of legal databases, statutes, and case law."
                        icon={ScaleIcon}
                        processingSteps={LEGAL_RESEARCH_STEPS}
                        onComplete={handleResearchComplete}
                        startButtonText="Start Research"
                        processingButtonText="Researching..."
                        completeButtonText="Proceed to Q&A"
                    />
                );
            case 'QA':
                return caseBrief ? <LegalQaView caseBrief={caseBrief} /> : <p>Error: Case brief is missing.</p>;
            default:
                return <CaseBriefView onBriefGenerated={handleBriefGenerated} />;
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full relative px-4">
                 <Stepper steps={STEPS} currentStepId={step} />
                 {step !== 'BRIEF' && (
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

export default LaBertAssistant;