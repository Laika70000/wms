import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Package, Truck, AlertTriangle, CheckCircle, Tag } from 'lucide-react';
import { Shipment } from '../../types/tms';

interface ShipmentTableProps {
  shipments: Shipment[];
  onGenerateLabel: (shipmentId: string) => void;
}

const ShipmentTable: React.FC<ShipmentTableProps> = ({ 
  shipments,
  onGenerateLabel
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'exception':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'in_transit':
        return <Truck className="w-4 h-4 text-blue-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'exception':
        return 'bg-red-100 text-red-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'label_created':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Commande
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Transporteur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tracking
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Livraison estimée
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {shipments.map((shipment) => (
            <tr key={shipment.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="font-medium">{shipment.orderId}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {shipment.carrierId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {shipment.trackingNumber || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {getStatusIcon(shipment.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {shipment.estimatedDelivery ? 
                  new Date(shipment.estimatedDelivery).toLocaleDateString() : 
                  '-'
                }
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/tms/shipments/${shipment.id}`}
                    className="text-blue-600 hover:text-blue-900"
                    title="Voir les détails"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  {!shipment.labelUrl && (
                    <button
                      onClick={() => onGenerateLabel(shipment.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Générer l'étiquette"
                    >
                      <Tag className="w-4 h-4" />
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

export default ShipmentTable;