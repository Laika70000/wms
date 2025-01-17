import React from 'react';
import { Order } from '../../types/orders';
import { getStatusColor } from '../../utils/orderUtils';
import { Eye, Edit, Truck } from 'lucide-react';

interface OrderTableProps {
  orders: Order[];
  onViewDetails: (orderId: string) => void;
  onEditOrder: (orderId: string) => void;
  onTrackOrder: (orderId: string) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onViewDetails,
  onEditOrder,
  onTrackOrder
}) => {
  if (orders.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Aucune commande trouvée</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Commande
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Transporteur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-medium">{order.orderNumber}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {order.customerName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(order.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap capitalize">
                {order.carrier}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ${order.total.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewDetails(order.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditOrder(order.id)}
                    className="text-gray-600 hover:text-gray-900"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => onTrackOrder(order.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Suivre la livraison"
                    >
                      <Truck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;