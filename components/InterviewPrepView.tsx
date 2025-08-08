

import React from 'react';
import { createRoBertaChatSession } from '../services/geminiService';
import { ResumeProfile } from '../types';
import ChatInterface from './shared/ChatInterface';
import { ChatBubbleIcon, BriefcaseIcon } from './shared/IconComponents';

interface InterviewPrepViewProps {
  resumeProfile: ResumeProfile;
}

const InterviewPrepView: React.FC<InterviewPrepViewProps> = ({ resumeProfile }) => {
  const chatSession = React.useMemo(() => createRoBertaChatSession(resumeProfile), [resumeProfile]);

  return (
    <ChatInterface
      chatSession={chatSession}
      title="Prep with RoBERTa"
      subtitle={`Candidate: ${resumeProfile.contactInfo.name}`}
      placeholder="Ask for interview advice, practice a question..."
      icon={ChatBubbleIcon}
      botAvatar={<BriefcaseIcon className="w-5 h-5" />}
      initialBotMessageText={`Hello, ${resumeProfile.contactInfo.name}! It's great to connect. I've reviewed your resume and it looks like you have some excellent experience. I'm ready to help you prepare. What's on your mind?`}
    />
  );
};

export default InterviewPrepView;
