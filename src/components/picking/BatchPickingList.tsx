import React from 'react';
import { PickingBatch } from '../../types/picking';
import { MapPin, CheckCircle, Package } from 'lucide-react';

interface BatchPickingListProps {
  batch: PickingBatch;
  onItemPicked: (productId: string) => void;
}

const BatchPickingList: React.FC<BatchPickingListProps> = ({ batch, onItemPicked }) => {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Liste de Picking - Lot #{batch.id}</h3>
        <p className="text-sm text-gray-600">
          {batch.orders.length} commandes • {batch.items.length} articles différents
        </p>
      </div>

      <div className="divide-y">
        {batch.items.map((item) => (
          <div
            key={item.productId}
            className={`p-4 ${item.picked === item.totalQuantity ? 'bg-green-50' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{item.productName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">{item.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  À prélever: {item.totalQuantity} unités
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  {item.orderQuantities.map((oq, index) => (
                    <span key={oq.orderId}>
                      Commande #{oq.orderId}: {oq.quantity}
                      {index < item.orderQuantities.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onItemPicked(item.productId)}
                disabled={item.picked === item.totalQuantity}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${
                  item.picked === item.totalQuantity
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                {item.picked === item.totalQuantity ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Complété
                  </>
                ) : (
                  'Marquer comme prélevé'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatchPickingList;