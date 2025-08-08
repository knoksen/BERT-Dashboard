
import React from 'react';
import { CheckIcon } from './IconComponents';

interface Step {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
}

interface StepperProps {
  steps: Step[];
  currentStepId: string;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStepId }) => {
  const stepIds = steps.map(s => s.id);
  const currentIndex = stepIds.indexOf(currentStepId);

  return (
    <nav aria-label="Progress" className="w-full max-w-2xl mx-auto mb-8 px-4">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentIndex;
          const isCurrent = step.id === currentStepId;

          return (
            <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
              {/* Connector line */}
              {stepIdx > 0 && (
                <div
                  className={`absolute right-1/2 top-1/2 -translate-y-1/2 w-full h-0.5 ${isCompleted || isCurrent ? 'bg-accent' : 'bg-dark-border'}`}
                  aria-hidden="true"
                />
              )}
              
              <div className="relative flex flex-col items-center w-24">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCompleted ? 'bg-accent' : isCurrent ? 'bg-accent/80 border-2 border-accent' : 'bg-dark-card border-2 border-dark-border'}
                    `}
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-6 w-6 text-gray-900" />
                    ) : (
                      <step.icon
                        className={`h-6 w-6 transition-colors duration-300 ${isCurrent ? 'text-white' : 'text-dark-text-secondary'}`}
                      />
                    )}
                  </div>
                  <span className={`mt-2 text-center text-xs font-semibold transition-colors duration-300 ${isCurrent || isCompleted ? 'text-white' : 'text-dark-text-secondary'}`}>
                      {step.name}
                  </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;