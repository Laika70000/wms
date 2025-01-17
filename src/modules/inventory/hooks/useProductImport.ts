import { useState } from 'react';
import { importProducts } from '../api/importApi';

export const useProductImport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importFromCSV = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      await importProducts(file);
    } catch (err) {
      console.error('Error importing products:', err);
      setError('Erreur lors de l\'import des produits');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    importFromCSV
  };
};