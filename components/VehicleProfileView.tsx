
import React, { useState } from 'react';
import { VehicleProfile } from '../types';
import { generateVehicleProfile } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { WrenchIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface VehicleProfileViewProps {
  onProfileGenerated: (profile: VehicleProfile) => void;
}

const placeholderIdea = `1969 Ford Mustang Boss 429`;

const VehicleProfileView: React.FC<VehicleProfileViewProps> = ({ onProfileGenerated }) => {
  const [vehicleName, setVehicleName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<VehicleProfile | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['CARBERT'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setProfile(null);
    try {
      const result = await generateVehicleProfile(vehicleName || placeholderIdea);
      spendCredits(cost);
      setProfile(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (profile) {
        onProfileGenerated(profile);
    }
  };
  
  const handleProfileChange = <K extends keyof VehicleProfile>(field: K, value: VehicleProfile[K]) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    if (profile) {
        const updatedSpecs = [...profile.specifications];
        updatedSpecs[index] = {...updatedSpecs[index], [field]: value};
        handleProfileChange('specifications', updatedSpecs);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <WrenchIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Generate Vehicle Profile</h2>
              <p className="text-dark-text-secondary">Provide a vehicle name to generate its technical profile.</p>
            </div>
          </div>

          <textarea
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
            placeholder={placeholderIdea}
            className="w-full h-20 p-4 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-none"
            disabled={isLoading || !!profile}
          />
          <p className="text-sm text-dark-text-secondary mt-2">
            Enter a vehicle name (e.g., 'Ferrari F40', 'Lancia Stratos'), or leave blank to use the example.
          </p>
        </div>

        {!profile && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <WrenchIcon className="w-5 h-5" />}
                {isLoading ? 'Generating...' : `Generate Profile (-${cost} Credits)`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {profile && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Curate Your Vehicle Profile</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <EditableInput label="Manufacturer" value={profile.manufacturer} onChange={e => handleProfileChange('manufacturer', e.target.value)} />
                    <EditableInput label="Model" value={profile.modelName} onChange={e => handleProfileChange('modelName', e.target.value)} />
                    <EditableInput label="Year" value={String(profile.year)} onChange={e => handleProfileChange('year', Number(e.target.value) || profile.year)} />
                </div>
                <EditableTextarea label="History" value={profile.history} onChange={e => handleProfileChange('history', e.target.value)} rows={3} />
                <EditableTextarea label="Design Notes" value={profile.designNotes} onChange={e => handleProfileChange('designNotes', e.target.value)} rows={2} />
                
                <div>
                    <label className="font-semibold text-accent/80 text-sm">Specifications</label>
                    <div className="bg-gray-900/70 p-3 rounded-lg border border-dark-border mt-1 space-y-2">
                        {profile.specifications.map((spec, index) => (
                             <div key={index} className="grid grid-cols-2 gap-2 items-center">
                                <EditableInput value={spec.key} onChange={e => handleSpecChange(index, 'key', e.target.value)} nested />
                                <EditableInput value={spec.value} onChange={e => handleSpecChange(index, 'value', e.target.value)} nested />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    Proceed to Calibration
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const commonInputClass = "w-full p-2 border rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200";

const EditableInput: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label?: string, nested?: boolean}> = ({value, onChange, label, nested}) => (
     <div>
        {label && <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>}
        <input type="text" value={value} onChange={onChange} className={`${commonInputClass} ${nested ? 'bg-gray-800 border-gray-700' : 'bg-gray-900 border-dark-border'}`} />
     </div>
);

const EditableTextarea: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, label: string, rows: number}> = ({value, onChange, label, rows}) => (
     <div>
        <label className="font-semibold text-accent/80 text-sm mb-1 block">{label}</label>
        <textarea value={value} onChange={onChange} className={`${commonInputClass} bg-gray-900 border-dark-border resize-y`} rows={rows} />
     </div>
);

export default VehicleProfileView;
