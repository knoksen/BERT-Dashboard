/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreditProvider, useCredits } from '../contexts/CreditContext';
import { INITIAL_CREDITS } from '../constants';

const Consumer: React.FC = () => {
  const { credits, spendCredits, addCredits } = useCredits();
  return (
    <div>
      <p data-testid="credits">{credits}</p>
      <button onClick={() => spendCredits(5)}>spend5</button>
      <button onClick={() => addCredits(10)}>add10</button>
      <button onClick={() => spendCredits(999)}>spendAll</button>
    </div>
  );
};

describe('CreditContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes with INITIAL_CREDITS', () => {
    render(
      <CreditProvider>
        <Consumer />
      </CreditProvider>
    );
    expect(screen.getByTestId('credits').textContent).toBe(String(INITIAL_CREDITS));
  });

  it('spends and adds credits correctly and never goes below zero', () => {
    render(
      <CreditProvider>
        <Consumer />
      </CreditProvider>
    );
    const creditsNode = screen.getByTestId('credits');
    // Spend 5
    fireEvent.click(screen.getByText('spend5'));
    expect(Number(creditsNode.textContent)).toBe(INITIAL_CREDITS - 5);
    // Add 10
    fireEvent.click(screen.getByText('add10'));
    expect(Number(creditsNode.textContent)).toBe(INITIAL_CREDITS - 5 + 10);
    // Overspend (should clamp to 0)
    fireEvent.click(screen.getByText('spendAll'));
    expect(Number(creditsNode.textContent)).toBe(0);
  });
});
