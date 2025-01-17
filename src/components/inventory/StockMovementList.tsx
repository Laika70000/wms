import React from 'react';
import { StockMovement } from '../../types/inventory';
import { ArrowUpRight, ArrowDownRight, ArrowUpDown, Settings } from 'lucide-react';

interface StockMovementListProps {
  movements: StockMovement[];
}

const StockMovementList: React.FC<StockMovementListProps> = ({ movements }) => {
  const getMovementIcon = (type: StockMovement['type']) => {
    switch (type) {
      case 'reception':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'order':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      case 'transfer':
        return <ArrowUpDown className="w-4 h-4 text-blue-500" />;
      case 'adjustment':
        return <Settings className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {movements.map((movement) => (
        <div key={movement.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            {getMovementIcon(movement.type)}
            <div>
              <div className="font-medium capitalize">{movement.type}</div>
              <div className="text-sm text-gray-500">
                {new Date(movement.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {movement.quantity > 0 ? '+' : ''}{movement.quantity} unités
            </div>
            {movement.reference && (
              <div className="text-sm text-gray-500">Réf: {movement.reference}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockMovementList;