import { render, screen, waitFor } from '@testing-library/react';
import { it, expect, afterEach } from 'vitest';
import React from 'react';
import App from '../App';

// Smoke test to ensure the root renders mode selection heading text
it('renders Tool Suite header initially', async () => {
  render(<App />);
  const heading = await screen.findByRole('heading', { name: /Tool Suite/i });
  expect(heading).toBeInTheDocument();
});

afterEach(() => {
  // Clean up hash to avoid cross-test interference
  if (window.location.hash) {
    window.location.hash = '';
  }
});

it('navigates to DarkBERT when hash = #chat on load', async () => {
  window.location.hash = '#chat';
  render(<App />);
  await screen.findByRole('heading', { name: /DarkBERT Studio/i });
  expect(window.location.hash).toBe('#chat');
});

it('navigates to ArtisanBERT when hash = #art on load', async () => {
  window.location.hash = '#art';
  render(<App />);
  await screen.findByRole('heading', { name: /ArtisanBERT Studio/i });
  expect(window.location.hash).toBe('#art');
});

it('syncs hash when switching from hashed mode back to tool suite', async () => {
  window.location.hash = '#chat';
  render(<App />);
  await screen.findByRole('heading', { name: /DarkBERT Studio/i });
  // Click back button
  const backBtn = await screen.findByRole('button', { name: /Back to selection/i });
  backBtn.click();
  await screen.findByRole('heading', { name: /Tool Suite/i });
  await waitFor(() => {
    expect(window.location.hash).toBe('');
  });
});
