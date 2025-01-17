import supabase from './supabaseClient';
import { toast } from 'react-hot-toast';

interface UpdateStockParams {
  productId: string;
  locationId: string;
  quantity: number;
  type: 'reception' | 'order' | 'transfer' | 'adjustment';
  reference?: string;
  notes?: string;
}

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const updateStock = async ({
  productId,
  locationId,
  quantity,
  type,
  reference,
  notes
}: UpdateStockParams): Promise<void> => {
  try {
    // Input validation
    if (!productId || !locationId) {
      throw new Error('Product ID and Location ID are required');
    }

    if (!isValidUUID(productId)) {
      throw new Error('Invalid product ID format');
    }
    if (!isValidUUID(locationId)) {
      throw new Error('Invalid location ID format');
    }

    if (typeof quantity !== 'number' || isNaN(quantity)) {
      throw new Error('Invalid quantity value');
    }

    if (!['reception', 'order', 'transfer', 'adjustment'].includes(type)) {
      throw new Error('Invalid movement type');
    }

    const { data, error } = await supabase.rpc('update_stock', {
      p_product_id: productId,
      p_location_id: locationId,
      p_quantity: quantity,
      p_type: type,
      p_reference: reference,
      p_notes: notes
    });

    if (error) {
      if (error.code === '23514') { // check_capacity constraint violation
        throw new Error('Not enough capacity in selected location');
      }
      if (error.code === '22P02') { // invalid input syntax
        throw new Error('Invalid input format');
      }
      throw new Error(error.message || 'Failed to update stock');
    }

    toast.success('Stock updated successfully');
  } catch (error) {
    console.error('Error updating stock:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Failed to update stock');
    }
    throw error;
  }
};