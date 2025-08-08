

import React, { useState } from 'react';
import { RecipeProfile } from '../types';
import { generateRecipeProfile, generateShoppingList } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { ChefHatIcon, ClipboardListIcon, CopyIcon, CheckIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface IngredientListViewProps {
  onProfileGenerated: (profile: RecipeProfile) => void;
}

const placeholderIngredients = `chicken breast, rice, broccoli, soy sauce, garlic, ginger`;
const placeholderPreferences = `Looking for a healthy, quick weeknight dinner. Gluten-free if possible.`;

const IngredientListView: React.FC<IngredientListViewProps> = ({ onProfileGenerated }) => {
  const [ingredients, setIngredients] = useState('');
  const [preferences, setPreferences] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<RecipeProfile | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['ROBERTO'] ?? 0;
  
  const [shoppingList, setShoppingList] = useState<string[] | null>(null);
  const [isGeneratingList, setIsGeneratingList] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isCopied, setIsCopied] = useState(false);


  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setProfile(null);
    setShoppingList(null);
    try {
      const result = await generateRecipeProfile({
        ingredients: ingredients || placeholderIngredients,
        preferences: preferences || placeholderPreferences
      });
      spendCredits(cost);
      setProfile(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!profile) return;

    setIsGeneratingList(true);
    setError(null);
    try {
        const list = await generateShoppingList(profile.ingredients);
        setShoppingList(list);
    } catch(err) {
        setError(err instanceof Error ? err.message : 'Could not generate shopping list.');
    } finally {
        setIsGeneratingList(false);
    }
  };

  const handleToggleCheckedItem = (item: string) => {
    setCheckedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item)) {
            newSet.delete(item);
        } else {
            newSet.add(item);
        }
        return newSet;
    });
  };

  const handleCopyList = () => {
    if (shoppingList) {
        navigator.clipboard.writeText(shoppingList.join('\n'));
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleProceed = () => {
    if (profile) {
        onProfileGenerated(profile);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <ChefHatIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Pantry Check</h2>
              <p className="text-dark-text-secondary">List your ingredients to generate a custom recipe.</p>
            </div>
          </div>

          <div className="space-y-4">
              <EditableTextarea label="Available Ingredients" placeholder={placeholderIngredients} value={ingredients} onChange={e => setIngredients(e.target.value)} disabled={isLoading || !!profile} rows={3}/>
              <EditableTextarea label="Preferences & Dietary Needs" placeholder={placeholderPreferences} value={preferences} onChange={e => setPreferences(e.target.value)} disabled={isLoading || !!profile} rows={2}/>
          </div>
          <p className="text-sm text-dark-text-secondary mt-2">
            Enter what you have on hand, or leave blank to use the examples.
          </p>
        </div>

        {!profile && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <ChefHatIcon className="w-5 h-5" />}
                {isLoading ? 'Generating...' : `Generate Recipe (-${cost} Credits)`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {profile && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Your Custom Recipe</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <DisplaySection title="Dish Name">
                    <h4 className="text-xl font-bold text-accent">{profile.dishName}</h4>
                </DisplaySection>
                <DisplaySection title="Description">
                    <p className="italic">{profile.description}</p>
                </DisplaySection>
                <div className="grid grid-cols-2 gap-4">
                    <DisplaySection title="Prep Time">
                        <p>{profile.prepTime}</p>
                    </DisplaySection>
                    <DisplaySection title="Cook Time">
                        <p>{profile.cookTime}</p>
                    </DisplaySection>
                </div>
                 <DisplaySection title="Ingredients">
                    <ul className="space-y-1 list-disc pl-5">
                        {profile.ingredients.map((item, idx) => <li key={idx}><strong>{item.amount}</strong> {item.name}</li>)}
                    </ul>
                </DisplaySection>
                 <DisplaySection title="Instructions">
                    <ol className="space-y-2 list-decimal pl-5">
                        {profile.instructions.map((step, idx) => <li key={idx}>{step}</li>)}
                    </ol>
                </DisplaySection>
                 {shoppingList && (
                    <DisplaySection title="Shopping List">
                        <div className="flex justify-end mb-2">
                            <button onClick={handleCopyList} className="text-xs text-dark-text-secondary hover:text-accent flex items-center gap-1.5 transition-colors">
                                {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4"/>}
                                {isCopied ? 'Copied!' : 'Copy List'}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {shoppingList.map((item, idx) => (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={checkedItems.has(item)}
                                        onChange={() => handleToggleCheckedItem(item)}
                                        className="w-5 h-5 bg-gray-700 border-dark-border rounded text-accent focus:ring-accent"
                                    />
                                    <span className={checkedItems.has(item) ? 'line-through text-dark-text-secondary' : ''}>
                                        {item}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </DisplaySection>
                 )}
            </div>
            <div className="mt-6 flex justify-between items-center">
                {!shoppingList && (
                    <button
                        onClick={handleGenerateShoppingList}
                        disabled={isGeneratingList}
                        className="px-4 py-2 border-2 border-dashed border-dark-border text-dark-text-secondary font-semibold rounded-lg hover:border-accent hover:text-accent flex items-center gap-2 transition-colors duration-200 disabled:opacity-50"
                    >
                        {isGeneratingList ? <LoadingSpinner size={20} /> : <ClipboardListIcon className="w-5 h-5" />}
                        {isGeneratingList ? 'Generating...' : 'Generate Shopping List'}
                    </button>
                )}
                <div className={shoppingList ? 'w-full text-right' : ''}>
                    <button
                        onClick={handleProceed}
                        className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                    >
                        Proceed to Prep
                    </button>
                </div>
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


export default IngredientListView;
