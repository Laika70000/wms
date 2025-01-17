import React, { useState, useEffect } from 'react';
import { ClipboardList, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../types/orders';
import { PickingBatch } from '../../types/picking';
import { createPickingBatches } from '../../services/pickingService';
import BatchList from '../../components/picking/BatchList';
import BatchFilters from '../../components/picking/BatchFilters';

const PickingList = () => {
  const [batches, setBatches] = useState<PickingBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      // TODO: Implement batch fetching
      const mockOrders: Order[] = [];
      const newBatches = createPickingBatches(mockOrders);
      setBatches(newBatches);
    } catch (err) {
      setError('Erreur lors du chargement des lots');
      console.error('Error loading batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartBatch = (batchId: string) => {
    navigate(`/picking/batch/${batchId}`);
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
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Préparation des commandes</h1>
        </div>
        <button
          onClick={() => loadBatches()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlayCircle className="w-4 h-4" />
          Créer un nouveau lot
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <BatchFilters />
        <BatchList batches={batches} onStartBatch={handleStartBatch} />
      </div>
    </div>
  );
};

export default PickingList;