import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    priority: number;
    carrierId: string;
    serviceId: string;
    conditions: {
      minWeight?: number;
      maxWeight?: number;
      minValue?: number;
      maxValue?: number;
      countries?: string[];
    };
  }) => Promise<void>;
}

const CreateRuleModal: React.FC<CreateRuleModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    priority: '1',
    carrierId: '',
    serviceId: '',
    minWeight: '',
    maxWeight: '',
    minValue: '',
    maxValue: '',
    countries: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit({
        name: formData.name,
        priority: parseInt(formData.priority),
        carrierId: formData.carrierId,
        serviceId: formData.serviceId,
        conditions: {
          ...(formData.minWeight && { minWeight: parseFloat(formData.minWeight) }),
          ...(formData.maxWeight && { maxWeight: parseFloat(formData.maxWeight) }),
          ...(formData.minValue && { minValue: parseFloat(formData.minValue) }),
          ...(formData.maxValue && { maxValue: parseFloat(formData.maxValue) }),
          ...(formData.countries && { countries: formData.countries.split(',').map(c => c.trim()) })
        }
      });
      onClose();
    } catch (error) {
      console.error('Error creating rule:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Nouvelle règle</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorité *
              </label>
              <input
                type="number"
                min="1"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poids min (kg)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.minWeight}
                  onChange={(e) => setFormData({ ...formData, minWeight: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poids max (kg)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.maxWeight}
                  onChange={(e) => setFormData({ ...formData, maxWeight: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur min (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minValue}
                  onChange={(e) => setFormData({ ...formData, minValue: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur max (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.maxValue}
                  onChange={(e) => setFormData({ ...formData, maxValue: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pays (séparés par des virgules)
              </label>
              <input
                type="text"
                value={formData.countries}
                onChange={(e) => setFormData({ ...formData, countries: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="FR, BE, CH"
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

export default CreateRuleModal;