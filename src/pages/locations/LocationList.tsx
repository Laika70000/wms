import React from 'react';
import { Map } from 'lucide-react';
import { useLocations } from '../../modules/inventory/hooks/useLocations';
import LocationManagement from '../../components/locations/LocationManagement';
import LocationStatistics from '../../components/locations/LocationStatistics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const LocationList = () => {
  const {
    locations,
    loading,
    error,
    addLocation,
    updateLocation,
    deleteLocation,
    refresh
  } = useLocations();

  if (loading) {
    return <LoadingSpinner message="Chargement des emplacements..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Erreur lors du chargement des emplacements"
        details={error}
        onRetry={refresh}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Map className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Gestion des emplacements</h1>
        </div>
      </div>

      <div className="mb-6">
        <LocationStatistics locations={locations} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <LocationManagement
          locations={locations}
          onAddLocation={addLocation}
          onEditLocation={updateLocation}
          onDeleteLocation={deleteLocation}
        />
      </div>
    </div>
  );
};

export default LocationList;