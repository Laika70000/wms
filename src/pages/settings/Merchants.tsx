import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { useMerchants } from '../../contexts/MerchantContext';
import CreateMerchantModal from '../../components/merchants/CreateMerchantModal';
import MerchantList from '../../components/merchants/MerchantList';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const Merchants = () => {
  const { merchants, loading, error, refreshMerchants } = useMerchants();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner message="Chargement des marchands..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refreshMerchants} />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Marchands</h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nouveau marchand
        </button>
      </div>

      <MerchantList merchants={merchants} onRefresh={refreshMerchants} />

      <CreateMerchantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refreshMerchants}
      />
    </div>
  );
};

export default Merchants;