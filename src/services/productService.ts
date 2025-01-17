import supabase from './supabaseClient';
import { Product } from '../types/inventory';

export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        sku: product.sku,
        category: product.category,
        description: product.description,
        price: product.price || 0,
        weight: product.weight,
        width: product.width,
        height: product.height,
        depth: product.depth,
        min_stock: product.minStock || 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const importProducts = async (file: File): Promise<void> => {
  try {
    const text = await file.text();
    const rows = text.split('\n').slice(1); // Skip header row
    
    // Process rows in smaller batches for better reliability
    const batchSize = 25;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
        .map(row => {
          const [name, sku, category, price, description, weight, width, height, depth, minStock] = row.split(',');
          return {
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
        .filter(p => p.name && p.sku); // Only include valid products

      if (batch.length > 0) {
        const { error } = await supabase
          .from('products')
          .insert(batch);

        if (error) {
          console.error('Batch insert error:', error);
          throw error;
        }

        // Add a small delay between batches to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  } catch (error) {
    console.error('Error importing products:', error);
    throw error;
  }
};