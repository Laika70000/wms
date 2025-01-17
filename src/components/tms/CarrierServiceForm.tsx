import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../services/supabaseClient';

interface CarrierServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  carrierId: string;
}

const CarrierServiceForm: React.FC<CarrierServiceFormProps> = ({
  isOpen,
  onClose,
  carrierId
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'standard' as const,
    transit_time_min: '',
    transit_time_max: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validate form data
      if (!formData.name || !formData.code) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Create service
      const { error } = await supabase
        .from('carrier_services')
        .insert([{
          carrier_id: carrierId,
          name: formData.name,
          code: formData.code.toUpperCase(),
          type: formData.type,
          transit_time_min: formData.transit_time_min ? parseInt(formData.transit_time_min) : null,
          transit_time_max: formData.transit_time_max ? parseInt(formData.transit_time_max) : null
        }]);

      if (error) {
        if (error.code === '23505') {
          toast.error('Un service avec ce code existe déjà');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Service créé avec succès');
      onClose();
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Erreur lors de la création du service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Nouveau service</h2>
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
                Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full p-2 border rounded-lg"
                required
                pattern="[A-Z0-9_-]+"
                title="Lettres majuscules, chiffres, tirets et underscores uniquement"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lettres majuscules, chiffres, tirets et underscores uniquement
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'express' | 'standard' | 'economy' })}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="express">Express</option>
                <option value="standard">Standard</option>
                <option value="economy">Economy</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Délai min (jours)
                </label>
                <input
                  type="number"
                  value={formData.transit_time_min}
                  onChange={(e) => setFormData({ ...formData, transit_time_min: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Délai max (jours)
                </label>
                <input
                  type="number"
                  value={formData.transit_time_max}
                  onChange={(e) => setFormData({ ...formData, transit_time_max: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  min="0"
                />
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
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarrierServiceForm;