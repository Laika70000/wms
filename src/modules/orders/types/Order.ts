export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  items: OrderItem[];
  total: number;
  createdAt: string;
}