import React from 'react';
import { useParams } from 'react-router-dom';
import BatchPickingList from '../../components/picking/BatchPickingList';
import BatchPickingMap from '../../components/picking/BatchPickingMap';

const BatchDetail = () => {
  const { batchId } = useParams();
  // Note: À remplacer par un vrai appel API
  const batch = {
    id: batchId,
    orders: ['1', '2'],
    items: [
      {
        productId: '1',
        productName: 'Laptop Stand',
        location: 'A1-B2',
        totalQuantity: 2,
        orderQuantities: [
          { orderId: '1', quantity: 1 },
          { orderId: '2', quantity: 1 }
        ],
        picked: 0
      }
    ],
    status: 'pending'
  };

  const route = {
    optimizedPath: ['A1-B2', 'A2-C1'],
    estimatedDistance: 5
  };

  const handleItemPicked = (productId: string) => {
    console.log('Item picked:', productId);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Lot de picking #{batchId}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BatchPickingList batch={batch} onItemPicked={handleItemPicked} />
        <BatchPickingMap route={route} />
      </div>
    </div>
  );
};

export default BatchDetail;