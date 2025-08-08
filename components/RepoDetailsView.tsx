
import React, { useState } from 'react';
import { ReadmeContent } from '../types';
import { generateReadmeContent } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { GithubIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface RepoDetailsViewProps {
  onReadmeGenerated: (content: ReadmeContent) => void;
}

const techOptions = ["React", "Node.js", "Python", "TypeScript", "Next.js", "Vue.js", "Docker", "AWS"];

const RepoDetailsView: React.FC<RepoDetailsViewProps> = ({ onReadmeGenerated }) => {
  const [details, setDetails] = useState({
    name: '',
    description: '',
    tech: ['React', 'Node.js']
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['GITBERT'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateReadmeContent({
        ...details,
        name: details.name || "My Awesome Project",
        description: details.description || "A revolutionary new app that will change the world.",
      });
      spendCredits(cost);
      onReadmeGenerated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTechToggle = (tech: string) => {
    setDetails(prev => {
        const newTech = prev.tech.includes(tech)
            ? prev.tech.filter(t => t !== tech)
            : [...prev.tech, tech];
        return {...prev, tech: newTech};
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <GithubIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Repository Details</h2>
              <p className="text-dark-text-secondary">Provide some details to generate a professional README.</p>
            </div>
          </div>
          
          <div className="space-y-6">
              <EditableInput label="Repository Name" placeholder="e.g., My Awesome Project" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} disabled={isLoading}/>
              <EditableTextarea label="Project Description" placeholder="e.g., A revolutionary new app that will change the world." value={details.description} onChange={e => setDetails({...details, description: e.target.value})} disabled={isLoading} rows={3}/>
              <div>
                <label className="font-semibold text-accent/80 text-sm mb-2 block">Key Technologies</label>
                <div className="flex flex-wrap gap-2">
                  {techOptions.map(tech => (
                    <button key={tech} onClick={() => handleTechToggle(tech)} disabled={isLoading} className={`px-4 py-2 rounded-md font-semibold transition-colors text-sm ${details.tech.includes(tech) ? 'bg-accent text-gray-900' : 'bg-gray-900 hover:bg-dark-border border border-dark-border'}`}>
                      {tech}
                    </button>
                  ))}
                </div>
              </div>
          </div>
        </div>

        <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
        <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
        >
            {isLoading ? <LoadingSpinner size={20} /> : <GithubIcon className="w-5 h-5" />}
            {isLoading ? 'Generating...' : `Generate README (-${cost} Credits)`}
        </button>
        </div>
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}
      </div>
    </div>
  );
};

const EditableInput: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string, disabled?: boolean, placeholder?: string}> = ({value, onChange, label, disabled, placeholder}) => (
     <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <input type="text" value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className="w-full p-3 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 disabled:bg-gray-800 disabled:cursor-not-allowed" />
     </div>
);

const EditableTextarea: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, label: string, rows: number, disabled?: boolean, placeholder?: string}> = ({value, onChange, label, rows, disabled, placeholder}) => (
     <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <textarea value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className="w-full p-3 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-y disabled:bg-gray-800 disabled:cursor-not-allowed" rows={rows} />
     </div>
);

export default RepoDetailsView;