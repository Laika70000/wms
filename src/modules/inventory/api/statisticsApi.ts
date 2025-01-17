import supabase from '../../../services/supabaseClient';
import { InventoryStatistics } from '../types/Statistics';

export const getInventoryStatistics = async (): Promise<InventoryStatistics> => {
  const [
    { data: lowStock },
    { data: stockValue },
    { data: turnover }
  ] = await Promise.all([
    supabase.rpc('get_low_stock_products'),
    supabase.rpc('get_total_stock_value'),
    supabase.rpc('get_stock_turnover')
  ]);

  return {
    totalProducts: 0, // À calculer à partir des produits
    lowStockProducts: lowStock?.length || 0,
    totalValue: stockValue || 0,
    stockTurnover: turnover || 0
  };
};