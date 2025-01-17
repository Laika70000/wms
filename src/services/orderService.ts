import { Order, OrderItem } from '../types/orders';
import supabase from './supabaseClient';
import { fetchShopifyOrders, updateShopifyOrderStatus } from './api/shopifyApi';
import { fetchAmazonOrders, updateAmazonOrderStatus } from './api/amazonApi';

// Existing functions...

export const importOrdersFromCSV = async (file: File): Promise<Order[]> => {
  try {
    const text = await file.text();
    const rows = text.split('\n').filter(row => row.trim());
    const headers = rows[0].split(',');
    
    const orders: Order[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',');
      const orderData: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        orderData[header.trim()] = values[index]?.trim() || '';
      });
      
      // Map CSV data to Order type
      const order: Order = {
        id: crypto.randomUUID(),
        orderNumber: orderData.orderNumber,
        customerName: orderData.customerName,
        email: orderData.email,
        date: orderData.date || new Date().toISOString(),
        status: 'pending',
        source: 'manual',
        carrier: orderData.carrier as Order['carrier'] || 'local',
        priority: orderData.priority as Order['priority'] || 'normal',
        items: parseOrderItems(orderData.items || '[]'),
        total: parseFloat(orderData.total) || 0,
        shippingAddress: {
          street: orderData.shippingStreet || '',
          city: orderData.shippingCity || '',
          state: orderData.shippingState || '',
          postalCode: orderData.shippingPostalCode || '',
          country: orderData.shippingCountry || ''
        }
      };
      
      orders.push(order);
    }
    
    // Save imported orders to database
    const { error } = await supabase
      .from('orders')
      .insert(orders);
      
    if (error) throw error;
    
    return orders;
  } catch (error) {
    console.error('Error importing orders:', error);
    throw new Error('Failed to import orders from CSV');
  }
};

const parseOrderItems = (itemsString: string): OrderItem[] => {
  try {
    const items = JSON.parse(itemsString);
    return items.map((item: any) => ({
      id: crypto.randomUUID(),
      productId: item.productId,
      productName: item.productName,
      quantity: parseInt(item.quantity) || 1,
      location: item.location || '',
      price: parseFloat(item.price) || 0
    }));
  } catch {
    return [];
  }
};

// Export other existing functions...
export { getOrder, splitOrder, mergeOrders, processRefund, processReturn };