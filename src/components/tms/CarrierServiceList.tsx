import React from 'react';
import { Clock, Edit2, Trash2 } from 'lucide-react';

interface CarrierService {
  id: string;
  name: string;
  code: string;
  type: 'express' | 'standard' | 'economy';
  transit_time_min?: number;
  transit_time_max?: number;
}

interface CarrierServiceListProps {
  services: CarrierService[];
  onEdit?: (service: CarrierService) => void;
  onDelete?: (serviceId: string) => void;
}

const CarrierServiceList: React.FC<CarrierServiceListProps> = ({
  services,
  onEdit,
  onDelete
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Service
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Délai
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {services.map((service) => (
            <tr key={service.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {service.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {service.code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap capitalize">
                {service.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>
                    {service.transit_time_min && service.transit_time_max
                      ? `${service.transit_time_min}-${service.transit_time_max} jours`
                      : '-'
                    }
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(service)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(service.id)}
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

export default CarrierServiceList;