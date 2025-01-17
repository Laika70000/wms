import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { useMerchants } from '../../contexts/MerchantContext';
import { createMerchant, linkMerchant, unlinkMerchant, updateMerchantStatus } from '../../services/merchant';
import CreateMerchantModal from '../../components/merchants/CreateMerchantModal';
import MerchantTable from '../../components/merchants/MerchantTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useConfirmation } from '../../hooks/useConfirmation';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

const MerchantList = () => {
  const { merchants, loading, error, refreshMerchants } = useMerchants();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { confirmation, confirm, closeConfirmation } = useConfirmation();

  const handleCreateMerchant = async (data: { name: string; email: string; password: string }) => {
    try {
      await createMerchant(data);
      await refreshMerchants();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating merchant:', err);
    }
  };

  const handleLinkMerchant = async (merchantId: string) => {
    try {
      await linkMerchant(merchantId);
      await refreshMerchants();
    } catch (err) {
      console.error('Error linking merchant:', err);
    }
  };

  const handleUnlinkMerchant = async (merchantId: string) => {
    confirm(
      'Are you sure you want to unlink this merchant? This action cannot be undone.',
      async () => {
        try {
          await unlinkMerchant(merchantId);
          await refreshMerchants();
        } catch (err) {
          console.error('Error unlinking merchant:', err);
        }
      }
    );
  };

  const handleUpdateStatus = async (merchantId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      await updateMerchantStatus(merchantId, status);
      await refreshMerchants();
    } catch (err) {
      console.error('Error updating merchant status:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading merchants..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Error loading merchants"
        details={error}
        onRetry={refreshMerchants}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Connected Merchants</h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Merchant
        </button>
      </div>

      <MerchantTable
        merchants={merchants}
        onLink={handleLinkMerchant}
        onUnlink={handleUnlinkMerchant}
        onUpdateStatus={handleUpdateStatus}
      />

      <CreateMerchantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMerchant}
      />

      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        message={confirmation.message}
        onConfirm={confirmation.onConfirm}
        onClose={closeConfirmation}
      />
    </div>
  );
};

export default MerchantList;