

import React from 'react';
import { DocuBERTStep, DocumentSummary } from '../types';
import UploadView from './UploadView';
import DocumentQaView from './DocumentQaView';
import Stepper from './shared/Stepper';
import { RestartIcon, FileTextIcon, ChatBubbleIcon } from './shared/IconComponents';
import usePersistentState from '../hooks/usePersistentState';
import ProcessingView from './shared/ProcessingView';
import { DOCUMENT_INDEXING_STEPS } from '../constants';

const STEPS = [
  { id: 'UPLOAD', name: 'Upload Text', icon: FileTextIcon },
  { id: 'INDEXING', name: 'Index Document', icon: FileTextIcon },
  { id: 'QA', name: 'Q&A Session', icon: ChatBubbleIcon },
];

const DocuBertAnalyzer: React.FC = () => {
    const [step, setStep, resetStep] = usePersistentState<DocuBERTStep>('docubert_step', 'UPLOAD');
    const [documentSummary, setDocumentSummary, resetSummary] = usePersistentState<DocumentSummary | null>('docubert_summary', null);
    const [documentText, setDocumentText, resetText] = usePersistentState<string>('docubert_text', '');

    const handleSummaryGenerated = (summary: DocumentSummary, text: string) => {
        setDocumentSummary(summary);
        setDocumentText(text);
        setStep('INDEXING');
    };

    const handleIndexingComplete = () => {
        setStep('QA');
    };

    const handleReset = () => {
        resetStep();
        resetSummary();
        resetText();
    };

    const renderStep = () => {
        switch (step) {
            case 'UPLOAD':
                return <UploadView onSummaryGenerated={handleSummaryGenerated} />;
            case 'INDEXING':
                return (
                    <ProcessingView
                        title="Step 2: Indexing Document"
                        description="Simulating content analysis for fast Q&A retrieval."
                        icon={FileTextIcon}
                        processingSteps={DOCUMENT_INDEXING_STEPS}
                        onComplete={handleIndexingComplete}
                        startButtonText="Start Indexing"
                        processingButtonText="Indexing..."
                        completeButtonText="Start Q&A Session"
                        autoStart={true}
                    />
                );
            case 'QA':
                return documentSummary && documentText ? <DocumentQaView documentSummary={documentSummary} documentText={documentText} /> : <p>Error: Document data is missing.</p>;
            default:
                return <UploadView onSummaryGenerated={handleSummaryGenerated} />;
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full relative px-4">
                 <Stepper steps={STEPS} currentStepId={step} />
                 {step !== 'UPLOAD' && (
                    <button
                        onClick={handleReset}
                        title="Start Over"
                        className="absolute top-0 right-4 p-2 text-dark-text-secondary hover:text-accent transition-colors duration-200"
                        aria-label="Start Over"
                    >
                        <RestartIcon className="w-6 h-6" />
                    </button>
                 )}
            </div>
            {renderStep()}
        </div>
    );
};

export default DocuBertAnalyzer;