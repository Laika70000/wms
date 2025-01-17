export interface Product {
  id: string;
  merchantId: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  description?: string;
  price: number;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
  minStock: number;
  maxStock?: number;
  createdAt: string;
  updatedAt: string;
}