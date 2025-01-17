import { Order, OrderItem } from './orders';

export interface PickingBatch {
  id: string;
  orders: string[]; // Order IDs
  items: PickingItem[];
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface PickingItem {
  productId: string;
  productName: string;
  location: string;
  totalQuantity: number;
  orderQuantities: {
    orderId: string;
    quantity: number;
  }[];
  picked: number;
}

export interface PickingRoute {
  items: PickingItem[];
  optimizedPath: string[]; // Array of location IDs in optimal picking order
  estimatedDistance: number;
}