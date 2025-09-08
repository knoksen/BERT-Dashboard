/// <reference types="vitest" />
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import ProcessingView from '../components/shared/ProcessingView';
import { FINE_TUNING_STEPS } from '../constants';

// Simple stub icon component
const StubIcon: React.FC<{ className?: string }> = ({ className }) => <svg data-testid="stub-icon" className={className} />;

describe('ProcessingView (timed progression)', () => {
  it('iterates through all steps and calls onComplete', async () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    render(
      <ProcessingView
        title="Fine Tune"
        description="Testing progression"
        processingSteps={FINE_TUNING_STEPS}
        icon={StubIcon}
        startButtonText="Start"
        processingButtonText="Working..."
        completeButtonText="Done"
        onComplete={onComplete}
      />
    );

    // Initial state
    expect(screen.getByText(/Ready to begin\./i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Start/i }));

    // Advance all steps
    await act(async () => {
      vi.advanceTimersByTime(1200 * (FINE_TUNING_STEPS.length + 1));
    });
    // Final status message appears
    await screen.findByText(/Fine-tuning successful!/i);
    const doneBtn = await screen.findByRole('button', { name: /Done/i });
  await userEvent.click(doneBtn);
    expect(onComplete).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
