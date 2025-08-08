
import React, { useState, useEffect } from 'react';
import { CONTRACT_ANALYSIS_STEPS } from '../constants';
import { FileCheckIcon } from './shared/IconComponents';

interface ContractAnalysisViewProps {
  onAnalysisComplete: () => void;
}

const ContractAnalysisView: React.FC<ContractAnalysisViewProps> = ({ onAnalysisComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Ready to begin.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing && !isComplete) {
      let stepIndex = 0;
      interval = setInterval(() => {
        if (stepIndex < CONTRACT_ANALYSIS_STEPS.length) {
          const currentStep = CONTRACT_ANALYSIS_STEPS[stepIndex];
          setProgress(currentStep.progress);
          setStatusMessage(currentStep.message);
          if (currentStep.progress === 100) {
            setIsComplete(true);
            clearInterval(interval);
          }
          stepIndex++;
        }
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, isComplete]);
  
  // Auto-start the process
  useEffect(() => {
    setIsAnalyzing(true);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <FileCheckIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 2: Analyzing Document</h2>
              <p className="text-dark-text-secondary">Simulating clause extraction and risk assessment.</p>
            </div>
          </div>
          <div className="mt-6 p-6 bg-gray-900 rounded-lg border border-dark-border">
            <div className="flex justify-between items-center mb-2">
              <p className="font-mono text-sm text-dark-text-secondary">
                Analysis Status
              </p>
              <p className="font-mono text-lg font-bold text-accent">{progress}%</p>
            </div>
            <div className="w-full bg-dark-border rounded-full h-4 overflow-hidden">
              <div
                className="bg-accent h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="mt-4 text-center h-10">
              <p className="font-mono text-dark-text animate-pulse">{statusMessage}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
          {isComplete ? (
            <button
              onClick={onAnalysisComplete}
              className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
            >
              Start Q&A Session
            </button>
          ) : (
            <button
              disabled
              className="px-6 py-2 bg-gray-500 text-gray-900 font-semibold rounded-lg cursor-not-allowed flex items-center gap-2"
            >
              <FileCheckIcon className="w-5 h-5 animate-spin" />
              Analyzing...
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractAnalysisView;