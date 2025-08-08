
import React, { useState } from 'react';
import { FineTuningData } from '../types';
import { prepareDataForFinetuning } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { BrainCircuitIcon, PlusIcon, TrashIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface DataPrepViewProps {
  onDataPrepared: (data: FineTuningData[]) => void;
}

const placeholderText = `Example: A new ransomware family, 'CyberLock', has been identified. It spreads through phishing emails containing malicious macros. Once executed, it encrypts files with AES-256 and demands a 0.5 BTC ransom. Its C2 communication is over Tor. Analysis shows it has rootkit capabilities to hide its processes. We need to develop detection signatures for our EDR.`;

const DataPrepView: React.FC<DataPrepViewProps> = ({ onDataPrepared }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preparedData, setPreparedData] = useState<FineTuningData[] | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['DARKBERT'] ?? 0;

  const handleProcessData = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setPreparedData(null);
    
    try {
      const data = await prepareDataForFinetuning(text || placeholderText);
      spendCredits(cost);
      setPreparedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDataChange = (index: number, field: keyof FineTuningData, value: string) => {
    if (preparedData) {
      const updatedData = [...preparedData];
      updatedData[index] = { ...updatedData[index], [field]: value };
      setPreparedData(updatedData);
    }
  };

  const handleAddPair = () => {
    setPreparedData(prevData => [...(prevData || []), { prompt: '', completion: '' }]);
  };

  const handleDeletePair = (index: number) => {
    setPreparedData(prevData => prevData ? prevData.filter((_, i) => i !== index) : null);
  };


  const handleProceed = () => {
    if (preparedData) {
      const validData = preparedData.filter(p => p.prompt.trim() && p.completion.trim());
      if (validData.length > 0) {
        onDataPrepared(validData);
      } else {
        setError("Cannot proceed with an empty dataset. Please add at least one valid prompt/completion pair.")
      }
    }
  };

  const EditableField: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder: string, label: string}> = ({value, onChange, placeholder, label}) => (
     <div>
        <label className="font-semibold text-accent/80 text-sm">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full mt-1 p-2 bg-gray-900 border border-dark-border rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-y"
            rows={3}
        />
     </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <BrainCircuitIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Prepare Fine-Tuning Data</h2>
              <p className="text-dark-text-secondary">Provide raw text to generate a question/answer dataset.</p>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholderText}
            className="w-full h-48 p-4 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-none"
            disabled={isLoading || !!preparedData}
          />
          <p className="text-sm text-dark-text-secondary mt-2">
            Paste your text above, or leave it blank to use the example.
          </p>
        </div>

        {!preparedData && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleProcessData}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <BrainCircuitIcon className="w-5 h-5" />}
                {isLoading ? 'Processing...' : `Generate Dataset (-${cost} Credits)`}
            </button>
            </div>
        )}
        

        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {preparedData && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Curate Your Dataset ({preparedData.length} pairs)</h3>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {preparedData.map((item, index) => (
                <div key={index} className="bg-gray-900/70 p-4 rounded-lg border border-dark-border relative group">
                   <button 
                    onClick={() => handleDeletePair(index)}
                    className="absolute top-2 right-2 p-1 text-dark-text-secondary hover:text-red-500 opacity-50 group-hover:opacity-100 transition-all"
                    aria-label="Delete pair"
                   >
                       <TrashIcon className="w-5 h-5"/>
                   </button>
                  <div className="space-y-3">
                    <EditableField label="Prompt" placeholder="Enter a question or prompt" value={item.prompt} onChange={(e) => handleDataChange(index, 'prompt', e.target.value)} />
                    <EditableField label="Completion" placeholder="Enter the desired answer" value={item.completion} onChange={(e) => handleDataChange(index, 'completion', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
             <div className="mt-4 flex justify-between items-center gap-4">
                 <button
                    onClick={handleAddPair}
                    className="px-4 py-2 border-2 border-dashed border-dark-border text-dark-text-secondary font-semibold rounded-lg hover:border-accent hover:text-accent flex items-center gap-2 transition-colors duration-200"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Pair
                </button>
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    disabled={!preparedData || preparedData.every(p => !p.prompt.trim() || !p.completion.trim())}
                >
                    Proceed to Fine-Tuning
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPrepView;
