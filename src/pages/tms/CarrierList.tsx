import React, { useState } from 'react';
import { Truck, Plus } from 'lucide-react';
import { useCarriers } from '../../hooks/useCarriers';
import CarrierGrid from '../../components/tms/carriers/CarrierGrid';
import CarrierFilters from '../../components/tms/carriers/CarrierFilters';
import CreateCarrierModal from '../../components/tms/CreateCarrierModal';
import CarrierServiceForm from '../../components/tms/CarrierServiceForm';
import CarrierZoneForm from '../../components/tms/CarrierZoneForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useConfirmation } from '../../hooks/useConfirmation';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

const CarrierList = () => {
  const { carriers, loading, error, refresh, createCarrier } = useCarriers();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { confirmation, confirm, closeConfirmation } = useConfirmation();

  if (loading) {
    return <LoadingSpinner message="Chargement des transporteurs..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Erreur lors du chargement des transporteurs"
        details={error}
        onRetry={refresh}
      />
    );
  }

  const filteredCarriers = carriers.filter(carrier => {
    const matchesSearch = carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         carrier.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || carrier.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || carrier.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddService = (carrierId: string) => {
    setSelectedCarrierId(carrierId);
    setIsServiceModalOpen(true);
  };

  const handleAddZone = (carrierId: string) => {
    setSelectedCarrierId(carrierId);
    setIsZoneModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Transporteurs</h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nouveau transporteur
        </button>
      </div>

      <div className="mb-6">
        <CarrierFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>

      <CarrierGrid 
        carriers={filteredCarriers}
        onAddService={handleAddService}
        onAddZone={handleAddZone}
      />

      <CreateCarrierModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createCarrier}
      />

      {selectedCarrierId && (
        <>
          <CarrierServiceForm
            isOpen={isServiceModalOpen}
            onClose={() => {
              setIsServiceModalOpen(false);
              setSelectedCarrierId(null);
            }}
            carrierId={selectedCarrierId}
          />

          <CarrierZoneForm
            isOpen={isZoneModalOpen}
            onClose={() => {
              setIsZoneModalOpen(false);
              setSelectedCarrierId(null);
            }}
            carrierId={selectedCarrierId}
          />
        </>
      )}

      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        message={confirmation.message}
        onConfirm={confirmation.onConfirm}
        onClose={closeConfirmation}
      />
    </div>
  );
};

export default CarrierList;