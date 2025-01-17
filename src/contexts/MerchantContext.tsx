import React, { createContext, useContext, useState, useEffect } from 'react';
import { Merchant } from '../types/merchants';
import { getMerchants } from '../services/merchant'; // Updated import path
import { useAuth } from './AuthContext';

interface MerchantContextType {
  merchants: Merchant[];
  loading: boolean;
  error: string | null;
  refreshMerchants: () => Promise<void>;
}

const MerchantContext = createContext<MerchantContextType | null>(null);

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshMerchants = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedMerchants = await getMerchants();
      setMerchants(fetchedMerchants);
    } catch (err) {
      console.error('Error fetching merchants:', err);
      setError('Unable to load merchants. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'logistician') {
      refreshMerchants();
    }
  }, [user]);

  return (
    <MerchantContext.Provider value={{ merchants, loading, error, refreshMerchants }}>
      {children}
    </MerchantContext.Provider>
  );
};

export const useMerchants = () => {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error('useMerchants must be used within a MerchantProvider');
  }
  return context;
};