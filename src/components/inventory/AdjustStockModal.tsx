import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLocations } from '../../modules/inventory/hooks/useLocations';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    quantity: number;
    type: 'reception' | 'adjustment';
    locationId: string;
    notes?: string;
  }) => Promise<void>;
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { locations, loading: locationsLoading } = useLocations();
  const [formData, setFormData] = useState({
    quantity: 0,
    type: 'adjustment' as const,
    locationId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        quantity: 0,
        type: 'adjustment',
        locationId: '',
        notes: ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate inputs
      if (!formData.locationId) {
        toast.error('Please select a location');
        return;
      }

      if (formData.quantity === 0) {
        toast.error('Quantity cannot be zero');
        return;
      }

      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error is already handled by the service
      console.error('Error in stock adjustment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (locationsLoading) {
    return <LoadingSpinner message="Loading locations..." />;
  }

  if (!locations?.length) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">No Locations Available</h2>
          <p className="text-gray-600 mb-4">
            Please create at least one storage location before adjusting stock.
          </p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Adjust Stock</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'reception' | 'adjustment' })}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="adjustment">Manual Adjustment</option>
                <option value="reception">Stock Reception</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <select
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.aisle}-{location.section}-{location.shelf} 
                    ({(location.capacity - location.occupied).toFixed(2)} m³ available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
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
              disabled={loading || !formData.locationId || formData.quantity === 0}
            >
              {loading ? 'Adjusting...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStockModal;