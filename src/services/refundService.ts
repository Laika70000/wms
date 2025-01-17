import { Order } from '../types/orders';
import supabase from './supabaseClient';

interface RefundItem {
  itemId: string;
  quantity: number;
}

export const processRefund = async (
  orderId: string,
  items: RefundItem[],
  reason: string
): Promise<void> => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError) throw orderError;

  const refundAmount = calculateRefundAmount(order, items);

  const { error: refundError } = await supabase
    .from('refunds')
    .insert([{
      order_id: orderId,
      amount: refundAmount,
      reason,
      items: items,
      status: 'completed',
      processed_by: (await supabase.auth.getUser()).data.user?.id
    }]);

  if (refundError) throw refundError;

  // Update order status and refund information
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      refund_status: isFullRefund(order, items) ? 'full' : 'partial',
      refund_amount: refundAmount,
      refund_reason: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);

  if (updateError) throw updateError;
};

const calculateRefundAmount = (order: Order, items: RefundItem[]): number => {
  return items.reduce((total, refundItem) => {
    const orderItem = order.items.find(item => item.id === refundItem.itemId);
    if (!orderItem) return total;
    return total + (orderItem.price * refundItem.quantity);
  }, 0);
};

const isFullRefund = (order: Order, items: RefundItem[]): boolean => {
  return order.items.every(orderItem => {
    const refundItem = items.find(item => item.itemId === orderItem.id);
    return refundItem && refundItem.quantity === orderItem.quantity;
  });
};