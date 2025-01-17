import { executeRPC } from '../databaseFunctions';

export const linkMerchant = async (merchantId: string): Promise<void> => {
  await executeRPC('link_merchant_to_logistician', { merchant_id: merchantId });
};

export const unlinkMerchant = async (merchantId: string): Promise<void> => {
  await executeRPC('unlink_merchant_from_logistician', { merchant_id: merchantId });
};