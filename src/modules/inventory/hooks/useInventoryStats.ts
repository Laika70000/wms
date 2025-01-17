import { useState, useEffect } from 'react';
import { getInventoryStatistics } from '../api/statisticsApi';
import { InventoryStatistics } from '../types/Statistics';

export const useInventoryStats = () => {
  const [stats, setStats] = useState<InventoryStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventoryStatistics();
      setStats(data);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refresh: loadStats
  };
};