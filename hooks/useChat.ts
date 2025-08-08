
import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage } from '../types';

export const useChat = (chatSession: Chat | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const currentInput = input.trim();
    if (!currentInput || isThinking || !chatSession) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, sender: 'user', text: currentInput };
    const botMessageId = `bot-${Date.now()}`;
    const botPlaceholder: ChatMessage = { id: botMessageId, sender: 'bot', text: '' };

    setMessages((prev) => [...prev, userMessage, botPlaceholder]);
    setInput('');
    setIsThinking(true);

    try {
      const stream = await chatSession.sendMessageStream({ message: currentInput });
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
      }

      if (fullResponse.trim() === '') {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId ? { ...msg, text: "I'm not sure how to respond to that. Could you rephrase?" } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === botMessageId ? { ...msg, text: 'Sorry, I encountered an error. Please try again.' } : msg
        )
      );
    } finally {
      setIsThinking(false);
    }
  };

  return { messages, setMessages, input, setInput, isThinking, setIsThinking, handleSend, messagesEndRef };
};
