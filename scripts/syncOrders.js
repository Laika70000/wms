import { syncOrders } from '../src/services/orderService';

// Run order synchronization every 10 minutes
const SYNC_INTERVAL = 10 * 60 * 1000;

async function runSync() {
  try {
    console.log('Starting order synchronization...');
    await syncOrders();
    console.log('Order synchronization completed successfully');
  } catch (error) {
    console.error('Error during order synchronization:', error);
  }
}

// Initial sync
runSync();

// Schedule periodic sync
setInterval(runSync, SYNC_INTERVAL);