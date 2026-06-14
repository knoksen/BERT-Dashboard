import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerisBertaNerView from '../components/VerisBertaNerView';

vi.mock('../services/nerService', () => ({
  runNerAnalysis: vi.fn(),
}));

import { runNerAnalysis } from '../services/nerService';

describe('VerisBertaNerView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while request is in progress', async () => {
    (runNerAnalysis as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<VerisBertaNerView />);
    fireEvent.change(screen.getByLabelText(/incident narrative/i), {
      target: { value: 'LockBit accessed VPN account and deployed ransomware.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /run ner analysis/i }));

    expect(screen.getByText(/running ner analysis/i)).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    (runNerAnalysis as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Hugging Face rate limit reached. Please retry shortly.'),
    );

    render(<VerisBertaNerView />);
    fireEvent.change(screen.getByLabelText(/incident narrative/i), {
      target: { value: 'Example narrative text' },
    });
    fireEvent.click(screen.getByRole('button', { name: /run ner analysis/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/rate limit/i);
    });
  });

  it('shows success grouped panels and truncated warning', async () => {
    (runNerAnalysis as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      model: { name: 'org/model', revision: 'main', labels: ['ACTOR', 'ASSET', 'ACTION', 'ATTRIBUTE', 'OTHER'] },
      limits: { maxChars: 12000, truncated: true },
      entities: [
        {
          category: 'ACTOR',
          text: 'LockBit',
          start: 0,
          end: 7,
          confidence: 0.91,
          source: 'model',
          originalLabel: 'B-ACTOR',
          normalized: { veris: {} },
        },
      ],
      grouped: {
        ACTOR: [
          {
            category: 'ACTOR',
            text: 'LockBit',
            start: 0,
            end: 7,
            confidence: 0.91,
            source: 'model',
            originalLabel: 'B-ACTOR',
            normalized: { veris: {} },
          },
        ],
        ASSET: [],
        ACTION: [],
        ATTRIBUTE: [],
        OTHER: [],
      },
      warnings: ['Assistive output; analyst review required.'],
      telemetry: { latencyMs: 120, emptyExtraction: false, inputChars: 100, requestId: 'req-1' },
    });

    render(<VerisBertaNerView />);
    fireEvent.change(screen.getByLabelText(/incident narrative/i), {
      target: { value: 'LockBit accessed VPN account and deployed ransomware.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /run ner analysis/i }));

    await waitFor(() => {
      const modelLine = screen.getByText(/Model:/i);
      expect(modelLine).toHaveTextContent('org/model');
      expect(modelLine).toHaveTextContent('(main)');
      expect(screen.getByText(/Input exceeded 12,000 characters and was truncated/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Actor/i })).toBeInTheDocument();
    });
  });
});
