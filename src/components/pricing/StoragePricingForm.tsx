import React, { useState } from 'react';
import { X } from 'lucide-react';

interface StoragePricingFormProps {
  merchantId: string;
  onSubmit: (data: {
    name: string;
    daysFrom: number;
    daysTo: number;
    pricePerCubicMeter: number;
  }) => Promise<void>;
  onClose: () => void;
}

const StoragePricingForm: React.FC<StoragePricingFormProps> = ({
  merchantId,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    daysFrom: 0,
    daysTo: 30,
    pricePerCubicMeter: 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error creating pricing tier:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Nouvelle grille tarifaire</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la grille
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jours (début)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.daysFrom}
                  onChange={(e) => setFormData({ ...formData, daysFrom: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jours (fin)
                </label>
                <input
                  type="number"
                  min={formData.daysFrom}
                  value={formData.daysTo}
                  onChange={(e) => setFormData({ ...formData, daysTo: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix par m³/jour
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricePerCubicMeter}
                  onChange={(e) => setFormData({ ...formData, pricePerCubicMeter: parseFloat(e.target.value) })}
                  className="w-full p-2 pl-8 border rounded-lg"
                  required
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer la grille'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoragePricingForm;