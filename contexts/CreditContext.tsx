
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { INITIAL_CREDITS } from '../constants';
import PaywallModal from '../components/PaywallModal';
import { CreditContextType } from '../types';
import usePersistentState from '../hooks/usePersistentState';

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [credits, setCredits] = usePersistentState<number>('user_credits', INITIAL_CREDITS);
  const [isPaywallVisible, setIsPaywallVisible] = useState<boolean>(false);

  const spendCredits = (amount: number) => {
    setCredits(prev => {
      const newTotal = prev - amount;
      return newTotal < 0 ? 0 : newTotal;
    });
  };

  const addCredits = (amount: number) => {
    setCredits(prev => prev + amount);
  };

  const showPaywall = () => setIsPaywallVisible(true);
  const hidePaywall = () => setIsPaywallVisible(false);

  const value = { credits, spendCredits, addCredits, showPaywall, hidePaywall };

  return (
    <CreditContext.Provider value={value}>
      {children}
      {isPaywallVisible && <PaywallModal />}
    </CreditContext.Provider>
  );
};

export const useCredits = (): CreditContextType => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
};
