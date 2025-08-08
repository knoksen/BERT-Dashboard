

import React from 'react';
import { createCarbertChatSession } from '../services/geminiService';
import { VehicleProfile } from '../types';
import ChatInterface from './shared/ChatInterface';
import { ChatBubbleIcon, WrenchIcon } from './shared/IconComponents';

interface TechQaViewProps {
  vehicleProfile: VehicleProfile;
}

const TechQaView: React.FC<TechQaViewProps> = ({ vehicleProfile }) => {
  const chatSession = React.useMemo(() => createCarbertChatSession(vehicleProfile), [vehicleProfile]);

  return (
    <ChatInterface
      chatSession={chatSession}
      title="Q&A with CarBERT"
      subtitle={`Vehicle: ${vehicleProfile.year} ${vehicleProfile.manufacturer} ${vehicleProfile.modelName}`}
      placeholder="Ask about specs, history, or modifications..."
      icon={ChatBubbleIcon}
      botAvatar={<WrenchIcon className="w-5 h-5" />}
      initialBotMessageText={`Engine calibration complete. I've got the full profile for the ${vehicleProfile.year} ${vehicleProfile.modelName}. Ask me anything.`}
    />
  );
};

export default TechQaView;
