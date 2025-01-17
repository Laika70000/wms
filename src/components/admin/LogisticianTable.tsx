import React from 'react';
import { Users } from 'lucide-react';
import { Logistician } from '../../modules/admin/types/Logistician';

interface LogisticianTableProps {
  logisticians: Logistician[];
  onUpdateStatus: (id: string, status: 'active' | 'inactive') => void;
}

const LogisticianTable: React.FC<LogisticianTableProps> = ({
  logisticians,
  onUpdateStatus
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Logisticien
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Marchands gérés
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Dernière connexion
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {logisticians.map((logistician) => (
            <tr key={logistician.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium">{logistician.name}</div>
                  <div className="text-sm text-gray-500">{logistician.email}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{logistician.merchantCount} marchands</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <select
                  value={logistician.status}
                  onChange={(e) => onUpdateStatus(logistician.id, e.target.value as 'active' | 'inactive')}
                  className="border rounded-lg text-sm p-1"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {logistician.lastLogin ? new Date(logistician.lastLogin).toLocaleString() : 'Jamais'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogisticianTable;