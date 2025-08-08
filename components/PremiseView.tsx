
import React, { useState } from 'react';
import { StoryPremise } from '../types';
import { generateStoryPremise } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { FeatherIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface PremiseViewProps {
  onPremiseGenerated: (premise: StoryPremise) => void;
}

const placeholderIdea = `A detective in a fantasy city powered by magic must solve a murder where the victim was killed by a spell that shouldn't exist.`;

const PremiseView: React.FC<PremiseViewProps> = ({ onPremiseGenerated }) => {
  const [idea, setIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [premise, setPremise] = useState<StoryPremise | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['STORYBERT'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setPremise(null);
    try {
      const result = await generateStoryPremise(idea || placeholderIdea);
      spendCredits(cost);
      setPremise(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (premise) {
        onPremiseGenerated(premise);
    }
  };
  
  const handlePremiseChange = <K extends keyof StoryPremise>(field: K, value: StoryPremise[K]) => {
    if (premise) {
      setPremise({ ...premise, [field]: value });
    }
  };

  const handleCharacterChange = (index: number, field: 'name' | 'description', value: string) => {
    if (premise) {
        const updatedCharacters = [...premise.characters];
        updatedCharacters[index] = {...updatedCharacters[index], [field]: value};
        handlePremiseChange('characters', updatedCharacters);
    }
  };
  
  const handleSettingChange = (field: 'name' | 'description', value: string) => {
     if (premise) {
        const updatedSetting = {...premise.setting, [field]: value};
        handlePremiseChange('setting', updatedSetting);
    }
  }


  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <FeatherIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Generate a Story Premise</h2>
              <p className="text-dark-text-secondary">Provide a core idea to generate a detailed story foundation.</p>
            </div>
          </div>

          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder={placeholderIdea}
            className="w-full h-24 p-4 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-none"
            disabled={isLoading || !!premise}
          />
          <p className="text-sm text-dark-text-secondary mt-2">
            Enter your story idea, or leave it blank to use the example.
          </p>
        </div>

        {!premise && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <FeatherIcon className="w-5 h-5" />}
                {isLoading ? 'Generating...' : `Generate Premise (-${cost} Credits)`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {premise && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Curate Your Story Premise</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <EditableInput label="Title" value={premise.title} onChange={e => handlePremiseChange('title', e.target.value)} />
                <EditableTextarea label="Logline" value={premise.logline} onChange={e => handlePremiseChange('logline', e.target.value)} rows={2} />
                
                <div>
                    <label className="font-semibold text-accent/80 text-sm">Setting</label>
                    <div className="bg-gray-900/70 p-3 rounded-lg border border-dark-border mt-1 space-y-2">
                        <EditableInput label="Name" value={premise.setting.name} onChange={e => handleSettingChange('name', e.target.value)} nested />
                        <EditableTextarea label="Description" value={premise.setting.description} onChange={e => handleSettingChange('description', e.target.value)} rows={2} nested />
                    </div>
                </div>

                <div>
                    <label className="font-semibold text-accent/80 text-sm">Characters</label>
                    {premise.characters.map((char, index) => (
                         <div key={index} className="bg-gray-900/70 p-3 rounded-lg border border-dark-border mt-1 space-y-2 mb-2">
                            <EditableInput label="Name" value={char.name} onChange={e => handleCharacterChange(index, 'name', e.target.value)} nested />
                            <EditableTextarea label="Description" value={char.description} onChange={e => handleCharacterChange(index, 'description', e.target.value)} rows={2} nested/>
                        </div>
                    ))}
                </div>

                 <div>
                    <label className="font-semibold text-accent/80 text-sm">Plot Points</label>
                    <div className="bg-gray-900/70 p-3 rounded-lg border border-dark-border mt-1 space-y-2">
                        {premise.plotPoints.map((point, index) => (
                            <EditableTextarea 
                                key={index}
                                label={`Point ${index + 1}`} 
                                value={point} 
                                onChange={e => {
                                    const newPoints = [...premise.plotPoints];
                                    newPoints[index] = e.target.value;
                                    handlePremiseChange('plotPoints', newPoints);
                                }} 
                                rows={2}
                                nested
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    Proceed to Style Calibration
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const commonInputClass = "w-full mt-1 p-2 bg-gray-900 border border-dark-border rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200";

const EditableInput: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string, nested?: boolean}> = ({value, onChange, label, nested}) => (
     <div>
        {!nested && <label className="font-semibold text-accent/80 text-sm">{label}</label>}
        <input type="text" value={value} onChange={onChange} className={`${commonInputClass} ${nested ? 'bg-gray-800' : 'bg-gray-900'}`} />
     </div>
);

const EditableTextarea: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, label: string, rows: number, nested?: boolean}> = ({value, onChange, label, rows, nested}) => (
     <div>
        {!nested && <label className="font-semibold text-accent/80 text-sm">{label}</label>}
        <textarea value={value} onChange={onChange} className={`${commonInputClass} resize-y ${nested ? 'bg-gray-800' : 'bg-gray-900'}`} rows={rows} />
     </div>
);

export default PremiseView;
