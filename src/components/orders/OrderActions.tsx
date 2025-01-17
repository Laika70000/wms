import React from 'react';
import { Split, Merge, RefreshCw, RotateCcw } from 'lucide-react';
import { Order } from '../../types/orders';

interface OrderActionsProps {
  order: Order;
  onSplit: () => void;
  onMerge: () => void;
  onRefund: () => void;
  onReturn: () => void;
}

const OrderActions: React.FC<OrderActionsProps> = ({
  order,
  onSplit,
  onMerge,
  onRefund,
  onReturn
}) => {
  const canSplit = order.items.length > 1 && 
    ['pending', 'processing'].includes(order.status);
  
  const canMerge = order.parentOrderId || order.childOrders?.length;
  
  const canRefund = ['delivered', 'shipped'].includes(order.status) &&
    order.refundStatus !== 'full';
  
  const canReturn = order.status === 'delivered';

  return (
    <div className="flex gap-2">
      {canSplit && (
        <button
          onClick={onSplit}
          className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
          title="Split Order"
        >
          <Split className="w-4 h-4" />
          Split
        </button>
      )}

      {canMerge && (
        <button
          onClick={onMerge}
          className="flex items-center gap-1 px-2 py-1 text-sm text-purple-600 hover:text-purple-800"
          title="Merge Orders"
        >
          <Merge className="w-4 h-4" />
          Merge
        </button>
      )}

      {canRefund && (
        <button
          onClick={onRefund}
          className="flex items-center gap-1 px-2 py-1 text-sm text-orange-600 hover:text-orange-800"
          title="Process Refund"
        >
          <RefreshCw className="w-4 h-4" />
          Refund
        </button>
      )}

      {canReturn && (
        <button
          onClick={onReturn}
          className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:text-red-800"
          title="Process Return"
        >
          <RotateCcw className="w-4 h-4" />
          Return
        </button>
      )}
    </div>
  );
};

export default OrderActions;