import React from 'react';
import { useParams } from 'react-router-dom';
import { Package, Truck, User, Calendar } from 'lucide-react';
import { getStatusColor } from '../../utils/orderUtils';

const OrderDetail = () => {
  const { id } = useParams();
  // Note: À remplacer par un vrai appel API
  const order = {
    id,
    orderNumber: 'ORD-2024-001',
    customerName: 'Jean Dupont',
    date: '2024-03-15',
    status: 'processing',
    items: [
      { id: '1', productName: 'Laptop Stand', quantity: 1, price: 299.99 }
    ],
    total: 299.99
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Commande #{order.orderNumber}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Détails de la commande</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>{new Date(order.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <span>{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-400" />
              <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Articles</h2>
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <span>{item.productName}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{item.quantity}x</div>
                  <div className="text-sm text-gray-500">{item.price}€</div>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{order.total}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;