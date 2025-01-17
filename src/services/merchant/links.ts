import { executeRPC } from '../databaseFunctions';
import { toast } from 'react-hot-toast';

export const linkMerchant = async (merchantId: string): Promise<void> => {
  try {
    await executeRPC('link_merchant_to_logistician', { merchant_id: merchantId });
    toast.success('Merchant linked successfully');
  } catch (error) {
    console.error('Error linking merchant:', error);
    toast.error('Failed to link merchant');
    throw error;
  }
};

export const unlinkMerchant = async (merchantId: string): Promise<void> => {
  try {
    await executeRPC('unlink_merchant_from_logistician', { merchant_id: merchantId });
    toast.success('Merchant unlinked successfully');
  } catch (error) {
    console.error('Error unlinking merchant:', error);
    toast.error('Failed to unlink merchant');
    throw error;
  }
};