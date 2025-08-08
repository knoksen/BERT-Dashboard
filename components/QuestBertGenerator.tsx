

import React from 'react';
import { QuestBERTStep, Quest } from '../types';
import QuestOutlineView from './QuestOutlineView';
import DungeonMasterChatView from './DungeonMasterChatView';
import Stepper from './shared/Stepper';
import { RestartIcon, ScrollIcon, ChatBubbleIcon } from './shared/IconComponents';
import usePersistentState from '../hooks/usePersistentState';
import ProcessingView from './shared/ProcessingView';
import { WORLD_BUILDING_STEPS } from '../constants';

const STEPS = [
  { id: 'OUTLINE', name: 'Quest Outline', icon: ScrollIcon },
  { id: 'WORLD_BUILDING', name: 'World-Building', icon: ScrollIcon },
  { id: 'DM_CHAT', name: 'DM Chat', icon: ChatBubbleIcon },
];

const QuestBertGenerator: React.FC = () => {
    const [step, setStep, resetStep] = usePersistentState<QuestBERTStep>('questbert_step', 'OUTLINE');
    const [quest, setQuest, resetQuest] = usePersistentState<Quest | null>('questbert_quest', null);

    const handleQuestGenerated = (generatedQuest: Quest) => {
        setQuest(generatedQuest);
        setStep('WORLD_BUILDING');
    };

    const handleWorldBuildingComplete = () => {
        setStep('DM_CHAT');
    };

    const handleReset = () => {
        resetStep();
        resetQuest();
    };

    const renderStep = () => {
        switch (step) {
            case 'OUTLINE':
                return <QuestOutlineView onQuestGenerated={handleQuestGenerated} />;
            case 'WORLD_BUILDING':
                return (
                    <ProcessingView
                        title="Step 2: World-Building"
                        description="Simulating the creation of the quest environment."
                        icon={ScrollIcon}
                        processingSteps={WORLD_BUILDING_STEPS}
                        onComplete={handleWorldBuildingComplete}
                        startButtonText="Start Building"
                        processingButtonText="Building..."
                        completeButtonText="Consult the Dungeon Master"
                        autoStart={true}
                    />
                );
            case 'DM_CHAT':
                return quest ? <DungeonMasterChatView quest={quest} /> : <p>Error: Quest data is missing.</p>;
            default:
                return <QuestOutlineView onQuestGenerated={handleQuestGenerated} />;
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full relative px-4">
                 <Stepper steps={STEPS} currentStepId={step} />
                 {step !== 'OUTLINE' && (
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

export default QuestBertGenerator;