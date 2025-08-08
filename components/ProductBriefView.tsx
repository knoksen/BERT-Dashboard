
import React, { useState } from 'react';
import { LaunchAssets } from '../types';
import { generateLaunchAssets } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { MegaphoneIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface ProductBriefViewProps {
  onAssetsGenerated: (assets: LaunchAssets) => void;
}

const ProductBriefView: React.FC<ProductBriefViewProps> = ({ onAssetsGenerated }) => {
  const [details, setDetails] = useState({
    name: '',
    pitch: '',
    audience: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['LAUNCHBERT'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateLaunchAssets({
        name: details.name || "InnovateSphere",
        pitch: details.pitch || "An AI-powered platform for collaborative brainstorming and idea management.",
        audience: details.audience || "Product managers, startup founders, and creative teams."
      });
      spendCredits(cost);
      onAssetsGenerated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <MegaphoneIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Product Brief</h2>
              <p className="text-dark-text-secondary">Provide details about your product to generate launch assets.</p>
            </div>
          </div>
          
          <div className="space-y-6">
              <EditableInput label="Product Name" placeholder="e.g., InnovateSphere" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} disabled={isLoading}/>
              <EditableTextarea label="One-Sentence Pitch" placeholder="e.g., An AI-powered platform for collaborative brainstorming." value={details.pitch} onChange={e => setDetails({...details, pitch: e.target.value})} disabled={isLoading} rows={2}/>
              <EditableInput label="Target Audience" placeholder="e.g., Product managers, startup founders" value={details.audience} onChange={e => setDetails({...details, audience: e.target.value})} disabled={isLoading}/>
              <p className="text-sm text-dark-text-secondary">Fill out the brief, or leave blank to use the examples.</p>
          </div>
        </div>

        <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
        <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
        >
            {isLoading ? <LoadingSpinner size={20} /> : <MegaphoneIcon className="w-5 h-5" />}
            {isLoading ? 'Generating...' : `Generate Assets (-${cost} Credits)`}
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

export default ProductBriefView;