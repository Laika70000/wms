import { supabase } from '../supabaseClient';
import { Product } from '../../types/inventory';
import { toast } from 'react-hot-toast';

export const getMerchantProducts = async (): Promise<Product[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    toast.error('Error loading products');
    return [];
  }
};

export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('products')
      .insert([{ ...product, merchant_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    toast.success('Product created successfully');
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    toast.error('Error creating product');
    throw error;
  }
};

export const importProducts = async (file: File): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const text = await file.text();
    const rows = text.split('\n').slice(1); // Skip header

    const batchSize = 25;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
        .map(row => {
          const [name, sku, category, price, description, weight, width, height, depth, minStock] = row.split(',');
          return {
            merchant_id: user.id,
            name: name?.trim(),
            sku: sku?.trim(),
            category: category?.trim(),
            price: parseFloat(price) || 0,
            description: description?.trim(),
            weight: parseFloat(weight) || null,
            width: parseFloat(width) || null,
            height: parseFloat(height) || null,
            depth: parseFloat(depth) || null,
            min_stock: parseInt(minStock) || 0
          };
        })
        .filter(p => p.name && p.sku);

      if (batch.length > 0) {
        const { error } = await supabase
          .from('products')
          .insert(batch);

        if (error) throw error;
      }
    }

    toast.success('Products imported successfully');
  } catch (error) {
    console.error('Error importing products:', error);
    toast.error('Failed to import products');
    throw error;
  }
};