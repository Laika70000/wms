import React from 'react';
import { Store, ShoppingBag, Trash2, RefreshCw } from 'lucide-react';
import { Source } from '../../types/sources';

interface SourceListProps {
  sources: Source[];
  onDelete: (sourceId: string) => void;
  onSync: (sourceId: string) => void;
}

const SourceList: React.FC<SourceListProps> = ({ sources, onDelete, onSync }) => {
  if (sources.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <Store className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">Aucune source connectée</h3>
        <p className="text-gray-600">
          Connectez vos boutiques Shopify ou Amazon pour synchroniser automatiquement vos commandes.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Plateforme
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Nom
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Dernière synchro
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sources.map((source) => (
            <tr key={source.id}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {source.platform === 'shopify' ? (
                    <Store className="w-5 h-5 text-[#96BF47]" />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-[#FF9900]" />
                  )}
                  <span className="capitalize">{source.platform}</span>
                </div>
              </td>
              <td className="px-6 py-4">{source.name}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  source.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : source.status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {source.status === 'active' ? 'Actif' :
                   source.status === 'error' ? 'Erreur' : 'En attente'}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500">
                {source.lastSync ? new Date(source.lastSync).toLocaleString() : 'Jamais'}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSync(source.id)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Synchroniser"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(source.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SourceList;