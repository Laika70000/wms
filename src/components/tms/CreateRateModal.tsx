import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    carrierId: string;
    serviceId: string;
    zoneId: string;
    weightFrom: number;
    weightTo: number;
    price: number;
    fuelSurchargePercent: number;
  }) => Promise<void>;
}

const CreateRateModal: React.FC<CreateRateModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    carrierId: '',
    serviceId: '',
    zoneId: '',
    weightFrom: '',
    weightTo: '',
    price: '',
    fuelSurchargePercent: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit({
        carrierId: formData.carrierId,
        serviceId: formData.serviceId,
        zoneId: formData.zoneId,
        weightFrom: parseFloat(formData.weightFrom),
        weightTo: parseFloat(formData.weightTo),
        price: parseFloat(formData.price),
        fuelSurchargePercent: parseFloat(formData.fuelSurchargePercent)
      });
      onClose();
    } catch (error) {
      console.error('Error creating rate:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Nouveau tarif</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transporteur *
              </label>
              <select
                value={formData.carrierId}
                onChange={(e) => setFormData({ ...formData, carrierId: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Sélectionner un transporteur</option>
                {/* Options des transporteurs */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service *
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Sélectionner un service</option>
                {/* Options des services */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone *
              </label>
              <select
                value={formData.zoneId}
                onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Sélectionner une zone</option>
                {/* Options des zones */}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poids min (kg) *
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.weightFrom}
                  onChange={(e) => setFormData({ ...formData, weightFrom: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poids max (kg) *
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.weightTo}
                  onChange={(e) => setFormData({ ...formData, weightTo: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-2 pl-8 border rounded-lg"
                  required
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surcharge carburant (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.fuelSurchargePercent}
                onChange={(e) => setFormData({ ...formData, fuelSurchargePercent: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
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
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRateModal;