import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { Carrier } from '../../types/tms';

interface CarrierTableProps {
  carriers: Carrier[];
}

const CarrierTable: React.FC<CarrierTableProps> = ({ carriers }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Transporteur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {carriers.map((carrier) => (
            <tr key={carrier.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="font-medium">{carrier.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {carrier.code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap capitalize">
                {carrier.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {carrier.status === 'active' ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span className={carrier.status === 'active' ? 'text-green-800' : 'text-red-800'}>
                    {carrier.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  to={`/tms/carriers/${carrier.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CarrierTable;