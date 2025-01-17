import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Order } from '../../types/orders';

interface ReturnOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onReturn: (items: { itemId: string; quantity: number; reason: string }[]) => Promise<void>;
}

const ReturnOrderModal: React.FC<ReturnOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onReturn
}) => {
  const [selectedItems, setSelectedItems] = useState<Record<string, { quantity: number; reason: string }>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const returnItems = Object.entries(selectedItems)
      .filter(([_, data]) => data.quantity > 0)
      .map(([itemId, data]) => ({
        itemId,
        quantity: data.quantity,
        reason: data.reason
      }));

    if (returnItems.length === 0) return;

    try {
      setLoading(true);
      await onReturn(returnItems);
      onClose();
    } catch (error) {
      console.error('Error processing return:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Process Return</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
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
                    value={selectedItems[item.id]?.quantity || 0}
                    onChange={(e) => setSelectedItems({
                      ...selectedItems,
                      [item.id]: {
                        quantity: parseInt(e.target.value) || 0,
                        reason: selectedItems[item.id]?.reason || ''
                      }
                    })}
                    className="w-20 p-1 border rounded"
                  />
                </div>
                {(selectedItems[item.id]?.quantity || 0) > 0 && (
                  <select
                    value={selectedItems[item.id]?.reason || ''}
                    onChange={(e) => setSelectedItems({
                      ...selectedItems,
                      [item.id]: {
                        ...selectedItems[item.id],
                        reason: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded-lg mt-2"
                    required
                  >
                    <option value="">Select return reason...</option>
                    <option value="defective">Defective Product</option>
                    <option value="wrong_item">Wrong Item Received</option>
                    <option value="not_as_described">Not as Described</option>
                    <option value="no_longer_needed">No Longer Needed</option>
                  </select>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-4">
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
              disabled={loading || Object.values(selectedItems).every(v => v.quantity === 0)}
            >
              {loading ? 'Processing...' : 'Process Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnOrderModal;