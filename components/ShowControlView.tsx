

import React from 'react';
import { createLiveBertChatSession } from '../services/geminiService';
import { ProductionPlan } from '../types';
import ChatInterface from './shared/ChatInterface';
import { ChatBubbleIcon, ClipboardListIcon } from './shared/IconComponents';

interface ShowControlViewProps {
  productionPlan: ProductionPlan;
}

const ShowControlView: React.FC<ShowControlViewProps> = ({ productionPlan }) => {
  const chatSession = React.useMemo(() => createLiveBertChatSession(productionPlan), [productionPlan]);

  return (
    <ChatInterface
      chatSession={chatSession}
      title="Show Control with LiveBERT"
      subtitle={`Event: ${productionPlan.eventTitle}`}
      placeholder="Give a cue, ask for a status update..."
      icon={ChatBubbleIcon}
      botAvatar={<ClipboardListIcon className="w-5 h-5" />}
      initialBotMessageText={`Show Control, copy. I am on channel and have the production plan for "${productionPlan.eventTitle}". Ready for cues.`}
    />
  );
};

export default ShowControlView;
