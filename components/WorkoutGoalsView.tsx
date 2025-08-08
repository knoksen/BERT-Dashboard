
import React, { useState } from 'react';
import { WorkoutPlan } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { DumbbellIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface WorkoutGoalsViewProps {
  onPlanGenerated: (plan: WorkoutPlan) => void;
}

const placeholderGoals = `I want to lose about 10 pounds and build some muscle definition. I'm new to working out consistently.`;
const placeholderExperience = `I have access to a gym with standard dumbbells, barbells, and machines. I can work out 3-4 days a week.`;

const WorkoutGoalsView: React.FC<WorkoutGoalsViewProps> = ({ onPlanGenerated }) => {
  const [goals, setGoals] = useState('');
  const [experience, setExperience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['FITBERT'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await generateWorkoutPlan({
        goals: goals || placeholderGoals,
        experience: experience || placeholderExperience
      });
      spendCredits(cost);
      setPlan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (plan) {
        onPlanGenerated(plan);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <DumbbellIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Set Your Fitness Goals</h2>
              <p className="text-dark-text-secondary">Describe your goals to generate a personalized workout plan.</p>
            </div>
          </div>
          <div className="mb-4 p-3 bg-yellow-900/40 border border-yellow-500/50 text-yellow-300 rounded-lg text-sm">
             <strong>Disclaimer:</strong> This tool is for informational purposes only. Consult a medical professional before starting any fitness program.
          </div>

          <div className="space-y-4">
              <EditableTextarea label="Your Fitness Goals" placeholder={placeholderGoals} value={goals} onChange={e => setGoals(e.target.value)} disabled={isLoading || !!plan} rows={3}/>
              <EditableTextarea label="Your Experience & Equipment" placeholder={placeholderExperience} value={experience} onChange={e => setExperience(e.target.value)} disabled={isLoading || !!plan} rows={3}/>
          </div>
          <p className="text-sm text-dark-text-secondary mt-2">
            Enter your details, or leave blank to use the examples.
          </p>
        </div>

        {!plan && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <DumbbellIcon className="w-5 h-5" />}
                {isLoading ? 'Generating...' : `Generate Plan (-${cost} Credits)`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {plan && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Your Custom Workout Plan</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <DisplaySection title="Plan Name">
                    <h4 className="text-xl font-bold text-accent">{plan.planName}</h4>
                </DisplaySection>
                <div className="grid grid-cols-2 gap-4">
                     <DisplaySection title="Goal"><p>{plan.goal}</p></DisplaySection>
                     <DisplaySection title="Duration"><p>{plan.duration}</p></DisplaySection>
                </div>
                <DisplaySection title="Weekly Schedule">
                    {plan.schedule.map((day, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                            <h5 className="font-bold text-dark-text">{day.day}</h5>
                            {day.exercises.length > 0 && (
                                <ul className="list-disc pl-5 mt-1 text-dark-text-secondary">
                                    {day.exercises.map((ex, i) => <li key={i}>{ex.name}: {ex.sets} sets of {ex.reps} reps</li>)}
                                </ul>
                            )}
                        </div>
                    ))}
                </DisplaySection>
                <DisplaySection title="Nutrition Tips">
                    <ul className="space-y-1 list-disc pl-5">
                        {plan.nutritionTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                    </ul>
                </DisplaySection>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    Proceed to Adaptation
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const commonInputClass = "w-full p-2 border rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 bg-gray-900 border-dark-border disabled:bg-gray-800 disabled:cursor-not-allowed";

const EditableTextarea: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, label: string, rows: number, disabled: boolean, placeholder: string}> = ({value, onChange, label, rows, disabled, placeholder}) => (
     <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <textarea value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className={`${commonInputClass} resize-y`} rows={rows} />
     </div>
);

const DisplaySection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h4 className="font-semibold text-accent/80 text-sm mb-1 block">{title}</h4>
        <div className="p-3 bg-gray-900/70 border border-dark-border rounded-lg text-dark-text">
            {children}
        </div>
    </div>
);

export default WorkoutGoalsView;
