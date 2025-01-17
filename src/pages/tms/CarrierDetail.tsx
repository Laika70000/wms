import React from 'react';
import { useParams } from 'react-router-dom';
import { Truck, Package, MapPin, Settings } from 'lucide-react';
import { useCarrier } from '../../hooks/useCarrier';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const CarrierDetail = () => {
  const { id } = useParams();
  const { carrier, loading, error } = useCarrier(id!);

  if (loading) {
    return <LoadingSpinner message="Chargement du transporteur..." />;
  }

  if (error || !carrier) {
    return (
      <ErrorMessage 
        message="Erreur lors du chargement du transporteur"
        details={error}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{carrier.name}</h1>
        <p className="text-gray-600">Code: {carrier.code}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Informations</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-400" />
                <span>Type</span>
              </div>
              <span className="font-medium capitalize">{carrier.type}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" />
                <span>Statut</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                carrier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {carrier.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" />
                <span>Services</span>
              </div>
              <span className="font-medium">0 services</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>Zones</span>
              </div>
              <span className="font-medium">0 zones</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Performance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Expéditions totales</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Livraisons à temps</span>
              <span className="font-medium">0%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Délai moyen</span>
              <span className="font-medium">- jours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Incidents</span>
              <span className="font-medium">0%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Services disponibles</h2>
          <div className="text-gray-500">
            Aucun service configuré pour ce transporteur
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarrierDetail;