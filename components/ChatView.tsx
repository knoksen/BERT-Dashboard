

import React from 'react';
import { createChatSession } from '../services/geminiService';
import { FineTuningData } from '../types';
import ChatInterface from './shared/ChatInterface';
import { ChatBubbleIcon } from './shared/IconComponents';

interface ChatViewProps {
  fineTuningData: FineTuningData[];
}

const ChatView: React.FC<ChatViewProps> = ({ fineTuningData }) => {
  const chatSession = React.useMemo(() => createChatSession(fineTuningData), [fineTuningData]);

  return (
    <ChatInterface
      chatSession={chatSession}
      title="Chat with DarkBERT"
      subtitle="Model: darkbert-v1-finetuned"
      placeholder="Ask about cybersecurity, threats, or dark web topics..."
      icon={ChatBubbleIcon}
      botAvatar={<span className="text-sm">DB</span>}
      initialBotMessageText="DarkBERT model 'darkbert-v1-finetuned' is online. My knowledge has been updated with your data. I am ready for your queries."
    />
  );
};

export default ChatView;
