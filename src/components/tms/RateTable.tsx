import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { CarrierRate } from '../../types/tms';

interface RateTableProps {
  rates: CarrierRate[];
  onEdit?: (rate: CarrierRate) => void;
  onDelete?: (rateId: string) => void;
}

const RateTable: React.FC<RateTableProps> = ({ rates, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Transporteur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Service
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Zone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Poids (kg)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Prix
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Surcharge
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rates.map((rate) => (
            <tr key={rate.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {rate.carrierId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {rate.serviceId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {rate.zoneId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {rate.weightFrom} - {rate.weightTo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {rate.price} €
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {rate.fuelSurchargePercent}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(rate)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(rate.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
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

export default RateTable;