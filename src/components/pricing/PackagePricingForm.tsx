import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PackagePricingFormProps {
  merchantId: string;
  carrierId: string;
  onSubmit: (data: {
    zone: string;
    weightFrom: number;
    weightTo: number;
    basePrice: number;
    pricePerKg: number;
    fuelSurchargePercent: number;
    handlingFee: number;
    insurancePercent: number;
    minInsuranceValue: number;
  }) => Promise<void>;
  onClose: () => void;
}

const PackagePricingForm: React.FC<PackagePricingFormProps> = ({
  merchantId,
  carrierId,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    zone: '',
    weightFrom: 0,
    weightTo: 0,
    basePrice: 0,
    pricePerKg: 0,
    fuelSurchargePercent: 0,
    handlingFee: 0,
    insurancePercent: 0,
    minInsuranceValue: 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error creating pricing rule:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Nouvelle règle tarifaire</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone de livraison
              </label>
              <input
                type="text"
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poids min (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.weightFrom}
                  onChange={(e) => setFormData({ ...formData, weightFrom: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poids max (kg)
                </label>
                <input
                  type="number"
                  min={formData.weightFrom}
                  step="0.01"
                  value={formData.weightTo}
                  onChange={(e) => setFormData({ ...formData, weightTo: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix de base
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                    className="w-full p-2 pl-8 border rounded-lg"
                    required
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix par kg
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: parseFloat(e.target.value) })}
                    className="w-full p-2 pl-8 border rounded-lg"
                    required
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surcharge carburant (%)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.fuelSurchargePercent}
                  onChange={(e) => setFormData({ ...formData, fuelSurchargePercent: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frais de manutention
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.handlingFee}
                    onChange={(e) => setFormData({ ...formData, handlingFee: parseFloat(e.target.value) })}
                    className="w-full p-2 pl-8 border rounded-lg"
                    required
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assurance (%)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.insurancePercent}
                  onChange={(e) => setFormData({ ...formData, insurancePercent: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur min. assurance
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minInsuranceValue}
                    onChange={(e) => setFormData({ ...formData, minInsuranceValue: parseFloat(e.target.value) })}
                    className="w-full p-2 pl-8 border rounded-lg"
                    required
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
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
              {loading ? 'Création...' : 'Créer la règle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackagePricingForm;