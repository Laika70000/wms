import supabase from './supabaseClient';

export const getInventoryStatistics = async (merchantId?: string) => {
  // Statistiques des produits
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq(merchantId ? 'merchant_id' : '', merchantId || '');

  if (productsError) throw productsError;

  // Produits en stock faible
  const { data: lowStock, error: lowStockError } = await supabase
    .rpc('get_low_stock_products', { merchant_id: merchantId });

  if (lowStockError) throw lowStockError;

  // Valeur totale du stock (à implémenter avec une nouvelle fonction RPC)
  const { data: stockValue, error: stockValueError } = await supabase
    .rpc('get_total_stock_value', { merchant_id: merchantId });

  if (stockValueError) throw stockValueError;

  // Taux de rotation (à implémenter avec une nouvelle fonction RPC)
  const { data: turnover, error: turnoverError } = await supabase
    .rpc('get_stock_turnover', { merchant_id: merchantId });

  if (turnoverError) throw turnoverError;

  return {
    totalProducts: products.length,
    lowStockProducts: lowStock.length,
    totalValue: stockValue || 0,
    stockTurnover: turnover || 0
  };
};