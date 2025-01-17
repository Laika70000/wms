import React from 'react';
import { useParams } from 'react-router-dom';
import { Package, Truck, MapPin, Calendar } from 'lucide-react';
import { useShipment } from '../../hooks/useShipment';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const ShipmentDetail = () => {
  const { id } = useParams();
  const { shipment, loading, error } = useShipment(id!);

  if (loading) {
    return <LoadingSpinner message="Chargement de l'expédition..." />;
  }

  if (error || !shipment) {
    return (
      <ErrorMessage 
        message="Erreur lors du chargement de l'expédition"
        details={error}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Expédition #{shipment.trackingNumber}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Informations</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" />
                <span>Commande</span>
              </div>
              <span className="font-medium">{shipment.orderId}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-400" />
                <span>Transporteur</span>
              </div>
              <span className="font-medium">{shipment.carrierId}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>Livraison estimée</span>
              </div>
              <span className="font-medium">
                {shipment.estimatedDelivery ? 
                  new Date(shipment.estimatedDelivery).toLocaleDateString() : 
                  '-'
                }
              </span>
            </div>

            {shipment.weight && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <span>Poids</span>
                </div>
                <span className="font-medium">{shipment.weight} kg</span>
              </div>
            )}

            {shipment.shippingCost && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <span>Coût</span>
                </div>
                <span className="font-medium">{shipment.shippingCost} €</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Suivi</h2>
          <div className="space-y-6">
            {/* Timeline de suivi à implémenter */}
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium">En attente de suivi</div>
                <div className="text-sm text-gray-500">
                  Les informations de suivi seront disponibles prochainement
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetail;