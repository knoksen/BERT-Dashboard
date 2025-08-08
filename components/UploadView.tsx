
import React, { useState } from 'react';
import { DocumentSummary } from '../types';
import { generateDocumentSummary } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { FileTextIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface UploadViewProps {
  onSummaryGenerated: (summary: DocumentSummary, text: string) => void;
}

const placeholderText = `Generative artificial intelligence (AI) describes algorithms (such as ChatGPT) that can be used to create new content, including audio, code, images, text, simulations, and videos. Recent breakthroughs in the field have the potential to drastically change the way we approach content creation.

Generative AI models learn the patterns and structure of their input training data and then generate new data that has similar characteristics.

While generative AI has been around for a while, a 2017 transformer model, a neural network that learns context and thus meaning by tracking relationships in sequential data like the words in this sentence, has enabled many of the most recent advances. The transformer model architecture allows AI models to be trained on much larger amounts of data than was previously possible.`;

const UploadView: React.FC<UploadViewProps> = ({ onSummaryGenerated }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['DOCUBERT'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      const documentText = text || placeholderText;
      const result = await generateDocumentSummary(documentText);
      spendCredits(cost);
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (summary) {
        onSummaryGenerated(summary, text || placeholderText);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <FileTextIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Upload & Summarize Text</h2>
              <p className="text-dark-text-secondary">Paste your document text below to generate a summary.</p>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholderText}
            className="w-full h-60 p-4 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-y"
            disabled={isLoading || !!summary}
          />
          <p className="text-sm text-dark-text-secondary mt-2">
            Paste your text, or leave blank to use the example.
          </p>
        </div>

        {!summary && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <FileTextIcon className="w-5 h-5" />}
                {isLoading ? 'Summarizing...' : `Summarize (-${cost} Credits)`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {summary && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Document Summary</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <DisplaySection title="Generated Title">
                    <h4 className="text-xl font-bold text-accent">{summary.title}</h4>
                </DisplaySection>
                <DisplaySection title="Abstract">
                    <p className="italic">{summary.abstract}</p>
                </DisplaySection>
                <DisplaySection title="Key Topics">
                    <div className="flex flex-wrap gap-2">
                        {summary.keyTopics.map((topic, idx) => <span key={idx} className="px-3 py-1 bg-dark-border rounded-full text-sm">{topic}</span>)}
                    </div>
                </DisplaySection>
                 <DisplaySection title="Main Takeaways">
                    <ul className="space-y-2 list-disc pl-5">
                        {summary.takeaways.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                </DisplaySection>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    Proceed to Indexing
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

export default UploadView;
