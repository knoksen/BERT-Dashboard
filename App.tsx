

import React, { useState, Suspense, lazy, useEffect } from 'react';
import { AppMode } from './types';
import ErrorBoundary from './components/shared/ErrorBoundary';
// Lazy-loaded feature modules for code splitting
const DarkbertStudio = lazy(() => import('./components/DarkbertStudio'));
const ArtistScamDetectorView = lazy(() => import('./components/ArtistScamDetectorView'));
const ModeSelectionView = lazy(() => import('./components/ModeSelectionView'));
const StorybertStudio = lazy(() => import('./components/StorybertStudio'));
const CarbertGarage = lazy(() => import('./components/CarbertGarage'));
const AnniBertPlanner = lazy(() => import('./components/AnniBertPlanner'));
const BartholomewLibrary = lazy(() => import('./components/BartholomewLibrary'));
const LaBertAssistant = lazy(() => import('./components/LaBertAssistant'));
const LiveBertProducer = lazy(() => import('./components/LiveBertProducer'));
const RoBertaStudio = lazy(() => import('./components/RoBertaStudio'));
const RoBertoKitchen = lazy(() => import('./components/RoBertoKitchen'));
const FitbertStudio = lazy(() => import('./components/FitbertStudio'));
const DocuBertAnalyzer = lazy(() => import('./components/DocuBertAnalyzer'));
const TravelBertPlanner = lazy(() => import('./components/TravelBertPlanner'));
const FinanceBertGateway = lazy(() => import('./components/FinanceBertGateway'));
const QuestBertGenerator = lazy(() => import('./components/QuestBertGenerator'));
const DreamBertAnalyzer = lazy(() => import('./components/DreamBertAnalyzer'));
const ContractBertAnalyzer = lazy(() => import('./components/ContractBertAnalyzer'));
const GitBertPreviewer = lazy(() => import('./components/GitBertPreviewer'));
const LaunchBertLauncher = lazy(() => import('./components/LaunchBertLauncher'));
const ArtisanBertStudio = lazy(() => import('./components/ArtisanBertStudio'));
const NewsBertAnalyzer = lazy(() => import('./components/NewsBertAnalyzer'));
import { CreditProvider, useCredits } from './contexts/CreditContext';
import { ArrowLeftIcon, CoinsIcon, PlusIcon, ShareIcon, BrainCircuitIcon, PaintBrushIcon } from './components/shared/IconComponents';
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


// Hash <-> Mode mapping (supports multiple aliases for a single mode)
const HASH_MODE_MAP: Record<string, AppMode> = {
    '#chat': 'DARKBERT',
    '#tuning': 'DARKBERT',
    '#art': 'ARTISANBERT'
};
const MODE_PRIMARY_HASH: Partial<Record<AppMode, string>> = {
    DARKBERT: '#chat',
    ARTISANBERT: '#art'
};

const AppContent: React.FC = () => {
    const [mode, setMode] = usePersistentState<AppMode>('app_mode', 'TOOL_SUITE');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Map hash fragments to modes for deep linking / PWA shortcuts
    useEffect(() => {
        const applyHash = () => {
            const h = window.location.hash.toLowerCase();
            const targetMode = HASH_MODE_MAP[h];
            if (targetMode && targetMode !== mode) {
                setMode(targetMode);
            }
        };
        applyHash();
        window.addEventListener('hashchange', applyHash);
        return () => window.removeEventListener('hashchange', applyHash);
    }, [mode, setMode]);

    // Sync hash when mode changes: only set if current hash doesn't already represent the mode
    useEffect(() => {
        const currentHash = window.location.hash.toLowerCase();
        const currentRepresentsMode = currentHash && HASH_MODE_MAP[currentHash] === mode;
        const primary = MODE_PRIMARY_HASH[mode];
        if (primary && !currentRepresentsMode) {
            history.replaceState(null, '', primary);
        } else if (!primary && currentHash && HASH_MODE_MAP[currentHash]) {
            // Leaving a hashed mode -> clear hash
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }, [mode]);

    const handleModeSelect = (selectedMode: AppMode) => {
        if (selectedMode !== mode) setMode(selectedMode);
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
                <Suspense fallback={<div className="p-8 text-dark-text-secondary">Loading module...</div>}>
                    {renderMode()}
                </Suspense>
            </main>
            <QuickLaunchBar currentMode={mode} onSelect={handleModeSelect} />
            {isShareModalOpen && <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />}
        </div>
    );
};


const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <CreditProvider>
                <AppContent />
            </CreditProvider>
        </ErrorBoundary>
    );
};

export default App;

// Mobile quick launch bar (function declarations are hoisted, preventing ReferenceError before initialization)
function QuickLaunchBar({ currentMode, onSelect }: { currentMode: AppMode; onSelect: (m: AppMode) => void }) {
    return (
        <nav
            aria-label="Quick launch"
            className="fixed bottom-0 inset-x-0 md:hidden bg-dark-card/90 backdrop-blur border-t border-dark-border flex justify-around px-2 py-2 z-40"
            data-testid="quick-launch-bar"
        >
            <QuickLaunchButton
                label="Chat"
                active={currentMode === 'DARKBERT'}
                icon={<BrainCircuitIcon className="w-5 h-5" />}
                onClick={() => { onSelect('DARKBERT'); window.location.hash = '#chat'; }}
            />
            <QuickLaunchButton
                label="Tuning"
                active={currentMode === 'DARKBERT'}
                icon={<BrainCircuitIcon className="w-5 h-5" />}
                onClick={() => { onSelect('DARKBERT'); window.location.hash = '#tuning'; }}
            />
            <QuickLaunchButton
                label="Art"
                active={currentMode === 'ARTISANBERT'}
                icon={<PaintBrushIcon className="w-5 h-5" />}
                onClick={() => { onSelect('ARTISANBERT'); window.location.hash = '#art'; }}
            />
        </nav>
    );
}

function QuickLaunchButton({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg text-xs font-medium transition-colors ${active ? 'text-accent' : 'text-dark-text-secondary hover:text-white'}`}
            data-testid={`quick-launch-${label.toLowerCase()}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}