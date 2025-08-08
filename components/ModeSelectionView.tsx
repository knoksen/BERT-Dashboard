

import React from 'react';
import { AppMode } from '../types';
import { TOOL_COSTS } from '../constants';
import { useCredits } from '../contexts/CreditContext';
import { BrainCircuitIcon, ShieldCheckIcon, FeatherIcon, WrenchIcon, GiftIcon, BookOpenIcon, ScaleIcon, ClipboardListIcon, BriefcaseIcon, ChefHatIcon, DumbbellIcon, FileTextIcon, GlobeIcon, CoinsIcon, LockIcon, CreditCardIcon, ScrollIcon, MoonIcon, FileCheckIcon, GithubIcon, MegaphoneIcon, PaintBrushIcon, NewspaperIcon } from './shared/IconComponents';

interface ModeSelectionViewProps {
  onModeSelect: (mode: AppMode) => void;
}

const ModeCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  cost: number;
  isLocked: boolean;
  isNew?: boolean;
  style?: React.CSSProperties;
}> = ({ icon: Icon, title, description, onClick, cost, isLocked, isNew, style }) => (
  <button
    onClick={onClick}
    disabled={isLocked}
    className="bg-dark-card border border-dark-border rounded-xl p-6 text-center hover:border-accent hover:shadow-2xl hover:shadow-accent/20 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden group disabled:cursor-not-allowed animate-stagger-in"
    style={style}
  >
    {isNew && <span className="absolute top-2 right-2 bg-accent text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>}
    
    <div className={`flex-grow transition-opacity duration-300 ${isLocked ? 'opacity-30' : ''}`}>
        <div className="flex justify-center mb-4">
            <div className="bg-gray-900/80 p-4 rounded-full border-2 border-accent/30 group-hover:border-accent transition-colors duration-300">
                <Icon className="w-12 h-12 text-accent" />
            </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-dark-text-secondary">{description}</p>
    </div>
    <div className={`mt-4 pt-4 border-t border-dark-border/50 flex justify-center items-center gap-2 transition-opacity duration-300 ${isLocked ? 'opacity-30' : ''}`}>
        <CoinsIcon className="w-5 h-5 text-yellow-400" />
        <span className="font-bold text-lg text-white">{cost} Credits</span>
    </div>

    {isLocked && (
        <div className="absolute inset-0 bg-black/70 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm">
            <LockIcon className="w-12 h-12 text-white/50" />
            <p className="mt-2 text-white/80 font-bold">Insufficient Credits</p>
        </div>
    )}
  </button>
);

const tools: { mode: AppMode, icon: React.ElementType, title: string, description: string, isNew?: boolean }[] = [
    { mode: 'DARKBERT', icon: BrainCircuitIcon, title: 'DarkBERT Studio', description: 'Simulate fine-tuning a cybersecurity model and chat with the result.' },
    { mode: 'ARTIST', icon: ShieldCheckIcon, title: 'Artist Scam Detector', description: 'Analyze emails and messages for potential scams targeting artists.' },
    { mode: 'STORYBERT', icon: FeatherIcon, title: 'StoryBERT Studio', description: 'Collaborate with an AI to generate story ideas, premises, and content.' },
    { mode: 'CARBERT', icon: WrenchIcon, title: 'CarBERT Garage', description: 'Generate detailed profiles for classic cars and ask technical questions.' },
    { mode: 'ANNIBERT', icon: GiftIcon, title: 'AnniBERT Planner', description: 'Get personalized ideas for gifts, activities, and messages for any occasion.' },
    { mode: 'BARTHOLOMEW', icon: BookOpenIcon, title: "BERTholomew's Library", description: 'Generate research briefs on historical topics and explore them with an AI historian.' },
    { mode: 'LABERT', icon: ScaleIcon, title: 'LaBERT Legal Assistant', description: 'Analyze legal situations and documents. For research purposes only.' },
    { mode: 'CONTRACTBERT', icon: FileCheckIcon, title: 'ContractBERT Analyzer', description: 'Analyze legal documents to identify key clauses, obligations, and risks.' },
    { mode: 'LIVEBERT', icon: ClipboardListIcon, title: 'LiveBERT Stagehand', description: 'Generate production plans for live events and chat with an AI producer.' },
    { mode: 'ROBERTA', icon: BriefcaseIcon, title: "RoBERTa's Career Clinic", description: 'Optimize your resume and practice for interviews with an AI career coach.' },
    { mode: 'ROBERTO', icon: ChefHatIcon, title: "RoBERTo's Kitchen", description: 'Generate recipes from ingredients you have and get cooking assistance.' },
    { mode: 'FITBERT', icon: DumbbellIcon, title: 'FitBERT Coach', description: 'Generate personalized workout plans and get AI-powered fitness coaching.' },
    { mode: 'DOCUBERT', icon: FileTextIcon, title: 'DocuBERT Analyzer', description: 'Paste any text to get a summary and ask questions about its content.' },
    { mode: 'TRAVELBERT', icon: GlobeIcon, title: 'TravelBERT Planner', description: 'Get a custom travel itinerary and chat with an AI travel concierge.' },
    { mode: 'FINANCEBERT', icon: CreditCardIcon, title: 'FinanceBERT Gateway', description: 'Generate backend and frontend code for popular payment services.' },
    { mode: 'QUESTBERT', icon: ScrollIcon, title: 'QuestBERT Generator', description: 'Generate RPG quests and chat with an AI Dungeon Master.' },
    { mode: 'DREAMBERT', icon: MoonIcon, title: 'DreamBERT Analyzer', description: 'Describe your dream to receive an AI-powered interpretation and analysis.' },
    { mode: 'GITBERT', icon: GithubIcon, title: 'GitBERT Previewer', description: 'Generate a professional README.md file for your GitHub repository.' },
    { mode: 'LAUNCHBERT', icon: MegaphoneIcon, title: 'LaunchBERT Launcher', description: 'Create a complete set of marketing assets for your next product launch.' },
    { mode: 'ARTISANBERT', icon: PaintBrushIcon, title: 'ArtisanBERT Studio', description: 'Generate artistic concepts and create unique images from your ideas.' },
    { mode: 'NEWSBERT', icon: NewspaperIcon, title: 'NewsBERT Analyzer', description: 'Get up-to-the-minute answers on any topic with cited web sources.', isNew: true },
];

const ModeSelectionView: React.FC<ModeSelectionViewProps> = ({ onModeSelect }) => {
  const { credits, showPaywall } = useCredits();

  const handleCardClick = (mode: AppMode) => {
    const cost = TOOL_COSTS[mode] ?? 0;
    if (credits < cost) {
      showPaywall();
    } else {
      onModeSelect(mode);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {tools.sort((a, b) => a.title.localeCompare(b.title)).sort((a, b) => (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1).map((tool, index) => {
          const cost = TOOL_COSTS[tool.mode] ?? 0;
          const isLocked = credits < cost;
          return (
            <ModeCard
              key={tool.mode}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              onClick={() => handleCardClick(tool.mode)}
              cost={cost}
              isLocked={isLocked}
              isNew={tool.isNew}
              style={{ animationDelay: `${index * 50}ms` }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ModeSelectionView;