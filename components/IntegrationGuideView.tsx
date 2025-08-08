

import React, { useMemo } from 'react';
import { createFinanceBertChatSession } from '../services/geminiService';
import { PaymentGatewayConfig } from '../types';
import { ChatBubbleIcon, SendIcon, CheckIcon, CopyIcon, TerminalIcon, CreditCardIcon } from './shared/IconComponents';
import LoadingSpinner from './shared/LoadingSpinner';
import { useChat } from '../../hooks/useChat';

const CodeBlock: React.FC<{ title: string; language: string; code: string }> = ({ title, language, code }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <h4 className="font-semibold text-accent/80 text-sm mb-1 block">{title}</h4>
            <div className="bg-gray-900 border border-dark-border rounded-lg overflow-hidden relative">
                <div className="flex justify-between items-center px-4 py-2 bg-dark-border/50">
                    <span className="text-xs font-mono text-dark-text-secondary">{language}</span>
                    <button onClick={handleCopy} className="text-xs text-dark-text-secondary hover:text-accent flex items-center gap-1.5 transition-colors">
                        {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <pre className="p-4 text-sm overflow-x-auto"><code className={`language-${language}`}>{code}</code></pre>
            </div>
        </div>
    );
};


const ApiKeyDisplay: React.FC<{ provider: string; publicKey: string; secretKey: string }> = ({ provider, publicKey, secretKey }) => {
    return (
        <div>
            <h5 className="font-bold text-lg text-white mb-2">{provider} API Keys</h5>
            <div className="space-y-2">
                <CodeBlock title="Public Key" language="text" code={publicKey} />
                <CodeBlock title="Secret Key" language="text" code={secretKey} />
            </div>
        </div>
    );
};


interface IntegrationGuideViewProps {
  gatewayConfig: PaymentGatewayConfig;
}

const IntegrationGuideView: React.FC<IntegrationGuideViewProps> = ({ gatewayConfig }) => {
  const chatSession = useMemo(() => createFinanceBertChatSession(gatewayConfig), [gatewayConfig]);
  const { messages, setMessages, input, setInput, isThinking, handleSend, messagesEndRef } = useChat(chatSession);

  React.useEffect(() => {
    if (chatSession) {
      setMessages([{
        id: 'init',
        sender: 'bot',
        text: `Excellent. I have the complete configuration for ${gatewayConfig.companyName} right here, including the Node.js backend and React frontend code. I'm ready to assist. What's your first question?`,
      }]);
    }
  }, [chatSession, gatewayConfig.companyName, setMessages]);


  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6">
      {/* Left side: Code and Keys */}
      <div className="flex-1 lg:flex-grow-[1.2] bg-dark-card shadow-lg rounded-xl border border-dark-border flex flex-col">
          <div className="p-4 border-b border-dark-border flex items-center gap-4">
              <CreditCardIcon className="w-8 h-8 text-accent" />
              <div>
                  <h2 className="text-xl font-bold text-white">Integration Guide</h2>
                  <p className="text-dark-text-secondary text-sm">Generated Code & API Keys</p>
              </div>
          </div>
          <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6">
              <DisplaySection title="API Keys">
                  {gatewayConfig.apiKeys.map(key => <ApiKeyDisplay key={key.provider} provider={key.provider} publicKey={key.publicKey} secretKey={key.secretKey} />)}
              </DisplaySection>
              <DisplaySection title="Backend Code">
                  <CodeBlock title="server.js" language="javascript" code={gatewayConfig.backendCode} />
              </DisplaySection>
               <DisplaySection title="Frontend Code">
                  <CodeBlock title="CheckoutForm.jsx" language="jsx" code={gatewayConfig.frontendCode} />
              </DisplaySection>
          </div>
      </div>
      
      {/* Right side: Chat */}
      <div className="flex-1 lg:flex-grow-[0.8] h-[70vh] lg:h-auto flex flex-col">
          <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border flex flex-col flex-grow h-full">
            <div className="p-4 border-b border-dark-border flex items-center gap-4">
              <ChatBubbleIcon className="w-8 h-8 text-accent" />
              <div>
                <h2 className="text-xl font-bold text-white">Chat with FinanceBERT</h2>
                <p className="text-dark-text-secondary text-sm">Ask about the generated code</p>
              </div>
            </div>

            <div className="flex-grow p-4 overflow-y-auto bg-gray-900/50">
              <div className="space-y-4">
                {messages.map((msg, index) => {
                    const isLastBotMessage = msg.sender === 'bot' && index === messages.length -1;
                    return (
                      <div key={msg.id} className={`flex items-end gap-2 animate-message-in ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-gray-900 text-sm flex-shrink-0"><TerminalIcon className="w-5 h-5"/></div>}
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
                  placeholder="e.g., Explain the webhook route..."
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

const DisplaySection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
        <div className="p-4 bg-gray-900/40 border border-dark-border/50 rounded-lg space-y-4">
            {children}
        </div>
    </div>
);


export default IntegrationGuideView;