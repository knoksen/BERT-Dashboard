
import React, { useState } from 'react';
import { Quest } from '../types';
import { generateQuest } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { ScrollIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface QuestOutlineViewProps {
  onQuestGenerated: (quest: Quest) => void;
}

const questTypes = ["Monster Hunt", "Escort", "Fetch Quest", "Mystery", "Rescue", "Exploration"];
const difficulties = ["Easy", "Medium", "Hard", "Epic"];

const QuestOutlineView: React.FC<QuestOutlineViewProps> = ({ onQuestGenerated }) => {
  const [details, setDetails] = useState({
    questType: 'Monster Hunt',
    setting: '',
    difficulty: 'Medium'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quest, setQuest] = useState<Quest | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['QUESTBERT'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuest(null);
    try {
      const result = await generateQuest({
        ...details,
        setting: details.setting || "A high-fantasy forest near a bustling kingdom."
      });
      spendCredits(cost);
      setQuest(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (quest) {
        onQuestGenerated(quest);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <ScrollIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Outline a Quest</h2>
              <p className="text-dark-text-secondary">Provide some details to generate a custom RPG quest.</p>
            </div>
          </div>

          {!quest && (
            <div className="space-y-6">
              <div>
                <label className="font-semibold text-accent/80 text-sm mb-2 block">Quest Type</label>
                <div className="flex flex-wrap gap-2">
                  {questTypes.map(type => (
                    <button key={type} onClick={() => setDetails(d => ({...d, questType: type}))} disabled={isLoading} className={`px-4 py-2 rounded-md font-semibold transition-colors ${details.questType === type ? 'bg-accent text-gray-900' : 'bg-gray-900 hover:bg-dark-border border border-dark-border'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              <EditableTextarea label="Setting / Theme" placeholder="e.g., High-fantasy forest, cyberpunk metropolis" value={details.setting} onChange={e => setDetails(d => ({...d, setting: e.target.value}))} disabled={isLoading} rows={2}/>
              
              <div>
                <label className="font-semibold text-accent/80 text-sm mb-2 block">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map(d => (
                    <button key={d} onClick={() => setDetails(s => ({...s, difficulty: d}))} disabled={isLoading} className={`px-4 py-2 rounded-md font-semibold transition-colors ${details.difficulty === d ? 'bg-accent text-gray-900' : 'bg-gray-900 hover:bg-dark-border border border-dark-border'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-dark-text-secondary mt-2">
                Fill out the details, or leave them blank to use the examples.
              </p>
            </div>
          )}
        </div>

        {!quest && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <ScrollIcon className="w-5 h-5" />}
                {isLoading ? 'Generating...' : `Generate Quest (-${cost} Credits)`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {quest && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Your Generated Quest</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <DisplaySection title="Quest Title">
                    <h4 className="text-xl font-bold text-accent">{quest.title}</h4>
                </DisplaySection>
                <DisplaySection title="Quest Log Entry">
                    <p className="italic">{quest.logEntry}</p>
                </DisplaySection>
                <DisplaySection title="Quest Giver:">
                    <p><strong>Name:</strong> {quest.questGiver.name}</p>
                    <p><strong>Location:</strong> {quest.questGiver.location}</p>
                    <p><strong>Description:</strong> {quest.questGiver.description}</p>
                </DisplaySection>
                <DisplaySection title="Quest Steps">
                    <ol className="space-y-2 list-decimal pl-5">
                        {quest.steps.sort((a,b) => a.order - b.order).map((step) => <li key={step.order}><strong>{step.objective}:</strong> {step.description}</li>)}
                    </ol>
                </DisplaySection>
                <DisplaySection title="Rewards">
                    <p><strong>XP:</strong> {quest.rewards.experience}</p>
                    <p><strong>Gold:</strong> {quest.rewards.gold}</p>
                    {quest.rewards.items.length > 0 && <p><strong>Items:</strong> {quest.rewards.items.join(', ')}</p>}
                </DisplaySection>
                {quest.failureConditions.length > 0 && (
                    <DisplaySection title="Failure Conditions">
                         <ul className="space-y-1 list-disc pl-5">
                             {quest.failureConditions.map((cond, idx) => <li key={idx}>{cond}</li>)}
                         </ul>
                    </DisplaySection>
                )}
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    Proceed to World-Building
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const commonInputClass = "w-full p-2 border rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 bg-gray-900 border-dark-border disabled:bg-gray-800 disabled:cursor-not-allowed";

const EditableTextarea: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, label: string, rows: number, disabled?: boolean, placeholder?: string}> = ({value, onChange, label, rows, disabled, placeholder}) => (
     <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <textarea value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className={`${commonInputClass} resize-y`} rows={rows} />
     </div>
);

const DisplaySection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h4 className="font-semibold text-accent/80 text-sm mb-1 block">{title}</h4>
        <div className="p-3 bg-gray-900/70 border border-dark-border rounded-lg text-dark-text space-y-1">
            {children}
        </div>
    </div>
);

export default QuestOutlineView;
