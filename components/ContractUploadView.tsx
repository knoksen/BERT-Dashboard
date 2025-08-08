
import React, { useState } from 'react';
import { ContractAnalysis } from '../types';
import { analyzeContract } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { FileCheckIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface ContractUploadViewProps {
  onAnalysisGenerated: (analysis: ContractAnalysis, text: string) => void;
}

const placeholderText = `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement (the "Agreement") is made and entered into this 1st day of January, 2024, by and between Landlord, FutureLiving Properties LLC ("Landlord"), and Tenant, Jane Doe ("Tenant").

1. PROPERTY. Landlord, in consideration of the lease payments provided in this Agreement, leases to Tenant a house at 123 Maple Street, Anytown, USA 12345 (the "Property").

2. TERM. The lease term will begin on January 1, 2024 and will terminate on December 31, 2024.

3. RENT. Tenant shall pay to Landlord a total of $24,000, payable in monthly installments of $2,000. Rent is due on the 1st day of each month.

4. SECURITY DEPOSIT. At the time of the signing of this Agreement, Tenant shall pay to Landlord, in trust, a security deposit of $2,000.

5. TERMINATION. Either party may terminate this agreement with 60 days' written notice to the other party. Upon termination, Tenant is responsible for returning the property in the same condition as it was received, normal wear and tear excepted.`;

const ContractUploadView: React.FC<ContractUploadViewProps> = ({ onAnalysisGenerated }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['CONTRACTBERT'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const contractText = text || placeholderText;
      const result = await analyzeContract(contractText);
      spendCredits(cost);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (analysis) {
        onAnalysisGenerated(analysis, text || placeholderText);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <FileCheckIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Upload & Analyze Contract</h2>
              <p className="text-dark-text-secondary">Paste your contract text to generate a structured analysis.</p>
            </div>
          </div>
          <div className="mb-4 p-3 bg-yellow-900/40 border border-yellow-500/50 text-yellow-300 rounded-lg text-sm">
             <strong>Disclaimer:</strong> This tool provides an AI-generated analysis for informational purposes only and is not a substitute for professional legal advice.
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholderText}
            className="w-full h-60 p-4 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-y"
            disabled={isLoading || !!analysis}
          />
          <p className="text-sm text-dark-text-secondary mt-2">
            Paste your contract, or leave blank to use the example.
          </p>
        </div>

        {!analysis && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <FileCheckIcon className="w-5 h-5" />}
                {isLoading ? 'Analyzing...' : `Analyze Document (-${cost} Credits)`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {analysis && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Contract Analysis Report</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <DisplaySection title="Document Type">
                    <h4 className="text-lg font-bold text-accent">{analysis.documentType}</h4>
                </DisplaySection>
                <DisplaySection title="Parties Involved">
                    <ul className="list-disc pl-5 space-y-1">
                        {analysis.parties.map((p, i) => <li key={i}><strong>{p.role}:</strong> {p.name}</li>)}
                    </ul>
                </DisplaySection>
                <DisplaySection title="Key Clauses">
                    {analysis.keyClauses.map((c, i) => <div key={i} className="mb-2 last:mb-0"><strong className="text-dark-text">{c.clause}:</strong> <span className="text-dark-text-secondary">{c.summary}</span></div>)}
                </DisplaySection>
                <DisplaySection title="Obligations">
                    <ul className="list-disc pl-5 space-y-1">
                        {analysis.obligations.map((o, i) => <li key={i}><strong>{o.party}:</strong> {o.obligation}</li>)}
                    </ul>
                </DisplaySection>
                 <DisplaySection title="Potential Risks & Items to Review">
                    <ul className="space-y-1 list-disc pl-5">
                        {analysis.potentialRisks.map((item, idx) => <li key={idx} className="text-yellow-300/90">{item}</li>)}
                    </ul>
                </DisplaySection>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    Proceed to Q&A Session
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DisplaySection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h4 className="font-semibold text-accent/80 text-sm mb-1 block">{title}</h4>
        <div className="p-3 bg-gray-900/70 border border-dark-border rounded-lg text-dark-text">
            {children}
        </div>
    </div>
);

export default ContractUploadView;