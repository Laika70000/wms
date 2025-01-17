import axios from 'axios';
import { Order } from '../../types/orders';

const SHOPIFY_API_VERSION = '2023-01';
const SHOPIFY_BASE_URL = import.meta.env.VITE_SHOPIFY_ADMIN_URL;
const SHOPIFY_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN;

const shopifyClient = axios.create({
  baseURL: `${SHOPIFY_BASE_URL}/admin/api/${SHOPIFY_API_VERSION}`,
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
    'Content-Type': 'application/json',
  },
});

export const fetchShopifyOrders = async (): Promise<Order[]> => {
  try {
    const { data } = await shopifyClient.get('/orders.json');
    return data.orders.map(mapShopifyOrder);
  } catch (error) {
    console.error('Error fetching Shopify orders:', error);
    throw error;
  }
};

export const updateShopifyOrderStatus = async (orderId: string, status: string) => {
  try {
    await shopifyClient.put(`/orders/${orderId}.json`, {
      order: {
        id: orderId,
        status,
      },
    });
  } catch (error) {
    console.error('Error updating Shopify order:', error);
    throw error;
  }
};

const mapShopifyOrder = (shopifyOrder: any): Order => ({
  id: shopifyOrder.id,
  orderNumber: shopifyOrder.name,
  customerName: `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`,
  date: shopifyOrder.created_at,
  status: mapShopifyStatus(shopifyOrder.fulfillment_status),
  source: 'shopify',
  carrier: 'pending',
  priority: 'normal',
  items: shopifyOrder.line_items.map((item: any) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.title,
    quantity: item.quantity,
    location: '',
    price: parseFloat(item.price),
  })),
  total: parseFloat(shopifyOrder.total_price),
});

const mapShopifyStatus = (status: string | null): Order['status'] => {
  switch (status) {
    case null:
      return 'pending';
    case 'fulfilled':
      return 'shipped';
    case 'partial':
      return 'processing';
    default:
      return 'pending';
  }
};