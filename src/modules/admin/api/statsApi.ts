import supabase from '../../../services/supabaseClient';
import { AdminStats } from '../types/AdminStats';

export const getAdminStats = async (): Promise<AdminStats> => {
  const [
    { count: logisticiansCount },
    { count: merchantsCount },
    { count: ordersCount }
  ] = await Promise.all([
    supabase
      .from('logisticians')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('merchants')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'processing'])
  ]);

  return {
    logisticiansCount: logisticiansCount || 0,
    merchantsCount: merchantsCount || 0,
    ordersCount: ordersCount || 0
  };
};