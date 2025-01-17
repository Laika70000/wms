import React, { useState } from 'react';
import { ListFilter, Plus } from 'lucide-react';
import { useRules } from '../../hooks/useRules';
import AllocationRuleList from '../../components/tms/AllocationRuleList';
import AllocationRuleForm from '../../components/tms/AllocationRuleForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const RuleList = () => {
  const { rules, loading, error, refresh, createRule, updatePriority } = useRules();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner message="Chargement des règles..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Erreur lors du chargement des règles"
        details={error}
        onRetry={refresh}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ListFilter className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Règles d'allocation</h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nouvelle règle
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <AllocationRuleList 
          rules={rules}
          onMovePriority={updatePriority}
        />
      </div>

      <AllocationRuleForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createRule}
      />
    </div>
  );
};

export default RuleList;