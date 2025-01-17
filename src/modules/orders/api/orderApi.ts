import supabase from '../../../services/supabaseClient';
import { Order } from '../types/Order';

export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)');

  if (error) throw error;
  return data;
};

export const createOrder = async (order: Partial<Order>): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) throw error;
  return data;
};