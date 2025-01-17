import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Order } from '../../types/orders';

interface MergeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  availableOrders: Order[];
  onMerge: (targetOrderId: string) => Promise<void>;
}

const MergeOrderModal: React.FC<MergeOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  availableOrders,
  onMerge
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    try {
      setLoading(true);
      await onMerge(selectedOrderId);
      onClose();
    } catch (error) {
      console.error('Error merging orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Merge Orders</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Order to Merge With
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Select an order...</option>
              {availableOrders.map((availableOrder) => (
                <option key={availableOrder.id} value={availableOrder.id}>
                  {availableOrder.orderNumber} - {availableOrder.customerName}
                </option>
              ))}
            </select>
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
              disabled={loading || !selectedOrderId}
            >
              {loading ? 'Merging...' : 'Merge Orders'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MergeOrderModal;