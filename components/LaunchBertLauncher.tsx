

import React from 'react';
import { LaunchBERTStep, LaunchAssets } from '../types';
import ProductBriefView from './ProductBriefView';
import LaunchKitView from './LaunchKitView';
import Stepper from './shared/Stepper';
import { RestartIcon, MegaphoneIcon, ChatBubbleIcon } from './shared/IconComponents';
import usePersistentState from '../hooks/usePersistentState';
import ProcessingView from './shared/ProcessingView';
import { MESSAGE_CRAFTING_STEPS } from '../constants';

const STEPS = [
  { id: 'BRIEF', name: 'Product Brief', icon: MegaphoneIcon },
  { id: 'CRAFTING', name: 'Craft Message', icon: MegaphoneIcon },
  { id: 'LAUNCH_KIT', name: 'Launch Kit', icon: ChatBubbleIcon },
];

const LaunchBertLauncher: React.FC = () => {
    const [step, setStep, resetStep] = usePersistentState<LaunchBERTStep>('launchbert_step', 'BRIEF');
    const [launchAssets, setLaunchAssets, resetAssets] = usePersistentState<LaunchAssets | null>('launchbert_assets', null);

    const handleAssetsGenerated = (assets: LaunchAssets) => {
        setLaunchAssets(assets);
        setStep('CRAFTING');
    };

    const handleCraftingComplete = () => {
        setStep('LAUNCH_KIT');
    };

    const handleReset = () => {
        resetStep();
        resetAssets();
    };

    const renderStep = () => {
        switch (step) {
            case 'BRIEF':
                return <ProductBriefView onAssetsGenerated={handleAssetsGenerated} />;
            case 'CRAFTING':
                return (
                     <ProcessingView
                        title="Step 2: Crafting Launch Messaging"
                        description="Simulating the creation of compelling marketing copy."
                        icon={MegaphoneIcon}
                        processingSteps={MESSAGE_CRAFTING_STEPS}
                        onComplete={handleCraftingComplete}
                        startButtonText="Start Crafting"
                        processingButtonText="Crafting..."
                        completeButtonText="View Launch Kit"
                        autoStart={true}
                    />
                );
            case 'LAUNCH_KIT':
                return launchAssets ? <LaunchKitView launchAssets={launchAssets} /> : <p>Error: Launch assets are missing.</p>;
            default:
                return <ProductBriefView onAssetsGenerated={handleAssetsGenerated} />;
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

export default LaunchBertLauncher;