
import React, { useState } from 'react';
import { ScamAnalysisResult } from '../types';
import { analyzeArtistCommunication } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { ShieldCheckIcon, RestartIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';
import usePersistentState from '../hooks/usePersistentState';

const ResultDisplay: React.FC<{ result: ScamAnalysisResult; onReset: () => void }> = ({ result, onReset }) => {
    const likelihoodColors = {
        Low: 'bg-green-500/20 text-green-300 border-green-500/30',
        Medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        High: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        Critical: 'bg-red-500/20 text-red-300 border-red-500/30',
    };

    const renderList = (title: string, items: string[]) => (
        <div>
            <h4 className="text-lg font-semibold text-accent/90 mb-2">{title}</h4>
            {items.length > 0 ? (
                <ul className="space-y-2 pl-5 list-disc">
                    {items.map((item, index) => (
                        <li key={index} className="text-dark-text">{item}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-dark-text-secondary">None detected.</p>
            )}
        </div>
    );

    return (
        <div className="mt-6 p-6 bg-gray-900 rounded-lg border border-dark-border animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-4">Analysis Complete</h3>
            <div className="space-y-6">
                <div>
                    <h4 className="text-lg font-semibold text-accent/90 mb-2">Likelihood</h4>
                    <span className={`px-3 py-1 text-base font-bold rounded-full border ${likelihoodColors[result.likelihood]}`}>
                        {result.likelihood}
                    </span>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-accent/90 mb-2">Summary</h4>
                    <p className="text-dark-text">{result.analysis}</p>
                </div>
                {renderList('🚩 Red Flags', result.redFlags)}
                {renderList('✅ Recommended Actions', result.recommendations)}
            </div>
             <div className="mt-8 text-right">
                <button
                    onClick={onReset}
                    className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover transition-colors duration-200 flex items-center gap-2"
                >
                    <RestartIcon className="w-5 h-5"/>
                    Analyze Another Message
                </button>
            </div>
        </div>
    )
};


const ArtistScamDetectorView: React.FC = () => {
    const [text, setText, resetText] = usePersistentState('artist_text', '');
    const [analysisResult, setAnalysisResult, resetResult] = usePersistentState<ScamAnalysisResult | null>('artist_result', null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { credits, spendCredits, showPaywall } = useCredits();
    const cost = TOOL_COSTS['ARTIST'] ?? 0;

    const handleAnalyze = async () => {
        if (credits < cost) {
            showPaywall();
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeArtistCommunication(text);
            spendCredits(cost);
            setAnalysisResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        resetResult();
        resetText();
        setError(null);
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
            <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
                <div className="p-6">
                    <p className="text-dark-text-secondary mb-4">
                        Paste the full text of a suspicious email, DM, or message below. ArtShield will analyze it for common scam tactics.
                    </p>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="e.g., 'Hello dear artist, I love your work! I want to commission you for a big project for my daughter's birthday...'"
                        className="w-full h-60 p-4 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-y"
                        disabled={isLoading || !!analysisResult}
                    />
                </div>
                
                {!analysisResult && (
                    <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || !text.trim()}
                            className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
                        >
                            {isLoading ? <LoadingSpinner size={20} /> : <ShieldCheckIcon className="w-5 h-5" />}
                            {isLoading ? 'Analyzing...' : `Analyze Message (-${cost} Credits)`}
                        </button>
                    </div>
                )}
                
                {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

                {analysisResult && <ResultDisplay result={analysisResult} onReset={handleReset} />}
            </div>
        </div>
    );
};

export default ArtistScamDetectorView;