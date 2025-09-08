/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Stepper from '../components/shared/Stepper';

const DummyIcon: React.FC<{ className?: string }> = ({ className }) => <svg data-testid="icon" className={className} />;

const steps = [
  { id: 'A', name: 'Alpha', icon: DummyIcon },
  { id: 'B', name: 'Beta', icon: DummyIcon },
  { id: 'C', name: 'Gamma', icon: DummyIcon }
];

describe('Stepper', () => {
  it('renders all steps and highlights current', () => {
    render(<Stepper steps={steps} currentStepId="B" />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    // Current step should have text-white class
    const beta = screen.getByText('Beta');
    expect(beta.className).toMatch(/text-white/);
  });
});
