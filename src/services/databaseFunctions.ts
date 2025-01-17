import { supabase } from './supabaseClient';

export const executeRPC = async (functionName: string, params?: any) => {
  try {
    const { data, error } = await supabase.rpc(functionName, params);
    
    if (error) {
      console.error(`Error executing ${functionName}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error in ${functionName}:`, error);
    throw error;
  }
};

// Merchant-related RPCs
export const linkMerchantToLogistician = async (merchantId: string) => {
  return executeRPC('link_merchant_to_logistician', { merchant_id: merchantId });
};

export const unlinkMerchantFromLogistician = async (merchantId: string) => {
  return executeRPC('unlink_merchant_from_logistician', { merchant_id: merchantId });
};

// Statistics RPCs
export const getLogisticianStats = async () => {
  return executeRPC('get_logistician_stats');
};

// Inventory RPCs
export const getProductStock = async (productId: string) => {
  return executeRPC('get_product_stock', { product_id: productId });
};

export const isLowStock = async (productId: string) => {
  return executeRPC('is_low_stock', { product_id: productId });
};