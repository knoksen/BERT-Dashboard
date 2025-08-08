

import React, { useState, useEffect, useMemo } from 'react';
import { createGitBertChatSession } from '../services/geminiService';
import { ReadmeContent } from '../types';
import { ChatBubbleIcon, SendIcon, GithubIcon } from './shared/IconComponents';
import LoadingSpinner from './shared/LoadingSpinner';
import { useChat } from '../../hooks/useChat';

const formatReadme = (content: ReadmeContent): string => {
    return `# ${content.projectName}

${content.badges.join(' ')}

${content.description}

## Installation

${content.installation}

## Usage

${content.usage}

## License

${content.license}
`;
};

interface ReadmeEditorViewProps {
  readmeContent: ReadmeContent;
}

const ReadmeEditorView: React.FC<ReadmeEditorViewProps> = ({ readmeContent }) => {
  const [readmeText, setReadmeText] = useState('');
  
  const chatSession = useMemo(() => {
      const formatted = formatReadme(readmeContent);
      setReadmeText(formatted);
      return createGitBertChatSession(formatted);
  }, [readmeContent]);
  
  const { messages, setMessages, input, setInput, isThinking, handleSend, messagesEndRef } = useChat(chatSession);

  useEffect(() => {
    if (chatSession) {
        setMessages([
            { id: 'init', sender: 'bot', text: "Your README.md has been generated! I've loaded it into my context. Ask me to add sections, rewrite parts, or suggest improvements." }
        ]);
    }
  }, [chatSession, setMessages]);


  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6">
      {/* Left side: README Editor */}
      <div className="flex-1 lg:flex-grow-[1.2] bg-dark-card shadow-lg rounded-xl border border-dark-border flex flex-col">
          <div className="p-4 border-b border-dark-border flex items-center gap-4">
              <GithubIcon className="w-8 h-8 text-accent" />
              <div>
                  <h2 className="text-xl font-bold text-white">README.md Editor</h2>
                  <p className="text-dark-text-secondary text-sm">File for: {readmeContent.projectName}</p>
              </div>
          </div>
          <div className="flex-grow p-1">
            <textarea
                value={readmeText}
                onChange={(e) => setReadmeText(e.target.value)}
                className="w-full h-full p-3 bg-gray-900/50 text-dark-text font-mono text-sm border-none rounded-b-xl focus:ring-2 focus:ring-inset focus:ring-accent focus:outline-none resize-none"
            />
          </div>
      </div>
      
      {/* Right side: Chat */}
      <div className="flex-1 lg:flex-grow-[0.8] h-[70vh] lg:h-auto flex flex-col">
          <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border flex flex-col flex-grow h-full">
            <div className="p-4 border-b border-dark-border flex items-center gap-4">
              <ChatBubbleIcon className="w-8 h-8 text-accent" />
              <div>
                <h2 className="text-xl font-bold text-white">Chat with GitBERT</h2>
                <p className="text-dark-text-secondary text-sm">Ask for README improvements</p>
              </div>
            </div>

            <div className="flex-grow p-4 overflow-y-auto bg-gray-900/50">
              <div className="space-y-4">
                {messages.map((msg, index) => {
                    const isLastBotMessage = msg.sender === 'bot' && index === messages.length -1;
                    return (
                      <div key={msg.id} className={`flex items-end gap-2 animate-message-in ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-gray-900 text-sm flex-shrink-0"><GithubIcon className="w-5 h-5"/></div>}
                        <div className={`max-w-md lg:max-w-xl px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-dark-border text-dark-text rounded-bl-none'} flex items-center`}>
                          {msg.text ? <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre> : (isThinking && isLastBotMessage && <LoadingSpinner size={20} className="text-dark-text-secondary m-1" />)}
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
                  placeholder="e.g., Add a 'Contributing' section..."
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

export default ReadmeEditorView;
