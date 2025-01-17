import React from 'react';
import { Link, Unlink, Store, AlertTriangle } from 'lucide-react';
import { Merchant } from '../../types/merchants';

interface MerchantTableProps {
  merchants: Merchant[];
  onLink: (merchantId: string) => void;
  onUnlink: (merchantId: string) => void;
  onUpdateStatus: (merchantId: string, status: 'active' | 'inactive' | 'suspended') => void;
}

const MerchantTable: React.FC<MerchantTableProps> = ({
  merchants,
  onLink,
  onUnlink,
  onUpdateStatus
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Marchand
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Sources
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {merchants.map((merchant) => (
            <tr key={merchant.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium">{merchant.name}</div>
                  <div className="text-sm text-gray-500">{merchant.email}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-400" />
                  <span>{merchant.sources.length} sources</span>
                  {merchant.sources.some(s => s.status === 'error') && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <select
                  value={merchant.status}
                  onChange={(e) => onUpdateStatus(merchant.id, e.target.value as any)}
                  className="border rounded-lg text-sm p-1"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </td>
              <td className="px-6 py-4">
                {merchant.isLinked ? (
                  <button
                    onClick={() => onUnlink(merchant.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800"
                  >
                    <Unlink className="w-4 h-4" />
                    Délier
                  </button>
                ) : (
                  <button
                    onClick={() => onLink(merchant.id)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <Link className="w-4 h-4" />
                    Lier
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MerchantTable;