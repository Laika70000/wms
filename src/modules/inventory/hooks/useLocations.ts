import { useState, useEffect } from 'react';
import { Location } from '../types/Location';
import * as locationApi from '../api/locationApi';
import { showError, showSuccess } from '../../../utils/errorHandler';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await locationApi.getLocations();
      setLocations(data);
    } catch (err) {
      console.error('Error loading locations:', err);
      setError('Erreur lors du chargement des emplacements');
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const addLocation = async (location: Partial<Location>) => {
    try {
      const newLocation = await locationApi.addLocation(location);
      setLocations([...locations, newLocation]);
      showSuccess('Emplacement créé avec succès');
    } catch (err) {
      showError(err);
      throw err;
    }
  };

  const updateLocation = async (id: string, location: Partial<Location>) => {
    try {
      const updatedLocation = await locationApi.updateLocation(id, location);
      setLocations(locations.map(loc => 
        loc.id === id ? updatedLocation : loc
      ));
      showSuccess('Emplacement mis à jour avec succès');
    } catch (err) {
      showError(err);
      throw err;
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      await locationApi.deleteLocation(id);
      setLocations(locations.filter(loc => loc.id !== id));
      showSuccess('Emplacement supprimé avec succès');
    } catch (err) {
      showError(err);
      throw err;
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  return {
    locations,
    loading,
    error,
    addLocation,
    updateLocation,
    deleteLocation,
    refresh: loadLocations
  };
};