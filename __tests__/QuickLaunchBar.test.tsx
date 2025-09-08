import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { it, expect } from 'vitest';

// Basic tests for the mobile quick launch bar hash navigation

it('renders quick launch bar and navigates to Art mode', async () => {
  // Ensure starting from tool suite
  window.location.hash = '';
  render(<App />);
  // Quick launch should be present
  const bar = await screen.findByTestId('quick-launch-bar');
  expect(bar).toBeInTheDocument();
  // Click Art
  const artBtn = screen.getByRole('button', { name: /Art/i });
  await userEvent.click(artBtn);
  // Heading should switch
  const heading = await screen.findByRole('heading', { name: /ArtisanBERT Studio/i });
  expect(heading).toBeInTheDocument();
  expect(window.location.hash).toMatch(/#art/);
});

it('sets #chat hash when Chat quick launch pressed', async () => {
  window.location.hash = '';
  render(<App />);
  const chatBtn = screen.getByRole('button', { name: /Chat/i });
  await userEvent.click(chatBtn);
  const heading = await screen.findByRole('heading', { name: /DarkBERT Studio/i });
  expect(heading).toBeInTheDocument();
  expect(window.location.hash).toBe('#chat');
});

it('preserves #tuning alias when Tuning button pressed', async () => {
  window.location.hash = '';
  render(<App />);
  const tuningBtn = screen.getByRole('button', { name: /Tuning/i });
  await userEvent.click(tuningBtn);
  const heading = await screen.findByRole('heading', { name: /DarkBERT Studio/i });
  expect(heading).toBeInTheDocument();
  expect(window.location.hash).toBe('#tuning');
});