import axios from 'axios';
import { Order } from '../../types/orders';

const AMAZON_SP_API_URL = import.meta.env.VITE_AMAZON_SP_API_URL;
const AMAZON_ACCESS_TOKEN = import.meta.env.VITE_AMAZON_ACCESS_TOKEN;

const amazonClient = axios.create({
  baseURL: AMAZON_SP_API_URL,
  headers: {
    'Authorization': `Bearer ${AMAZON_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export const fetchAmazonOrders = async (): Promise<Order[]> => {
  try {
    const { data } = await amazonClient.get('/orders/v0/orders');
    return data.Orders.map(mapAmazonOrder);
  } catch (error) {
    console.error('Error fetching Amazon orders:', error);
    throw error;
  }
};

export const updateAmazonOrderStatus = async (orderId: string, status: string) => {
  try {
    await amazonClient.put(`/orders/v0/orders/${orderId}/status`, {
      status,
    });
  } catch (error) {
    console.error('Error updating Amazon order:', error);
    throw error;
  }
};

const mapAmazonOrder = (amazonOrder: any): Order => ({
  id: amazonOrder.AmazonOrderId,
  orderNumber: amazonOrder.AmazonOrderId,
  customerName: amazonOrder.BuyerInfo.BuyerName || 'Amazon Customer',
  date: amazonOrder.PurchaseDate,
  status: mapAmazonStatus(amazonOrder.OrderStatus),
  source: 'amazon',
  carrier: mapAmazonCarrier(amazonOrder.ShipmentServiceLevelCategory),
  priority: amazonOrder.IsPrime ? 'high' : 'normal',
  items: [], // Will be populated with order items details
  total: parseFloat(amazonOrder.OrderTotal.Amount),
});

const mapAmazonStatus = (status: string): Order['status'] => {
  switch (status) {
    case 'Pending':
      return 'pending';
    case 'Unshipped':
      return 'processing';
    case 'Shipped':
      return 'shipped';
    case 'Delivered':
      return 'delivered';
    default:
      return 'pending';
  }
};

const mapAmazonCarrier = (service: string): string => {
  if (service.includes('UPS')) return 'ups';
  if (service.includes('FedEx')) return 'fedex';
  if (service.includes('DHL')) return 'dhl';
  return 'local';
};