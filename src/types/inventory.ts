export interface Product {
  id: string;
  merchantId: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  description?: string;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
  minStock: number;
  maxStock?: number;
  storageConditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  aisle: string;
  section: string;
  shelf: string;
  capacity: number;
  occupied: number;
}

export interface ProductLocation {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  locationId: string;
  type: 'reception' | 'order' | 'transfer' | 'adjustment';
  quantity: number;
  reference?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface ProductStock {
  totalQuantity: number;
  locations: {
    location: Location;
    quantity: number;
  }[];
}