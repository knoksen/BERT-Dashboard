

import React, { useState } from 'react';
import { AppMode } from './types';
import DarkbertStudio from './components/DarkbertStudio';
import ArtistScamDetectorView from './components/ArtistScamDetectorView';
import ModeSelectionView from './components/ModeSelectionView';
import StorybertStudio from './components/StorybertStudio';
import CarbertGarage from './components/CarbertGarage';
import AnniBertPlanner from './components/AnniBertPlanner';
import BartholomewLibrary from './components/BartholomewLibrary';
import LaBertAssistant from './components/LaBertAssistant';
import LiveBertProducer from './components/LiveBertProducer';
import RoBertaStudio from './components/RoBertaStudio';
import RoBertoKitchen from './components/RoBertoKitchen';
import FitbertStudio from './components/FitbertStudio';
import DocuBertAnalyzer from './components/DocuBertAnalyzer';
import TravelBertPlanner from './components/TravelBertPlanner';
import FinanceBertGateway from './components/FinanceBertGateway';
import QuestBertGenerator from './components/QuestBertGenerator';
import DreamBertAnalyzer from './components/DreamBertAnalyzer';
import ContractBertAnalyzer from './components/ContractBertAnalyzer';
import GitBertPreviewer from './components/GitBertPreviewer';
import LaunchBertLauncher from './components/LaunchBertLauncher';
import ArtisanBertStudio from './components/ArtisanBertStudio';
import NewsBertAnalyzer from './components/NewsBertAnalyzer';
import { CreditProvider, useCredits } from './contexts/CreditContext';
import { ArrowLeftIcon, CoinsIcon, PlusIcon, ShareIcon } from './components/shared/IconComponents';
import InstallPWA from './components/shared/InstallPWA';
import ShareModal from './components/shared/ShareModal';
import usePersistentState from './hooks/usePersistentState';

const Header: React.FC<{ mode: AppMode, onBack: () => void, onShare: () => void }> = ({ mode, onBack, onShare }) => {
    const { credits, showPaywall } = useCredits();

    const titles: Record<AppMode, string> = {
        TOOL_SUITE: 'AI Tool Suite',
        DARKBERT: 'DarkBERT Studio',
        ARTIST: 'Artist Scam Detector',
        STORYBERT: 'StoryBERT Studio',
        CARBERT: 'CarBERT Garage',
        ANNIBERT: 'AnniBERT Planner',
        BARTHOLOMEW: "BERTholomew's Library",
        LABERT: 'LaBERT Legal Assistant',
        LIVEBERT: 'LiveBERT Stagehand',
        ROBERTA: "RoBERTa's Career Clinic",
        ROBERTO: "RoBERTo's Kitchen",
        FITBERT: 'FitBERT Coach',
        DOCUBERT: 'DocuBERT Analyzer',
        TRAVELBERT: 'TravelBERT Planner',
        FINANCEBERT: 'FinanceBERT Gateway',
        QUESTBERT: 'QuestBERT Generator',
        DREAMBERT: 'DreamBERT Analyzer',
        CONTRACTBERT: 'ContractBERT Analyzer',
        GITBERT: 'GitBERT Previewer',
        LAUNCHBERT: 'LaunchBERT Quick Launcher',
        ARTISANBERT: 'ArtisanBERT Studio',
        NEWSBERT: 'NewsBERT Analyzer',
    };
    const subtitles: Record<AppMode, string> = {
        TOOL_SUITE: 'Select a tool to get started',
        DARKBERT: 'Fine-Tuning & Interaction Simulator',
        ARTIST: 'Analyze communications for scams',
        STORYBERT: 'Creative Writing Assistant',
        CARBERT: 'Automotive Profiling & Technical Q&A',
        ANNIBERT: 'Special Occasion & Gift Planner',
        BARTHOLOMEW: 'Historical Topic Research & Inquiry',
        LABERT: 'Legal Situation Analysis & Q&A',
        LIVEBERT: 'Live Event Production Assistant',
        ROBERTA: 'Resume Optimization & Interview Prep',
        ROBERTO: 'AI Recipe Generator & Culinary Assistant',
        FITBERT: 'AI Fitness Planner & Coach',
        DOCUBERT: 'Summarize and Chat with Your Documents',
        TRAVELBERT: 'AI Itinerary Generator & Travel Concierge',
        FINANCEBERT: 'Generate Code for Payment Integrations',
        QUESTBERT: 'Generate RPG quests and chat with an AI Dungeon Master',
        DREAMBERT: 'Get an AI-powered interpretation of your dreams',
        CONTRACTBERT: 'Analyze legal documents and ask clarifying questions',
        GITBERT: 'Generate professional GitHub README files',
        LAUNCHBERT: 'Generate marketing assets for your product launch',
        ARTISANBERT: 'AI-powered concept art and image generation',
        NEWSBERT: 'Get up-to-the-minute answers with cited sources',
    }

    return (
        <header className="p-4 text-center relative">
            {mode !== 'TOOL_SUITE' && (
                <button
                    onClick={onBack}
                    title="Back to selection"
                    className="absolute top-1/2 left-4 -translate-y-1/2 p-2 text-dark-text-secondary hover:text-accent transition-colors duration-200"
                    aria-label="Back to selection"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
            )}
             <div className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center gap-2">
                {mode === 'TOOL_SUITE' && (
                    <>
                        <InstallPWA />
                        <button
                            onClick={onShare}
                            className="hidden sm:flex items-center gap-2 bg-dark-card p-2 rounded-full border border-dark-border shadow-md hover:border-accent hover:text-accent transition-colors duration-200"
                            title="Share App"
                            aria-label="Share App"
                        >
                            <ShareIcon className="h-5 w-5" />
                        </button>
                    </>
                )}
                <div className="flex items-center gap-2 bg-dark-card px-3 py-1.5 rounded-full border border-dark-border shadow-md">
                    <CoinsIcon className="w-6 h-6 text-yellow-400" />
                    <span className="font-bold text-lg text-white">{credits}</span>
                    <span className="text-dark-text-secondary text-sm hidden sm:inline">Credits</span>
                </div>
                <button 
                    onClick={showPaywall}
                    className="p-2 bg-accent text-gray-900 rounded-full hover:bg-accent-hover transition-colors duration-200 shadow-md"
                    title="Get More Credits"
                    aria-label="Get More Credits"
                >
                    <PlusIcon className="w-5 h-5"/>
                </button>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider max-w-xl mx-auto">
                <span className="text-accent">{titles[mode].split(' ')[0]}</span>
                {' '}
                {titles[mode].split(' ').slice(1).join(' ')}
            </h1>
            <p className="text-dark-text-secondary mt-1">
                {subtitles[mode]}
            </p>
        </header>
    );
};


const AppContent: React.FC = () => {
    const [mode, setMode] = usePersistentState<AppMode>('app_mode', 'TOOL_SUITE');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const handleModeSelect = (selectedMode: AppMode) => {
        setMode(selectedMode);
    };
    
    const handleBack = () => {
        setMode('TOOL_SUITE');
    }

    const renderMode = () => {
        switch (mode) {
            case 'DARKBERT':
                return <DarkbertStudio />;
            case 'ARTIST':
                return <ArtistScamDetectorView />;
            case 'STORYBERT':
                return <StorybertStudio />;
            case 'CARBERT':
                return <CarbertGarage />;
            case 'ANNIBERT':
                return <AnniBertPlanner />;
            case 'BARTHOLOMEW':
                return <BartholomewLibrary />;
            case 'LABERT':
                return <LaBertAssistant />;
            case 'LIVEBERT':
                return <LiveBertProducer />;
            case 'ROBERTA':
                return <RoBertaStudio />;
            case 'ROBERTO':
                return <RoBertoKitchen />;
            case 'FITBERT':
                return <FitbertStudio />;
            case 'DOCUBERT':
                return <DocuBertAnalyzer />;
            case 'TRAVELBERT':
                return <TravelBertPlanner />;
            case 'FINANCEBERT':
                return <FinanceBertGateway />;
            case 'QUESTBERT':
                return <QuestBertGenerator />;
            case 'DREAMBERT':
                return <DreamBertAnalyzer />;
            case 'CONTRACTBERT':
                return <ContractBertAnalyzer />;
            case 'GITBERT':
                return <GitBertPreviewer />;
            case 'LAUNCHBERT':
                return <LaunchBertLauncher />;
            case 'ARTISANBERT':
                return <ArtisanBertStudio />;
            case 'NEWSBERT':
                return <NewsBertAnalyzer />;
            case 'TOOL_SUITE':
            default:
                return <ModeSelectionView onModeSelect={handleModeSelect} />;
        }
    };

    return (
        <div className="min-h-screen font-sans flex flex-col">
            <Header mode={mode} onBack={handleBack} onShare={() => setIsShareModalOpen(true)} />
            <main className="flex-grow flex flex-col items-center justify-start w-full animate-fade-in-content">
                {renderMode()}
            </main>
            {isShareModalOpen && <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />}
        </div>
    );
};


const App: React.FC = () => {
    return (
        <CreditProvider>
            <AppContent />
        </CreditProvider>
    );
};

export default App;