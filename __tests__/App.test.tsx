import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';

// Smoke test to ensure the root renders mode selection heading text
it('renders Tool Suite header initially', async () => {
  render(<App />);
  const heading = await screen.findByRole('heading', { name: /Tool Suite/i });
  expect(heading).toBeInTheDocument();
});
