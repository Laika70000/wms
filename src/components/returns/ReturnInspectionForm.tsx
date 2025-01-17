import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface ReturnInspectionFormProps {
  returnItemId: string;
  onSubmit: (data: {
    condition: string;
    action: string;
    notes: string;
    photos: string[];
  }) => Promise<void>;
  onClose: () => void;
}

const ReturnInspectionForm: React.FC<ReturnInspectionFormProps> = ({
  returnItemId,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    condition: 'new',
    action: 'restock',
    notes: '',
    photos: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error during inspection:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Inspection du retour</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                État
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="new">Neuf</option>
                <option value="like_new">Comme neuf</option>
                <option value="damaged">Endommagé</option>
                <option value="unsellable">Invendable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="restock">Remettre en stock</option>
                <option value="refurbish">Reconditionnement</option>
                <option value="dispose">Mise au rebut</option>
              </select>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photos
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Ajouter des photos</span>
                      <input type="file" className="sr-only" multiple accept="image/*" />
                    </label>
                  </div>
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
              {loading ? 'Enregistrement...' : 'Valider l\'inspection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnInspectionForm;