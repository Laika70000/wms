import React, { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { useShipments } from '../../hooks/useShipments';
import ShipmentTable from '../../components/tms/ShipmentTable';
import CreateShipmentModal from '../../components/tms/CreateShipmentModal';
import ShippingLabelModal from '../../components/tms/ShippingLabelModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const ShipmentList = () => {
  const { shipments, loading, error, refresh } = useShipments();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);

  if (loading) {
    return <LoadingSpinner message="Chargement des expéditions..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Erreur lors du chargement des expéditions"
        details={error}
        onRetry={refresh}
      />
    );
  }

  const handleGenerateLabel = (shipmentId: string) => {
    setSelectedShipmentId(shipmentId);
    setIsLabelModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Expéditions</h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nouvelle expédition
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <ShipmentTable 
          shipments={shipments}
          onGenerateLabel={handleGenerateLabel}
        />
      </div>

      <CreateShipmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          // Implémenter la création d'expédition
          console.log('Create shipment:', data);
          setIsCreateModalOpen(false);
        }}
      />

      {selectedShipmentId && (
        <ShippingLabelModal
          isOpen={isLabelModalOpen}
          onClose={() => {
            setIsLabelModalOpen(false);
            setSelectedShipmentId(null);
          }}
          shipmentId={selectedShipmentId}
        />
      )}
    </div>
  );
};

export default ShipmentList;