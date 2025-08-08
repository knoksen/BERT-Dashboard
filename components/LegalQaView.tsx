

import React, { useEffect, useRef, useMemo } from 'react';
import { createLaBertChatSession } from '../services/geminiService';
import { CaseBrief } from '../types';
import { ChatBubbleIcon, SendIcon, ScaleIcon } from './shared/IconComponents';
import LoadingSpinner from './shared/LoadingSpinner';
import { useChat } from '../../hooks/useChat';

interface LegalQaViewProps {
  caseBrief: CaseBrief;
}

const LegalQaView: React.FC<LegalQaViewProps> = ({ caseBrief }) => {
  const chatSession = useMemo(() => createLaBertChatSession(caseBrief), [caseBrief]);
  const { messages, setMessages, input, setInput, isThinking, setIsThinking, handleSend, messagesEndRef } = useChat(chatSession);
  const isInitialMessageSent = useRef(false);

  useEffect(() => {
    const sendInitialMessage = async () => {
      if (chatSession && !isInitialMessageSent.current && messages.length === 0) {
        isInitialMessageSent.current = true;
        setIsThinking(true);

        const botMessageId = `bot-init-${Date.now()}`;
        setMessages(prev => [...prev, { id: botMessageId, sender: 'bot', text: '' }]);

        try {
          const stream = await chatSession.sendMessageStream({ message: "Let's begin." });
          let fullResponse = '';
          for await (const chunk of stream) {
            fullResponse += chunk.text;
            setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: fullResponse } : msg));
          }
        } catch (error) {
          console.error("Error sending initial message:", error);
          const errorMessage = 'An error occurred while starting the session.';
          setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: errorMessage } : msg));
        } finally {
          setIsThinking(false);
        }
      }
    };
    sendInitialMessage();
  }, [chatSession, messages.length, setMessages, setIsThinking]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border flex flex-col flex-grow">
        <div className="p-4 border-b border-dark-border flex items-center gap-4">
          <ChatBubbleIcon className="w-8 h-8 text-accent" />
          <div>
            <h2 className="text-2xl font-bold text-white">Q&A with LaBERT</h2>
            <p className="text-dark-text-secondary truncate pr-4">Case: {caseBrief.caseTitle}</p>
          </div>
        </div>

        <div className="flex-grow p-4 overflow-y-auto bg-gray-900/50">
          <div className="space-y-4">
            {messages.map((msg, index) => {
                const isLastBotMessage = msg.sender === 'bot' && index === messages.length -1;
                return (
                  <div key={msg.id} className={`flex items-end gap-2 animate-message-in ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-gray-900 text-sm flex-shrink-0"><ScaleIcon className="w-5 h-5"/></div>}
                    <div className={`max-w-md lg:max-w-xl px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-dark-border text-dark-text rounded-bl-none'} flex items-center`}>
                      {msg.text ? <p className="whitespace-pre-wrap">{msg.text}</p> : (isThinking && isLastBotMessage && <LoadingSpinner size={20} className="text-dark-text-secondary m-1" />)}
                      {isThinking && isLastBotMessage && msg.text && <span className="inline-block w-0.5 h-5 bg-dark-text ml-1 animate-pulse" style={{ animationDuration: '1.2s' }}></span>}
                    </div>
                  </div>
                );
             })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 border-t border-dark-border">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about legal concepts, procedures, or facts of the case..."
              className="w-full p-3 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200"
              disabled={isThinking}
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              className="p-3 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex-shrink-0 transition-colors duration-200"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LegalQaView;
