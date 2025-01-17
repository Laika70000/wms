import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { useLogisticians } from '../../modules/admin/hooks/useLogisticians';
import LogisticianTable from '../../components/admin/LogisticianTable';
import CreateLogisticianModal from '../../components/admin/CreateLogisticianModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useConfirmation } from '../../hooks/useConfirmation';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

const LogisticianList = () => {
  const { logisticians, loading, error, refresh, createLogistician, updateStatus } = useLogisticians();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { confirmation, confirm, closeConfirmation } = useConfirmation();

  const handleCreate = async (data: { name: string; email: string; password: string }) => {
    try {
      await createLogistician(data);
      setIsCreateModalOpen(false);
      refresh();
    } catch (err) {
      console.error('Error creating logistician:', err);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'active' | 'inactive') => {
    confirm(
      'Êtes-vous sûr de vouloir modifier le statut de ce logisticien ?',
      async () => {
        try {
          await updateStatus(id, status);
          refresh();
        } catch (err) {
          console.error('Error updating logistician status:', err);
        }
      }
    );
  };

  if (loading) {
    return <LoadingSpinner message="Chargement des logisticiens..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Erreur lors du chargement des logisticiens"
        details={error}
        onRetry={refresh}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Gestion des logisticiens</h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nouveau logisticien
        </button>
      </div>

      <LogisticianTable
        logisticians={logisticians}
        onUpdateStatus={handleStatusUpdate}
      />

      <CreateLogisticianModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
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

export default LogisticianList;