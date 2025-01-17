import React, { createContext, useContext, useState, useEffect } from 'react';
import { Source } from '../types/sources';
import { useAuth } from './AuthContext';
import { fetchMerchantSources } from '../services/sourceService';
import { toast } from 'react-hot-toast';

interface SourceContextType {
  sources: Source[];
  loading: boolean;
  error: string | null;
  refreshSources: () => Promise<void>;
}

const SourceContext = createContext<SourceContextType | null>(null);

export const SourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshSources = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedSources = await fetchMerchantSources(user.id);
      setSources(fetchedSources);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Échec de la récupération des sources';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Erreur lors de la récupération des sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshSources();
    } else {
      setSources([]);
    }
  }, [user]);

  return (
    <SourceContext.Provider value={{ sources, loading, error, refreshSources }}>
      {children}
    </SourceContext.Provider>
  );
};

export const useSource = () => {
  const context = useContext(SourceContext);
  if (!context) {
    throw new Error('useSource doit être utilisé à l\'intérieur d\'un SourceProvider');
  }
  return context;
};