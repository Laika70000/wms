import React from 'react';
import { PickingBatch } from '../../types/picking';
import { Package, Clock, CheckCircle, Play } from 'lucide-react';

interface BatchListProps {
  batches: PickingBatch[];
  onStartBatch: (batchId: string) => void;
}

const BatchList: React.FC<BatchListProps> = ({ batches, onStartBatch }) => {
  if (batches.length === 0) {
    return (
      <div className="p-8 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucun lot à préparer</h3>
        <p className="text-gray-600">
          Créez un nouveau lot pour commencer la préparation des commandes.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {batches.map((batch) => (
        <div key={batch.id} className="bg-white border rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Lot #{batch.id}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                batch.status === 'completed' 
                  ? 'bg-green-100 text-green-800'
                  : batch.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {batch.status === 'completed' && 'Terminé'}
                {batch.status === 'in_progress' && 'En cours'}
                {batch.status === 'pending' && 'À préparer'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {batch.orders.length} commandes • {batch.items.length} articles différents
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-3 mb-4">
              {batch.items.slice(0, 3).map((item) => (
                <div key={item.productId} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{item.productName}</span>
                  <span className="font-medium">
                    {item.picked}/{item.totalQuantity}
                  </span>
                </div>
              ))}
              {batch.items.length > 3 && (
                <div className="text-sm text-gray-500">
                  +{batch.items.length - 3} autres articles
                </div>
              )}
            </div>

            {batch.status === 'pending' && (
              <button
                onClick={() => onStartBatch(batch.id)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Play className="w-4 h-4" />
                Commencer
              </button>
            )}

            {batch.status === 'in_progress' && (
              <button
                onClick={() => onStartBatch(batch.id)}
                className="w-full flex items-center justify-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200"
              >
                <Clock className="w-4 h-4" />
                Continuer
              </button>
            )}

            {batch.status === 'completed' && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Terminé</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BatchList;