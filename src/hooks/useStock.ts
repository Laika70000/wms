import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-hot-toast';

export const useStock = (productId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adjustStock = async (params: {
    quantity: number;
    type: 'reception' | 'adjustment';
    notes?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.rpc('update_stock', {
        p_product_id: productId,
        p_quantity: params.quantity,
        p_type: params.type,
        p_notes: params.notes
      });

      if (error) throw error;
      toast.success('Stock ajusté avec succès');
    } catch (err) {
      console.error('Erreur lors de l\'ajustement du stock:', err);
      setError('Erreur lors de l\'ajustement du stock');
      toast.error('Erreur lors de l\'ajustement du stock');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    adjustStock
  };
};