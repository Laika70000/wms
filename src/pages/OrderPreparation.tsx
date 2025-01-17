import React, { useState, useMemo } from 'react';
import { ClipboardList, TruckIcon, Store, BarChart2, ArrowUpDown, Play } from 'lucide-react';
import { Order } from '../types/orders';

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerName: 'John Smith',
    date: '2024-03-15',
    status: 'processing',
    source: 'website',
    carrier: 'ups',
    priority: 'high',
    items: [
      { id: '1', productId: 'p1', productName: 'Laptop Stand', quantity: 1, location: 'A1-B2', price: 299.99 }
    ],
    total: 299.99
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerName: 'Alice Johnson',
    date: '2024-03-14',
    status: 'processing',
    source: 'marketplace',
    carrier: 'fedex',
    priority: 'normal',
    items: [
      { id: '2', productId: 'p2', productName: 'Wireless Mouse', quantity: 3, location: 'A2-C1', price: 49.99 }
    ],
    total: 149.97
  }
];

const OrderPreparation = () => {
  const [orders] = useState<Order[]>(mockOrders);
  const [groupBy, setGroupBy] = useState<'source' | 'carrier' | 'location' | 'priority'>('source');
  const [sortBy, setSortBy] = useState<'items' | 'date' | 'priority'>('priority');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const groupedOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => {
      switch (sortBy) {
        case 'items':
          return b.items.length - a.items.length;
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'priority':
          const priorityWeight = { high: 3, normal: 2, low: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        default:
          return 0;
      }
    });

    const groups: Record<string, { key: string; orders: Order[]; totalItems: number }> = {};
    
    sorted.forEach(order => {
      let key = '';
      switch (groupBy) {
        case 'source':
          key = order.source;
          break;
        case 'carrier':
          key = order.carrier;
          break;
        case 'location':
          key = order.items[0]?.location.split('-')[0] || 'unknown';
          break;
        case 'priority':
          key = order.priority;
          break;
      }

      if (!groups[key]) {
        groups[key] = {
          key,
          orders: [],
          totalItems: 0
        };
      }
      groups[key].orders.push(order);
      groups[key].totalItems += order.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    return Object.values(groups);
  }, [orders, groupBy, sortBy]);

  const handleStartPreparation = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handlePrepareSelected = () => {
    if (selectedOrders.length === 0) {
      alert('Veuillez sélectionner au moins une commande à préparer');
      return;
    }
    
    alert(`Début de la préparation pour ${selectedOrders.length} commande(s)`);
    // Ici vous pourriez rediriger vers une page de préparation détaillée
    // ou ouvrir un modal avec les étapes de préparation
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Préparation des Commandes</h1>
        </div>

        {selectedOrders.length > 0 && (
          <button
            onClick={handlePrepareSelected}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Play className="w-4 h-4" />
            Préparer ({selectedOrders.length})
          </button>
        )}

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-gray-400" />
            <select
              className="border-gray-300 rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="priority">Trier par Priorité</option>
              <option value="items">Trier par Nombre d'Articles</option>
              <option value="date">Trier par Date</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-gray-400" />
            <select
              className="border-gray-300 rounded-md"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
            >
              <option value="source">Grouper par Source</option>
              <option value="carrier">Grouper par Transporteur</option>
              <option value="location">Grouper par Emplacement</option>
              <option value="priority">Grouper par Priorité</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedOrders.map((group) => (
          <div key={group.key} className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {groupBy === 'source' && <Store className="w-5 h-5" />}
                {groupBy === 'carrier' && <TruckIcon className="w-5 h-5" />}
                <h3 className="font-semibold capitalize">{group.key}</h3>
              </div>
              <div className="text-sm text-gray-500">
                {group.orders.length} commandes ({group.totalItems} articles)
              </div>
            </div>

            <div className="divide-y">
              {group.orders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium">{order.orderNumber}</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        order.priority === 'high' ? 'bg-red-100 text-red-800' :
                        order.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.priority}
                      </span>
                    </div>
                    <button
                      onClick={() => handleStartPreparation(order.id)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        selectedOrders.includes(order.id)
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {selectedOrders.includes(order.id) ? 'Sélectionné' : 'Sélectionner'}
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>{order.items.length} articles • {order.carrier.toUpperCase()}</div>
                    <div className="mt-1">
                      {order.items.map((item, index) => (
                        <div key={item.id} className="text-xs text-gray-500">
                          {item.quantity}x {item.productName} ({item.location})
                          {index < order.items.length - 1 && ', '}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderPreparation;