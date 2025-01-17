import supabase from './supabaseClient';
import { Product, Location, StockMovement, ProductStock } from '../types/inventory';

export const getProducts = async (merchantId?: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapProductFromDB);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (id: string): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapProductFromDB(data);
};

export const getProductStock = async (productId: string): Promise<ProductStock> => {
  const { data: locations, error: locationsError } = await supabase
    .from('product_locations')
    .select(`
      quantity,
      location:locations (*)
    `)
    .eq('product_id', productId);

  if (locationsError) throw locationsError;

  const totalQuantity = locations.reduce((sum, loc) => sum + loc.quantity, 0);

  return {
    totalQuantity,
    locations: locations.map(loc => ({
      location: loc.location,
      quantity: loc.quantity
    }))
  };
};

export const getLowStockProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .rpc('get_low_stock_products');

  if (error) throw error;
  return data.map(mapProductFromDB);
};

export const getStockMovements = async (
  productId: string,
  limit = 10
): Promise<StockMovement[]> => {
  const { data, error } = await supabase
    .from('stock_movements')
    .select(`
      *,
      location:locations (*)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

// Helper function to map database fields to TypeScript interface
const mapProductFromDB = (data: any): Product => ({
  id: data.id,
  merchantId: data.merchant_id,
  name: data.name,
  sku: data.sku,
  barcode: data.barcode,
  category: data.category,
  description: data.description,
  weight: data.weight,
  width: data.width,
  height: data.height,
  depth: data.depth,
  minStock: data.min_stock,
  maxStock: data.max_stock,
  storageConditions: data.storage_conditions,
  createdAt: data.created_at,
  updatedAt: data.updated_at
});