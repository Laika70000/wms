import React, { useState } from 'react';
import { Plus, Store } from 'lucide-react';
import SourceForm from '../../components/sources/SourceForm';
import SourceList from '../../components/sources/SourceList';
import { useSource } from '../../contexts/SourceContext';
import { addSource, deleteSource, syncSourceOrders } from '../../services/sourceService';
import { useAuth } from '../../contexts/AuthContext';
import { Source } from '../../types/sources';

const Sources = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { sources, loading, error, refreshSources } = useSource();
  const { user } = useAuth();

  const handleAddSource = async (source: Source) => {
    try {
      if (!user) return;
      await addSource(user.id, source);
      await refreshSources();
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error adding source:', err);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      await deleteSource(sourceId);
      await refreshSources();
    } catch (err) {
      console.error('Error deleting source:', err);
    }
  };

  const handleSyncSource = async (sourceId: string) => {
    try {
      const source = sources.find(s => s.id === sourceId);
      if (!source) return;
      await syncSourceOrders(source);
      await refreshSources();
    } catch (err) {
      console.error('Error syncing source:', err);
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sources e-commerce</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Ajouter une source
        </button>
      </div>

      <SourceList
        sources={sources}
        onDelete={handleDeleteSource}
        onSync={handleSyncSource}
      />

      <SourceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddSource}
      />
    </div>
  );
};

export default Sources;