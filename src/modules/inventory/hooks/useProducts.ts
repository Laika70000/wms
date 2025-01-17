import { useState, useEffect } from 'react';
import { Product } from '../types/Product';
import * as inventoryApi from '../api/inventoryApi';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryApi.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refresh: loadProducts
  };
};