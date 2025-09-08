/// <reference types="vitest" />
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Deferred mock reference to avoid TDZ inside factory
let prepareDataMock: any;
vi.mock('../services/geminiService', () => ({
  prepareDataForFinetuning: (...args: any[]) => prepareDataMock(...args),
}));

// Mock ProcessingView to bypass timer-driven progress
vi.mock('../components/shared/ProcessingView', () => ({
  __esModule: true,
  default: (props: any) => {
    const React = require('react');
    const { useState } = React;
    const [started, setStarted] = useState(false);
    const [complete, setComplete] = useState(false);
    const Icon = props.icon || (() => null);
    return (
      <div>
        <h2>{props.title}</h2>
        {!started && !complete && (
          <button onClick={() => { setStarted(true); setComplete(true); }}>{props.startButtonText}</button>
        )}
        {complete && (
          <button onClick={props.onComplete}>{props.completeButtonText}</button>
        )}
      </div>
    );
  }
}));

// Dynamic import after mocks
import DarkbertStudio from '../components/DarkbertStudio';

// We'll mock the credits context similarly to earlier tests.
let mockCredits: any;
vi.mock('../contexts/CreditContext', () => ({
  useCredits: () => mockCredits,
}));

describe('DarkbertStudio integration', () => {
  beforeEach(() => {
  mockCredits = {
      credits: 100,
      spendCredits: vi.fn(),
      addCredits: vi.fn(),
      showPaywall: vi.fn(),
      hidePaywall: vi.fn(),
    };
  prepareDataMock = vi.fn();
  // Ensure deterministic starting state for usePersistentState hooks
  window.localStorage.clear();
  // Force initial step explicitly
  window.localStorage.setItem('darkbert_step', JSON.stringify('PREP'));
  });

  afterEach(() => {
    vi.clearAllTimers();
    window.localStorage.clear();
  });

  it('flows from data prep to tuning completion showing proceed button', async () => {
  prepareDataMock.mockResolvedValueOnce([
      { prompt: 'What is ransomware?', completion: 'Malware that encrypts files for ransom.' },
    ]);
  try {
    render(<DarkbertStudio />);

    // Click generate dataset
  // Ensure we are on step 1
  await screen.findByText(/Step 1: Prepare Fine-Tuning Data/i);
  const genBtn = await screen.findByRole('button', { name: /Generate Dataset/i });
    await userEvent.click(genBtn);
  expect(prepareDataMock).toHaveBeenCalledTimes(1);

    // Wait for dataset curation UI
    await screen.findByText(/Curate Your Dataset/i);

    // Proceed to fine-tuning step
    const proceedBtn = screen.getByRole('button', { name: /Proceed to Fine-Tuning/i });
    await userEvent.click(proceedBtn);

    // Tuning view appears
    await screen.findByText(/Step 2: Fine-Tune DarkBERT/i);
    const startBtn = screen.getByRole('button', { name: /Start Fine-Tuning/i });
    await userEvent.click(startBtn);
    // Proceed to Chat button should appear immediately via mock
    await screen.findByRole('button', { name: /Proceed to Chat/i });
  } finally {
    // no timers to restore due to mock
  }
  });

  it('shows paywall when insufficient credits and does not call prepareData', async () => {
  mockCredits.credits = 5; // cost is 10
  prepareDataMock.mockResolvedValue([]);
    render(<DarkbertStudio />);

  await screen.findByText(/Step 1: Prepare Fine-Tuning Data/i);
  const genBtn = await screen.findByRole('button', { name: /Generate Dataset/i });
    await userEvent.click(genBtn);

    // Allow any microtasks
    await act(async () => {});

    // Should not call API, should show paywall via showPaywall
    expect(prepareDataMock).not.toHaveBeenCalled();
    expect(mockCredits.showPaywall).toHaveBeenCalledTimes(1);
  });
});
