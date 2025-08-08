

import React from 'react';
import { createTravelBertChatSession } from '../services/geminiService';
import { Itinerary } from '../types';
import ChatInterface from './shared/ChatInterface';
import { ChatBubbleIcon, GlobeIcon } from './shared/IconComponents';

interface TravelConciergeViewProps {
  itinerary: Itinerary;
}

const TravelConciergeView: React.FC<TravelConciergeViewProps> = ({ itinerary }) => {
  const chatSession = React.useMemo(() => createTravelBertChatSession(itinerary), [itinerary]);

  return (
    <ChatInterface
      chatSession={chatSession}
      title="Chat with TravelBERT"
      subtitle={`Trip: ${itinerary.tripName}`}
      placeholder="Ask for packing tips, restaurant ideas, etc..."
      icon={ChatBubbleIcon}
      botAvatar={<GlobeIcon className="w-5 h-5" />}
      initialBotMessageText={`Wonderful! I have your itinerary for "${itinerary.tripName}" right here. I'm so excited for you! What's the first thing on your mind? Packing? Food? Let's get you ready for an amazing adventure.`}
    />
  );
};

export default TravelConciergeView;
