import { useState, useEffect } from 'react';
import { AdminStats } from '../types/AdminStats';
import supabase from '../../../services/supabaseClient';

export const useStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    logisticiansCount: 0,
    merchantsCount: 0,
    ordersCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [logisticians, merchants, orders] = await Promise.all([
        supabase.from('logisticians').select('*', { count: 'exact' }),
        supabase.from('merchants').select('*', { count: 'exact' }),
        supabase.from('orders').select('*', { count: 'exact' })
          .in('status', ['pending', 'processing'])
      ]);

      setStats({
        logisticiansCount: logisticians.count || 0,
        merchantsCount: merchants.count || 0,
        ordersCount: orders.count || 0
      });
    } catch (err) {
      console.error('Error loading admin stats:', err);
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