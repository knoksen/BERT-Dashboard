/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import PaywallModal from '../components/PaywallModal';

// Hoisted spy functions so the factory can close over them
const addCredits = vi.fn();
const hidePaywall = vi.fn();

vi.mock('../contexts/CreditContext', () => ({
  useCredits: () => ({ addCredits, hidePaywall })
}));

describe('PaywallModal', () => {
  it('purchases a pack and closes', async () => {
    render(<PaywallModal />);
    const starterBtn = await screen.findByRole('button', { name: /Purchase for \$4\.99/i });
    await userEvent.click(starterBtn);
  expect(addCredits).toHaveBeenCalledWith(50);
  expect(hidePaywall).toHaveBeenCalled();
  });

  it('close button triggers hide', async () => {
    render(<PaywallModal />);
    const closeBtn = await screen.findByRole('button', { name: /close/i });
    await userEvent.click(closeBtn);
  expect(hidePaywall).toHaveBeenCalled();
  });
});
