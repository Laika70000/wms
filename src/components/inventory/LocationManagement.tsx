import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { Location } from '../../types/inventory';

interface LocationManagementProps {
  locations: Location[];
  onAddLocation: (location: Partial<Location>) => Promise<void>;
  onEditLocation: (id: string, location: Partial<Location>) => Promise<void>;
  onDeleteLocation: (id: string) => Promise<void>;
}

const LocationManagement: React.FC<LocationManagementProps> = ({
  locations,
  onAddLocation,
  onEditLocation,
  onDeleteLocation
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    aisle: '',
    section: '',
    shelf: '',
    capacity: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await onEditLocation(editingId, {
          ...formData,
          capacity: parseFloat(formData.capacity)
        });
        setEditingId(null);
      } else {
        await onAddLocation({
          ...formData,
          capacity: parseFloat(formData.capacity)
        });
        setIsAdding(false);
      }
      setFormData({ aisle: '', section: '', shelf: '', capacity: '' });
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  const startEdit = (location: Location) => {
    setEditingId(location.id);
    setFormData({
      aisle: location.aisle,
      section: location.section,
      shelf: location.shelf,
      capacity: location.capacity.toString()
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Emplacements</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-4 h-4" />
            Ajouter un emplacement
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allée *
              </label>
              <input
                type="text"
                value={formData.aisle}
                onChange={(e) => setFormData({ ...formData, aisle: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section *
              </label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Étagère *
              </label>
              <input
                type="text"
                value={formData.shelf}
                onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacité *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                setFormData({ aisle: '', section: '', shelf: '', capacity: '' });
              }}
              className="px-3 py-1 border rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingId ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => (
          <div
            key={location.id}
            className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium">
                  {location.aisle}-{location.section}-{location.shelf}
                </div>
                <div className="text-sm text-gray-500">
                  Capacité: {location.capacity} • Occupé: {location.occupied}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(location)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteLocation(location.id)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationManagement;