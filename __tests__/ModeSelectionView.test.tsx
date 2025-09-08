/// <reference types="vitest" />
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ModeSelectionView from '../components/ModeSelectionView';

// We'll mock the credits context so we can simulate different credit balances.
let mockCreditsState: any;

vi.mock('../contexts/CreditContext', () => ({
  useCredits: () => mockCreditsState,
}));

describe('ModeSelectionView', () => {
  beforeEach(() => {
    mockCreditsState = {
      credits: 0,
      spendCredits: vi.fn(),
      addCredits: vi.fn(),
      showPaywall: vi.fn(),
      hidePaywall: vi.fn(),
    };
  });

  it('renders a grid of mode cards', () => {
    render(<ModeSelectionView onModeSelect={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    // Expect at least 10 tools (actual list is larger; using a lower bound for stability)
    expect(buttons.length).toBeGreaterThanOrEqual(10);
  });

  it('places NEW tool (NewsBERT Analyzer) first with NEW badge', () => {
    render(<ModeSelectionView onModeSelect={vi.fn()} />);
    const firstButton = screen.getAllByRole('button')[0];
    expect(within(firstButton).getByText(/NewsBERT Analyzer/i)).toBeInTheDocument();
    // Ensure at least one NEW badge exists inside the first button
    const newBadges = within(firstButton).queryAllByText(/NEW/i);
    expect(newBadges.length).toBeGreaterThan(0);
  });

  it('disables a card when credits are below the tool cost', () => {
    mockCreditsState.credits = 0; // Many tools cost > 0 so first will be disabled
    render(<ModeSelectionView onModeSelect={vi.fn()} />);
    const firstButton = screen.getAllByRole('button')[0];
    expect(firstButton).toBeDisabled();
  });

  it('enables selection and calls onModeSelect when sufficient credits', async () => {
    const onModeSelect = vi.fn();
    mockCreditsState.credits = 100; // Enough for any tool
    render(<ModeSelectionView onModeSelect={onModeSelect} />);
    // Pick a specific known mode title that exists: "Artist Scam Detector"
    const artistButton = screen.getByRole('button', { name: /Artist Scam Detector/i });
    expect(artistButton).toBeEnabled();
    await userEvent.click(artistButton);
    expect(onModeSelect).toHaveBeenCalledTimes(1);
  });

  it('locks a specific high-cost tool when credits are low (e.g., FinanceBERT Gateway)', () => {
    mockCreditsState.credits = 5; // FinanceBERT costs 15
    render(<ModeSelectionView onModeSelect={vi.fn()} />);
    const financeBtn = screen.getByRole('button', { name: /FinanceBERT Gateway/i });
    expect(financeBtn).toBeDisabled();
  });
});
