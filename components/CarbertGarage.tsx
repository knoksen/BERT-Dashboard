

import React from 'react';
import { CarbertStep, VehicleProfile } from '../types';
import VehicleProfileView from './VehicleProfileView';
import TechQaView from './TechQaView';
import Stepper from './shared/Stepper';
import { RestartIcon, WrenchIcon, ChatBubbleIcon } from './shared/IconComponents';
import usePersistentState from '../hooks/usePersistentState';
import ProcessingView from './shared/ProcessingView';
import { ENGINE_CALIBRATION_STEPS } from '../constants';

const STEPS = [
  { id: 'PROFILE', name: 'Vehicle Profile', icon: WrenchIcon },
  { id: 'CALIBRATION', name: 'Engine Tune', icon: WrenchIcon },
  { id: 'QA', name: 'Technical Q&A', icon: ChatBubbleIcon },
];

const CarbertGarage: React.FC = () => {
    const [step, setStep, resetStep] = usePersistentState<CarbertStep>('carbert_step', 'PROFILE');
    const [vehicleProfile, setVehicleProfile, resetProfile] = usePersistentState<VehicleProfile | null>('carbert_profile', null);

    const handleProfileGenerated = (profile: VehicleProfile) => {
        setVehicleProfile(profile);
        setStep('CALIBRATION');
    };

    const handleCalibrationComplete = () => {
        setStep('QA');
    };

    const handleReset = () => {
        resetStep();
        resetProfile();
    };

    const renderStep = () => {
        switch (step) {
            case 'PROFILE':
                return <VehicleProfileView onProfileGenerated={handleProfileGenerated} />;
            case 'CALIBRATION':
                 return (
                    <ProcessingView
                        title="Step 2: Calibrate Engine"
                        description="Simulate tuning the vehicle's engine for peak performance."
                        icon={WrenchIcon}
                        processingSteps={ENGINE_CALIBRATION_STEPS}
                        onComplete={handleCalibrationComplete}
                        startButtonText="Start Calibration"
                        processingButtonText="Calibrating..."
                        completeButtonText="Proceed to Q&A"
                    />
                );
            case 'QA':
                return vehicleProfile ? <TechQaView vehicleProfile={vehicleProfile} /> : <p>Error: Vehicle profile is missing.</p>;
            default:
                return <VehicleProfileView onProfileGenerated={handleProfileGenerated} />;
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full relative px-4">
                 <Stepper steps={STEPS} currentStepId={step} />
                 {step !== 'PROFILE' && (
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

export default CarbertGarage;