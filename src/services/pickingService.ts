import { Order } from '../types/orders';
import { PickingBatch, PickingItem, PickingRoute } from '../types/picking';

// Utility to group similar orders based on shared products
export const createPickingBatches = (orders: Order[]): PickingBatch[] => {
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const batches: PickingBatch[] = [];
  
  // Group orders by shared products
  const orderGroups = groupOrdersBySharedProducts(pendingOrders);
  
  orderGroups.forEach((orders, index) => {
    const items = consolidateItems(orders);
    batches.push({
      id: `batch-${Date.now()}-${index}`,
      orders: orders.map(order => order.id),
      items,
      status: 'pending'
    });
  });
  
  return batches;
};

// Group orders that share common products
const groupOrdersBySharedProducts = (orders: Order[]): Order[][] => {
  const groups: Order[][] = [];
  const maxOrdersPerBatch = 5;
  
  orders.forEach(order => {
    let addedToGroup = false;
    
    // Try to add to existing group
    for (const group of groups) {
      if (group.length >= maxOrdersPerBatch) continue;
      
      if (hasSharedProducts(order, group)) {
        group.push(order);
        addedToGroup = true;
        break;
      }
    }
    
    // Create new group if not added to existing one
    if (!addedToGroup) {
      groups.push([order]);
    }
  });
  
  return groups;
};

// Check if an order shares products with orders in a group
const hasSharedProducts = (order: Order, group: Order[]): boolean => {
  const groupProductIds = new Set(
    group.flatMap(o => o.items.map(item => item.productId))
  );
  
  return order.items.some(item => groupProductIds.has(item.productId));
};

// Consolidate items from multiple orders
const consolidateItems = (orders: Order[]): PickingItem[] => {
  const itemsMap = new Map<string, PickingItem>();
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const existing = itemsMap.get(item.productId);
      
      if (existing) {
        existing.totalQuantity += item.quantity;
        existing.orderQuantities.push({
          orderId: order.id,
          quantity: item.quantity
        });
      } else {
        itemsMap.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          location: item.location,
          totalQuantity: item.quantity,
          orderQuantities: [{
            orderId: order.id,
            quantity: item.quantity
          }],
          picked: 0
        });
      }
    });
  });
  
  return Array.from(itemsMap.values());
};

// Calculate optimal picking route using a simple nearest neighbor algorithm
export const calculatePickingRoute = (items: PickingItem[]): PickingRoute => {
  const locations = items.map(item => item.location);
  const optimizedPath = nearestNeighborPath(locations);
  
  return {
    items: items.sort((a, b) => 
      optimizedPath.indexOf(a.location) - optimizedPath.indexOf(b.location)
    ),
    optimizedPath,
    estimatedDistance: calculatePathDistance(optimizedPath)
  };
};

// Simple nearest neighbor algorithm for path optimization
const nearestNeighborPath = (locations: string[]): string[] => {
  if (locations.length <= 1) return locations;
  
  const path: string[] = [locations[0]];
  const remaining = new Set(locations.slice(1));
  
  while (remaining.size > 0) {
    const current = path[path.length - 1];
    let nearest = Array.from(remaining)[0];
    let minDistance = calculateDistance(current, nearest);
    
    remaining.forEach(location => {
      const distance = calculateDistance(current, location);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = location;
      }
    });
    
    path.push(nearest);
    remaining.delete(nearest);
  }
  
  return path;
};

// Calculate distance between two locations (simplified)
const calculateDistance = (loc1: string, loc2: string): number => {
  const [aisle1, section1] = loc1.split('-').map(n => parseInt(n.replace(/\D/g, '')));
  const [aisle2, section2] = loc2.split('-').map(n => parseInt(n.replace(/\D/g, '')));
  
  return Math.abs(aisle1 - aisle2) + Math.abs(section1 - section2);
};

// Calculate total path distance
const calculatePathDistance = (path: string[]): number => {
  let distance = 0;
  for (let i = 1; i < path.length; i++) {
    distance += calculateDistance(path[i-1], path[i]);
  }
  return distance;
};