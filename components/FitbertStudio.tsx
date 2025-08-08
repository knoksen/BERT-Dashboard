

import React from 'react';
import { FitBERTStep, WorkoutPlan } from '../types';
import WorkoutGoalsView from './WorkoutGoalsView';
import FitnessCoachView from './FitnessCoachView';
import Stepper from './shared/Stepper';
import { RestartIcon, DumbbellIcon, ChatBubbleIcon } from './shared/IconComponents';
import usePersistentState from '../hooks/usePersistentState';
import ProcessingView from './shared/ProcessingView';
import { TRAINING_ADAPTATION_STEPS } from '../constants';

const STEPS = [
  { id: 'GOALS', name: 'Set Goals', icon: DumbbellIcon },
  { id: 'ADAPTATION', name: 'Adapt Plan', icon: DumbbellIcon },
  { id: 'COACHING', name: 'AI Coach', icon: ChatBubbleIcon },
];

const FitbertStudio: React.FC = () => {
    const [step, setStep, resetStep] = usePersistentState<FitBERTStep>('fitbert_step', 'GOALS');
    const [workoutPlan, setWorkoutPlan, resetPlan] = usePersistentState<WorkoutPlan | null>('fitbert_plan', null);

    const handlePlanGenerated = (plan: WorkoutPlan) => {
        setWorkoutPlan(plan);
        setStep('ADAPTATION');
    };

    const handleAdaptationComplete = () => {
        setStep('COACHING');
    };

    const handleReset = () => {
        resetStep();
        resetPlan();
    };

    const renderStep = () => {
        switch (step) {
            case 'GOALS':
                return <WorkoutGoalsView onPlanGenerated={handlePlanGenerated} />;
            case 'ADAPTATION':
                return (
                    <ProcessingView
                        title="Step 2: Training Plan Adaptation"
                        description="Simulating physiological analysis and plan optimization."
                        icon={DumbbellIcon}
                        processingSteps={TRAINING_ADAPTATION_STEPS}
                        onComplete={handleAdaptationComplete}
                        startButtonText="Start Adaptation"
                        processingButtonText="Adapting..."
                        completeButtonText="Start Coaching Session"
                    />
                );
            case 'COACHING':
                return workoutPlan ? <FitnessCoachView workoutPlan={workoutPlan} /> : <p>Error: Workout plan is missing.</p>;
            default:
                return <WorkoutGoalsView onPlanGenerated={handlePlanGenerated} />;
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full relative px-4">
                 <Stepper steps={STEPS} currentStepId={step} />
                 {step !== 'GOALS' && (
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

export default FitbertStudio;