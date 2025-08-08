

import React from 'react';
import { RoBERTaStep, ResumeProfile } from '../types';
import ResumeIntakeView from './ResumeIntakeView';
import InterviewPrepView from './InterviewPrepView';
import Stepper from './shared/Stepper';
import { RestartIcon, BriefcaseIcon, ChatBubbleIcon } from './shared/IconComponents';
import usePersistentState from '../hooks/usePersistentState';
import ProcessingView from './shared/ProcessingView';
import { OPTIMIZATION_ANALYSIS_STEPS } from '../constants';

const STEPS = [
  { id: 'INTAKE', name: 'Resume Intake', icon: BriefcaseIcon },
  { id: 'OPTIMIZATION', name: 'Optimize', icon: BriefcaseIcon },
  { id: 'INTERVIEW_PREP', name: 'Interview Prep', icon: ChatBubbleIcon },
];

const RoBertaStudio: React.FC = () => {
    const [step, setStep, resetStep] = usePersistentState<RoBERTaStep>('roberta_step', 'INTAKE');
    const [resumeProfile, setResumeProfile, resetProfile] = usePersistentState<ResumeProfile | null>('roberta_profile', null);

    const handleProfileGenerated = (profile: ResumeProfile) => {
        setResumeProfile(profile);
        setStep('OPTIMIZATION');
    };

    const handleOptimizationComplete = () => {
        setStep('INTERVIEW_PREP');
    };

    const handleReset = () => {
        resetStep();
        resetProfile();
    };

    const renderStep = () => {
        switch (step) {
            case 'INTAKE':
                return <ResumeIntakeView onProfileGenerated={handleProfileGenerated} />;
            case 'OPTIMIZATION':
                return (
                    <ProcessingView
                        title="Step 2: Resume Optimization Analysis"
                        description="Simulating analysis against best practices and keywords."
                        icon={BriefcaseIcon}
                        processingSteps={OPTIMIZATION_ANALYSIS_STEPS}
                        onComplete={handleOptimizationComplete}
                        startButtonText="Start Analysis"
                        processingButtonText="Analyzing..."
                        completeButtonText="Proceed to Interview Prep"
                    />
                );
            case 'INTERVIEW_PREP':
                return resumeProfile ? <InterviewPrepView resumeProfile={resumeProfile} /> : <p>Error: Resume profile is missing.</p>;
            default:
                return <ResumeIntakeView onProfileGenerated={handleProfileGenerated} />;
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full relative px-4">
                 <Stepper steps={STEPS} currentStepId={step} />
                 {step !== 'INTAKE' && (
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

export default RoBertaStudio;