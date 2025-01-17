import { Order } from '../types/orders';
import supabase from './supabaseClient';

interface SplitOrderItems {
  originalItems: string[];
  newItems: string[];
}

export const splitOrder = async (
  orderId: string,
  items: SplitOrderItems
): Promise<void> => {
  const { data: originalOrder, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError) throw orderError;

  // Create new order with split items
  const newOrderItems = originalOrder.items.filter(
    item => items.newItems.includes(item.id)
  );

  const { data: newOrder, error: createError } = await supabase
    .from('orders')
    .insert([{
      ...originalOrder,
      id: undefined,
      orderNumber: `${originalOrder.orderNumber}-S1`,
      items: newOrderItems,
      parentOrderId: orderId,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (createError) throw createError;

  // Update original order
  const remainingItems = originalOrder.items.filter(
    item => items.originalItems.includes(item.id)
  );

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      items: remainingItems,
      childOrders: [newOrder.id],
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);

  if (updateError) throw updateError;
};