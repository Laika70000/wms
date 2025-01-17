import supabase from '../../../services/supabaseClient';
import { Merchant } from '../types/Merchant';

export const getMerchants = async (): Promise<Merchant[]> => {
  const { data, error } = await supabase
    .from('merchants')
    .select('*, sources (*)');

  if (error) throw error;
  return data;
};

export const linkMerchant = async (merchantId: string): Promise<void> => {
  const { error } = await supabase.rpc('link_merchant_to_logistician', {
    merchant_id: merchantId
  });

  if (error) throw error;
};

export const unlinkMerchant = async (merchantId: string): Promise<void> => {
  const { error } = await supabase.rpc('unlink_merchant_from_logistician', {
    merchant_id: merchantId
  });

  if (error) throw error;
};