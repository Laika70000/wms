import supabase from '../../../services/supabaseClient';
import { StockMovement } from '../types/Stock';

export const updateStock = async (params: {
  productId: string;
  locationId: string;
  quantity: number;
  type: 'reception' | 'adjustment' | 'transfer';
  notes?: string;
}): Promise<void> => {
  const { error } = await supabase.rpc('update_stock', {
    p_product_id: params.productId,
    p_location_id: params.locationId,
    p_quantity: params.quantity,
    p_type: params.type,
    p_notes: params.notes
  });

  if (error) throw error;
};

export const getStockMovements = async (productId: string): Promise<StockMovement[]> => {
  const { data, error } = await supabase
    .from('stock_movements')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};