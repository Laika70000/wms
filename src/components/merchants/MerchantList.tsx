import React from 'react';
import { Store, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Merchant } from '../../types/merchants';

interface MerchantListProps {
  merchants: Merchant[];
}

const MerchantList: React.FC<MerchantListProps> = ({ merchants }) => {
  if (merchants.length === 0) {
    return (
      <div className="p-8 text-center">
        <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucun marchand trouvé</h3>
        <p className="text-gray-600">
          Aucun marchand ne correspond à vos critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Marchand
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Sources connectées
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Commandes
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Dernière activité
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
                  {merchant.sources.some(s => s.status === 'active') ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : merchant.sources.some(s => s.status === 'error') ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : null}
                  <span>
                    {merchant.sources.length} source{merchant.sources.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm">
                  <div>{merchant.totalOrders} commandes</div>
                  <div className="text-gray-500">
                    {merchant.pendingOrders} en attente
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {merchant.lastActivity ? (
                  new Date(merchant.lastActivity).toLocaleString()
                ) : (
                  'Aucune activité'
                )}
              </td>
              <td className="px-6 py-4">
                <Link
                  to={`/settings/merchants/${merchant.id}`}
                  className="text-blue-600 hover:text-blue-800"
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

export default MerchantList;