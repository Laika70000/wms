import React, { useState } from 'react';
import { Calculator, Plus } from 'lucide-react';
import { useRates } from '../../hooks/useRates';
import RateTable from '../../components/tms/RateTable';
import CreateRateModal from '../../components/tms/CreateRateModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const RateList = () => {
  const { rates, loading, error, refresh, createRate } = useRates();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner message="Chargement des tarifs..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Erreur lors du chargement des tarifs"
        details={error}
        onRetry={refresh}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Grille tarifaire</h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nouveau tarif
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <RateTable rates={rates} />
      </div>

      <CreateRateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createRate}
      />
    </div>
  );
};

export default RateList;