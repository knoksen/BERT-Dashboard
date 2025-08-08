

import React from 'react';
import { createRoBertoChatSession } from '../services/geminiService';
import { RecipeProfile } from '../types';
import ChatInterface from './shared/ChatInterface';
import { ChatBubbleIcon, ChefHatIcon } from './shared/IconComponents';

interface CookingSessionViewProps {
  recipeProfile: RecipeProfile;
}

const CookingSessionView: React.FC<CookingSessionViewProps> = ({ recipeProfile }) => {
  const chatSession = React.useMemo(() => createRoBertoChatSession(recipeProfile), [recipeProfile]);

  return (
    <ChatInterface
      chatSession={chatSession}
      title="Cook with RoBERTo"
      subtitle={`Dish: ${recipeProfile.dishName}`}
      placeholder="Ask for help with a step, substitutions, etc..."
      icon={ChatBubbleIcon}
      botAvatar={<ChefHatIcon className="w-5 h-5" />}
      initialBotMessageText={`Magnifico! Mise en place is complete. I'm excited to cook "${recipeProfile.dishName}" with you. I have the recipe right here. Let me know when you're ready for the first step!`}
    />
  );
};

export default CookingSessionView;
