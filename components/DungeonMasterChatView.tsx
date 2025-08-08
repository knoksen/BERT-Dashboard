

import React from 'react';
import { createQuestBertChatSession } from '../services/geminiService';
import { Quest } from '../types';
import ChatInterface from './shared/ChatInterface';
import { ChatBubbleIcon, ScrollIcon } from './shared/IconComponents';

interface DungeonMasterChatViewProps {
  quest: Quest;
}

const DungeonMasterChatView: React.FC<DungeonMasterChatViewProps> = ({ quest }) => {
  const chatSession = React.useMemo(() => createQuestBertChatSession(quest), [quest]);

  return (
    <ChatInterface
      chatSession={chatSession}
      title="Chat with the DM"
      subtitle={`Quest: ${quest.title}`}
      placeholder="Ask for dialogue, plot twists, more details..."
      icon={ChatBubbleIcon}
      botAvatar={<ScrollIcon className="w-5 h-5" />}
      initialBotMessageText={`Excellent! The adventure "${quest.title}" is laid out before you. How can I, the Dungeon Master, help you refine this tale?`}
    />
  );
};

export default DungeonMasterChatView;
