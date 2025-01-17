import { Order } from '../types/orders';
import supabase from './supabaseClient';

interface ReturnItem {
  itemId: string;
  quantity: number;
  reason: string;
}

export const processReturn = async (
  orderId: string,
  items: ReturnItem[]
): Promise<void> => {
  const { error: returnError } = await supabase
    .from('returns')
    .insert([{
      order_id: orderId,
      items: items,
      status: 'pending',
      created_by: (await supabase.auth.getUser()).data.user?.id
    }]);

  if (returnError) throw returnError;

  // Update order status
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'returned',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);

  if (updateError) throw updateError;

  // Create stock movements for returned items
  for (const item of items) {
    const { error: stockError } = await supabase.rpc('update_stock', {
      p_product_id: item.itemId,
      p_location_id: null, // Will be assigned during return processing
      p_quantity: item.quantity,
      p_type: 'return',
      p_reference: orderId,
      p_notes: item.reason
    });

    if (stockError) throw stockError;
  }
};