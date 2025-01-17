import React from 'react';
import { MapPin, Edit2, Trash2 } from 'lucide-react';

interface CarrierZone {
  id: string;
  name: string;
  code: string;
  countries: string[];
}

interface CarrierZoneListProps {
  zones: CarrierZone[];
  onEdit?: (zone: CarrierZone) => void;
  onDelete?: (zoneId: string) => void;
}

const CarrierZoneList: React.FC<CarrierZoneListProps> = ({
  zones,
  onEdit,
  onDelete
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Zone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Pays
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {zones.map((zone) => (
            <tr key={zone.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {zone.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {zone.code}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {zone.countries.join(', ')}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(zone)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(zone.id)}
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

export default CarrierZoneList;