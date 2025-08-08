

import React from 'react';
import { RoBERToStep, RecipeProfile } from '../types';
import IngredientListView from './IngredientListView';
import CookingSessionView from './CookingSessionView';
import Stepper from './shared/Stepper';
import { RestartIcon, ChefHatIcon, ChatBubbleIcon } from './shared/IconComponents';
import usePersistentState from '../hooks/usePersistentState';
import ProcessingView from './shared/ProcessingView';
import { MISE_EN_PLACE_STEPS } from '../constants';

const STEPS = [
  { id: 'INGREDIENTS', name: 'Ingredients', icon: ChefHatIcon },
  { id: 'PREP', name: 'Mise en Place', icon: ChefHatIcon },
  { id: 'COOKING', name: 'Cooking Session', icon: ChatBubbleIcon },
];

const RoBertoKitchen: React.FC = () => {
    const [step, setStep, resetStep] = usePersistentState<RoBERToStep>('roberto_step', 'INGREDIENTS');
    const [recipeProfile, setRecipeProfile, resetProfile] = usePersistentState<RecipeProfile | null>('roberto_profile', null);

    const handleProfileGenerated = (profile: RecipeProfile) => {
        setRecipeProfile(profile);
        setStep('PREP');
    };

    const handlePrepComplete = () => {
        setStep('COOKING');
    };

    const handleReset = () => {
        resetStep();
        resetProfile();
    };

    const renderStep = () => {
        switch (step) {
            case 'INGREDIENTS':
                return <IngredientListView onProfileGenerated={handleProfileGenerated} />;
            case 'PREP':
                return (
                    <ProcessingView
                        title="Step 2: Mise en Place"
                        description="Simulating the process of preparing ingredients and equipment."
                        icon={ChefHatIcon}
                        processingSteps={MISE_EN_PLACE_STEPS}
                        onComplete={handlePrepComplete}
                        startButtonText="Start Prep"
                        processingButtonText="Prepping..."
                        completeButtonText="Start Cooking"
                    />
                );
            case 'COOKING':
                return recipeProfile ? <CookingSessionView recipeProfile={recipeProfile} /> : <p>Error: Recipe profile is missing.</p>;
            default:
                return <IngredientListView onProfileGenerated={handleProfileGenerated} />;
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full relative px-4">
                 <Stepper steps={STEPS} currentStepId={step} />
                 {step !== 'INGREDIENTS' && (
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

export default RoBertoKitchen;