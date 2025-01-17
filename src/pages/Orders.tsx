import React, { useState } from 'react';
import { ShoppingCart, Plus, Upload } from 'lucide-react';
import { Order } from '../types/orders';
import OrderList from '../components/orders/OrderList';
import OrderFilters from '../components/orders/OrderFilters';
import CreateOrderModal from '../components/orders/CreateOrderModal';
import ImportOrdersModal from '../components/orders/ImportOrdersModal';

const Orders = () => {
  const [orders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleViewDetails = (orderId: string) => {
    // Implémenter la vue détaillée
    console.log('View details:', orderId);
  };

  const handleEditOrder = (orderId: string) => {
    // Implémenter l'édition
    console.log('Edit order:', orderId);
  };

  const handleTrackOrder = (orderId: string) => {
    // Implémenter le suivi
    console.log('Track order:', orderId);
  };

  const handleCreateOrder = (orderData: any) => {
    // Implémenter la création
    console.log('Create order:', orderData);
    setIsCreateModalOpen(false);
  };

  const handleImportComplete = () => {
    // Rafraîchir la liste des commandes
    console.log('Import completed');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesDate = !dateRange.start || !dateRange.end || (
      new Date(order.date) >= new Date(dateRange.start) &&
      new Date(order.date) <= new Date(dateRange.end)
    );
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Commandes</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            Importer
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Commande
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <OrderFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        
        <OrderList
          orders={filteredOrders}
          onViewDetails={handleViewDetails}
          onEditOrder={handleEditOrder}
          onTrackOrder={handleTrackOrder}
        />
      </div>

      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOrder}
      />

      <ImportOrdersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

export default Orders;