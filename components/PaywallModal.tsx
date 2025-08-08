
import React from 'react';
import { useCredits } from '../contexts/CreditContext';
import { CoinsIcon, PlusIcon } from './shared/IconComponents';

interface CreditPackageCardProps {
  amount: number;
  price: string;
  title: string;
  description: string;
  onPurchase: () => void;
}

const CreditPackageCard: React.FC<CreditPackageCardProps> = ({ amount, price, title, description, onPurchase }) => (
  <div className="bg-gray-900/80 border border-dark-border rounded-xl p-6 text-center flex flex-col justify-between hover:border-accent/70 transition-colors duration-200">
    <div>
        <h3 className="text-2xl font-bold text-accent">{title}</h3>
        <div className="flex justify-center items-center gap-2 my-4">
            <CoinsIcon className="w-8 h-8 text-yellow-400"/>
            <p className="text-4xl font-bold text-white">{amount}</p>
        </div>
        <p className="text-dark-text-secondary mb-6">{description}</p>
    </div>
    <button
      onClick={onPurchase}
      className="w-full px-6 py-3 bg-accent text-gray-900 font-bold text-lg rounded-lg hover:bg-accent-hover transition-colors duration-200 flex items-center justify-center gap-2"
    >
      <PlusIcon className="w-5 h-5"/>
      Purchase for {price}
    </button>
  </div>
);


const PaywallModal: React.FC = () => {
  const { addCredits, hidePaywall } = useCredits();

  const handlePurchase = (amount: number) => {
    addCredits(amount);
    hidePaywall();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={hidePaywall}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-dark-card shadow-2xl shadow-accent/10 rounded-2xl border border-dark-border w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center">
            <h2 className="text-4xl font-extrabold text-white mb-2">Insufficient Credits</h2>
            <p className="text-dark-text-secondary text-lg">
                You need more credits to use this tool. Please purchase a credit pack to continue.
            </p>
        </div>

        <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <CreditPackageCard 
                title="Starter Pack"
                amount={50}
                description="Perfect for trying out a few more tools."
                price="$4.99"
                onPurchase={() => handlePurchase(50)}
            />
            <CreditPackageCard 
                title="Pro Pack"
                amount={150}
                description="Our best value for frequent users."
                price="$9.99"
                onPurchase={() => handlePurchase(150)}
            />
            <CreditPackageCard 
                title="Mega Pack"
                amount={500}
                description="Unlock the full potential of the AI suite."
                price="$24.99"
                onPurchase={() => handlePurchase(500)}
            />
        </div>

        <button
            onClick={hidePaywall}
            className="absolute top-4 right-4 p-2 text-dark-text-secondary hover:text-white rounded-full bg-dark-card/50 hover:bg-dark-border transition-colors"
            aria-label="Close"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default PaywallModal;
