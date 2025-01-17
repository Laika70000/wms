import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Order, OrderItem } from '../../types/orders';

interface RefundOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onRefund: (items: { itemId: string; quantity: number }[], reason: string) => Promise<void>;
}

const RefundOrderModal: React.FC<RefundOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onRefund
}) => {
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const refundItems = Object.entries(selectedItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => ({ itemId, quantity }));

    if (refundItems.length === 0) return;

    try {
      setLoading(true);
      await onRefund(refundItems, reason);
      onClose();
    } catch (error) {
      console.error('Error processing refund:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Process Refund</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Select Items to Refund</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      ${item.price} × {item.quantity}
                    </p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={item.quantity}
                    value={selectedItems[item.id] || 0}
                    onChange={(e) => setSelectedItems({
                      ...selectedItems,
                      [item.id]: parseInt(e.target.value) || 0
                    })}
                    className="w-20 p-1 border rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Refund
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading || Object.values(selectedItems).every(v => v === 0)}
            >
              {loading ? 'Processing...' : 'Process Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundOrderModal;