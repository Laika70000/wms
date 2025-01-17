import supabase from '../../../services/supabaseClient';
import { Product } from '../types/Product';
import { toast } from 'react-hot-toast';

const validateProduct = (product: Partial<Product>) => {
  const errors = [];
  
  if (!product.name?.trim()) errors.push('Product name is required');
  if (!product.sku?.trim()) errors.push('SKU is required');
  if (!product.category?.trim()) errors.push('Category is required');
  if (typeof product.price !== 'number' || product.price < 0) errors.push('Valid price is required');
  
  return errors;
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    toast.error('Failed to load products');
    throw error;
  }
};

export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  try {
    // Validate product data
    const validationErrors = validateProduct(product);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('\n'));
    }

    // Format data
    const productData = {
      name: product.name!.trim(),
      sku: product.sku!.trim().toUpperCase(),
      category: product.category!.trim(),
      description: product.description?.trim(),
      price: product.price || 0,
      weight: product.weight || null,
      width: product.width || null,
      height: product.height || null,
      depth: product.depth || null,
      min_stock: product.minStock || 0
    };

    // Check if SKU exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('sku', productData.sku)
      .maybeSingle();

    if (existingProduct) {
      throw new Error(`A product with SKU ${productData.sku} already exists`);
    }

    // Create product
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('A product with this SKU already exists');
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Failed to create product');
    }
    throw error;
  }
};