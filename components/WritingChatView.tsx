

import React from 'react';
import { createStoryChatSession } from '../services/geminiService';
import { StoryPremise } from '../types';
import ChatInterface from './shared/ChatInterface';
import { ChatBubbleIcon } from './shared/IconComponents';

interface WritingChatViewProps {
  storyPremise: StoryPremise;
}

const WritingChatView: React.FC<WritingChatViewProps> = ({ storyPremise }) => {
  const chatSession = React.useMemo(() => createStoryChatSession(storyPremise), [storyPremise]);

  return (
    <ChatInterface
      chatSession={chatSession}
      title="Write with StoryBERT"
      subtitle={`Title: ${storyPremise.title}`}
      placeholder="Write a scene, ask for dialogue, or suggest a plot twist..."
      icon={ChatBubbleIcon}
      botAvatar={<span className="text-sm">SB</span>}
      initialBotMessageText={`The muse is ready! I have the details for "${storyPremise.title}". Let's write this story together. What should happen first?`}
    />
  );
};

export default WritingChatView;
