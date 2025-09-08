/// <reference types="vitest" />
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { useChat } from '../hooks/useChat';

// Minimal form wrapper to exercise the hook
const HookHarness: React.FC<{ chatSession: any }> = ({ chatSession }) => {
  const { messages, input, setInput, handleSend, isThinking } = useChat(chatSession);
  return (
    <form onSubmit={handleSend}>
      <input aria-label="chat-input" value={input} onChange={e => setInput(e.target.value)} />
      <button type="submit" disabled={isThinking}>Send</button>
      <ul>
        {messages.map(m => <li key={m.id} data-testid={m.sender}>{m.text || '...'} </li>)}
      </ul>
    </form>
  );
};

// Utility to build an async iterable stream from chunks
function makeStream(chunks: string[], delay = 0) {
  return {
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) {
        if (delay) await new Promise(r => setTimeout(r, delay));
        yield { text: chunk };
      }
    }
  };
}

describe('useChat hook', () => {
  it('streams bot response incrementally', async () => {
    const sendMessageStream = vi.fn().mockResolvedValue(makeStream(['Hel', 'lo', '!']));
    const chatSession = { sendMessageStream };
    render(<HookHarness chatSession={chatSession} />);

    await userEvent.type(screen.getByLabelText('chat-input'), 'Hi there');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    expect(sendMessageStream).toHaveBeenCalled();

    // Incremental updates
    await screen.findAllByTestId('bot');
    // Final concatenated text
    await screen.findByText('Hello!');
  });

  it('handles empty model response with fallback', async () => {
    const sendMessageStream = vi.fn().mockResolvedValue(makeStream(['   ']));
    const chatSession = { sendMessageStream };
    render(<HookHarness chatSession={chatSession} />);

    await userEvent.type(screen.getByLabelText('chat-input'), 'Test');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    await screen.findByText("I'm not sure how to respond to that. Could you rephrase?");
  });

  it('handles stream error gracefully', async () => {
    const sendMessageStream = vi.fn().mockRejectedValue(new Error('boom'));
    const chatSession = { sendMessageStream };
    render(<HookHarness chatSession={chatSession} />);

    await userEvent.type(screen.getByLabelText('chat-input'), 'Error');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    await screen.findByText('Sorry, I encountered an error. Please try again.');
  });

  it('ignores submit when no session or blank input', async () => {
    const sendMessageStream = vi.fn();
    render(<HookHarness chatSession={null} />);
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(sendMessageStream).not.toHaveBeenCalled();
  });
});
