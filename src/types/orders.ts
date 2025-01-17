import { Product } from './inventory';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  location: string;
  price: number;
  refunded?: boolean;
  returnReason?: string;
}

export interface OrderSplit {
  id: string;
  originalOrderId: string;
  newOrderId: string;
  reason: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  date: string;
  status: 'pending' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'returned' | 'cancelled' | 'refunded';
  source: 'manual' | 'shopify' | 'amazon' | 'marketplace';
  carrier: 'ups' | 'fedex' | 'dhl' | 'local';
  priority: 'high' | 'normal' | 'low';
  items: OrderItem[];
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  tags?: string[];
  parentOrderId?: string; // Pour les commandes fractionnées
  childOrders?: string[]; // IDs des commandes fractionnées
  refundStatus?: 'none' | 'partial' | 'full';
  refundAmount?: number;
  refundReason?: string;
}

export interface OrderFilters {
  search: string;
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
  source: string[];
}