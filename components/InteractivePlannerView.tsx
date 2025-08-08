

import React from 'react';
import { createAnniBertChatSession } from '../services/geminiService';
import { AnniversaryPlan } from '../types';
import ChatInterface from './shared/ChatInterface';
import { ChatBubbleIcon, GiftIcon } from './shared/IconComponents';

interface InteractivePlannerViewProps {
  anniversaryPlan: AnniversaryPlan;
}

const InteractivePlannerView: React.FC<InteractivePlannerViewProps> = ({ anniversaryPlan }) => {
  const chatSession = React.useMemo(() => createAnniBertChatSession(anniversaryPlan), [anniversaryPlan]);

  return (
    <ChatInterface
      chatSession={chatSession}
      title="Plan with AnniBERT"
      subtitle={`Occasion: ${anniversaryPlan.occasion}`}
      placeholder="Ask for more gift ideas, plan an activity..."
      icon={ChatBubbleIcon}
      botAvatar={<GiftIcon className="w-5 h-5" />}
      initialBotMessageText={`Plan refined! I have the details for the ${anniversaryPlan.occasion}. Let's make it special! What should we brainstorm first?`}
    />
  );
};

export default InteractivePlannerView;
