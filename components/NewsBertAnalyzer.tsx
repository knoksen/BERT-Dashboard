

import React, { useState } from 'react';
import { NewsSummaryResult } from '../types';
import { getNewsSummaryWithGrounding } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { NewspaperIcon, RestartIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';
import usePersistentState from '../hooks/usePersistentState';

const ResultDisplay: React.FC<{ result: NewsSummaryResult; onReset: () => void }> = ({ result, onReset }) => {
    return (
        <div className="mt-6 p-6 bg-gray-900 rounded-lg border border-dark-border animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-4">Analysis Result</h3>
            <div className="space-y-6">
                <div>
                    <h4 className="text-lg font-semibold text-accent/90 mb-2">Summary</h4>
                    <p className="text-dark-text whitespace-pre-wrap">{result.summary}</p>
                </div>
                {result.sources && result.sources.length > 0 && (
                    <div>
                        <h4 className="text-lg font-semibold text-accent/90 mb-2">Sources</h4>
                        <ul className="space-y-2 pl-5 list-decimal">
                            {result.sources.map((source, index) => (
                                <li key={index} className="text-dark-text">
                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                        {source.web.title || source.web.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
             <div className="mt-8 text-right">
                <button
                    onClick={onReset}
                    className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover transition-colors duration-200 flex items-center gap-2"
                >
                    <RestartIcon className="w-5 h-5"/>
                    Ask Another Question
                </button>
            </div>
        </div>
    )
};


const NewsBertAnalyzer: React.FC = () => {
    const [query, setQuery, resetQuery] = usePersistentState('newsbert_query', '');
    const [analysisResult, setAnalysisResult, resetResult] = usePersistentState<NewsSummaryResult | null>('newsbert_result', null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { credits, spendCredits, showPaywall } = useCredits();
    const cost = TOOL_COSTS['NEWSBERT'] ?? 0;

    const handleAnalyze = async () => {
        if (credits < cost) {
            showPaywall();
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await getNewsSummaryWithGrounding(query);
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
        resetQuery();
        setError(null);
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
            <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
                <div className="p-6">
                    <p className="text-dark-text-secondary mb-4">
                        Ask a question about a recent event or any topic that requires up-to-date information from the web.
                    </p>

                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., Who won the most medals at the last Olympics? or What are the latest trends in renewable energy?"
                        className="w-full h-40 p-4 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-y"
                        disabled={isLoading || !!analysisResult}
                    />
                </div>
                
                {!analysisResult && (
                    <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || !query.trim()}
                            className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
                        >
                            {isLoading ? <LoadingSpinner size={20} /> : <NewspaperIcon className="w-5 h-5" />}
                            {isLoading ? 'Analyzing...' : `Get Latest Info (-${cost} Credits)`}
                        </button>
                    </div>
                )}
                
                {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

                {analysisResult && <ResultDisplay result={analysisResult} onReset={handleReset} />}
            </div>
        </div>
    );
};

export default NewsBertAnalyzer;