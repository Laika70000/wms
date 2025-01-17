// Product Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  location: string;
  category: string;
  lastUpdated: string;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  productId: string;
  quantity: number;
  product: Product;
}

// Location Types
export interface Location {
  id: string;
  name: string;
  zone: string;
  capacity: number;
  occupied: number;
}