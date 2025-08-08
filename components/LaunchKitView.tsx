

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createLaunchBertChatSession } from '../services/geminiService';
import { LaunchAssets } from '../types';
import { ChatBubbleIcon, SendIcon, MegaphoneIcon, CheckIcon, CopyIcon } from './shared/IconComponents';
import LoadingSpinner from './shared/LoadingSpinner';
import { useChat } from '../../hooks/useChat';

const AssetBlock: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [copied, setCopied] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleCopy = () => {
        if (contentRef.current) {
            navigator.clipboard.writeText(contentRef.current.innerText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-accent/80 text-sm">{title}</h4>
                <button onClick={handleCopy} className="text-xs text-dark-text-secondary hover:text-accent flex items-center gap-1.5 transition-colors">
                    {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <div ref={contentRef} className="p-3 bg-gray-900/70 border border-dark-border rounded-lg text-dark-text space-y-1 whitespace-pre-wrap font-sans">
                {children}
            </div>
        </div>
    );
};

interface LaunchKitViewProps {
  launchAssets: LaunchAssets;
}

const LaunchKitView: React.FC<LaunchKitViewProps> = ({ launchAssets }) => {
  const chatSession = useMemo(() => createLaunchBertChatSession(launchAssets), [launchAssets]);
  const { messages, setMessages, input, setInput, isThinking, handleSend, messagesEndRef } = useChat(chatSession);

  useEffect(() => {
    if (chatSession) {
        setMessages([
          { id: 'init', sender: 'bot', text: `Your launch kit for ${launchAssets.productName} is ready! I've loaded all the assets. Ask me to rewrite the email, suggest different social media angles, or change the tone.` }
        ]);
    }
  }, [chatSession, launchAssets.productName, setMessages]);


  const twitterPost = launchAssets.socialPosts.find(p => p.platform === 'Twitter');
  const linkedInPost = launchAssets.socialPosts.find(p => p.platform === 'LinkedIn');

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6">
      <div className="flex-1 lg:flex-grow-[1.2] bg-dark-card shadow-lg rounded-xl border border-dark-border flex flex-col">
          <div className="p-4 border-b border-dark-border flex items-center gap-4">
              <MegaphoneIcon className="w-8 h-8 text-accent" />
              <div>
                  <h2 className="text-xl font-bold text-white">Launch Kit Assets</h2>
                  <p className="text-dark-text-secondary text-sm">Product: {launchAssets.productName}</p>
              </div>
          </div>
          <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-4">
              <AssetBlock title={`Email - Subject: ${launchAssets.emailAnnouncement.subject}`}>{launchAssets.emailAnnouncement.body}</AssetBlock>
              {twitterPost && <AssetBlock title="Social Post - Twitter/X">{twitterPost.content}</AssetBlock>}
              {linkedInPost && <AssetBlock title="Social Post - LinkedIn">{linkedInPost.content}</AssetBlock>}
              <AssetBlock title={`Press Release - ${launchAssets.pressRelease.headline}`}>{launchAssets.pressRelease.body}</AssetBlock>
          </div>
      </div>
      
      <div className="flex-1 lg:flex-grow-[0.8] h-[70vh] lg:h-auto flex flex-col">
          <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border flex flex-col flex-grow h-full">
            <div className="p-4 border-b border-dark-border flex items-center gap-4">
              <ChatBubbleIcon className="w-8 h-8 text-accent" />
              <div>
                <h2 className="text-xl font-bold text-white">Chat with LaunchBERT</h2>
                <p className="text-dark-text-secondary text-sm">Refine your marketing copy</p>
              </div>
            </div>

            <div className="flex-grow p-4 overflow-y-auto bg-gray-900/50">
              <div className="space-y-4">
                {messages.map((msg, index) => {
                    const isLastBotMessage = msg.sender === 'bot' && index === messages.length -1;
                    return (
                      <div key={msg.id} className={`flex items-end gap-2 animate-message-in ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-gray-900 text-sm flex-shrink-0"><MegaphoneIcon className="w-5 h-5"/></div>}
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
                  placeholder="e.g., Make the email more casual..."
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
    </div>
  );
};

export default LaunchKitView;
