

import React from 'react';
import { createDocuBertChatSession } from '../services/geminiService';
import { DocumentSummary } from '../types';
import ChatInterface from './shared/ChatInterface';
import { ChatBubbleIcon, FileTextIcon } from './shared/IconComponents';

interface DocumentQaViewProps {
  documentSummary: DocumentSummary;
  documentText: string;
}

const DocumentQaView: React.FC<DocumentQaViewProps> = ({ documentSummary, documentText }) => {
  const chatSession = React.useMemo(() => createDocuBertChatSession(documentText), [documentText]);

  return (
    <ChatInterface
      chatSession={chatSession}
      title="Q&A with DocuBERT"
      subtitle={`Document: ${documentSummary.title}`}
      placeholder="Ask a question about the document..."
      icon={ChatBubbleIcon}
      botAvatar={<FileTextIcon className="w-5 h-5" />}
      initialBotMessageText={`I have finished indexing the document titled "${documentSummary.title}". Ask me anything about its content.`}
    />
  );
};

export default DocumentQaView;
