import { useState } from 'react';
import { updateStock } from '../api/stockApi';
import { StockMovement } from '../types/Stock';

export const useStock = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adjustStock = async (params: {
    productId: string;
    locationId: string;
    quantity: number;
    type: 'reception' | 'adjustment' | 'transfer';
    notes?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      await updateStock(params);
    } catch (err) {
      console.error('Error adjusting stock:', err);
      setError('Erreur lors de l\'ajustement du stock');
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