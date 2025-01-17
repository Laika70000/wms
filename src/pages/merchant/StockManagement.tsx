import React, { useState } from 'react';
import { Package, AlertTriangle } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import StockList from '../../components/merchant/stock/StockList';
import StockAdjustmentModal from '../../components/merchant/stock/StockAdjustmentModal';
import { useStock } from '../../hooks/useStock';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const StockManagement = () => {
  const { products, loading, error, refresh } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const { adjustStock } = useStock(selectedProductId || '');

  const handleAdjustStock = (productId: string) => {
    setSelectedProductId(productId);
    setIsAdjustModalOpen(true);
  };

  const handleStockAdjustment = async (data: {
    quantity: number;
    type: 'reception' | 'adjustment';
    notes?: string;
  }) => {
    try {
      await adjustStock(data);
      await refresh();
      setIsAdjustModalOpen(false);
      setSelectedProductId(null);
    } catch (err) {
      console.error('Erreur lors de l\'ajustement:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement des stocks..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  const lowStockProducts = products.filter(p => p.minStock >= 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Gestion des stocks</h1>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-medium">Produits en stock faible</h2>
          </div>
          <p className="text-yellow-700">
            {lowStockProducts.length} produit(s) sont en dessous du seuil minimum.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <StockList
          products={products}
          onAdjustStock={handleAdjustStock}
        />
      </div>

      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setSelectedProductId(null);
        }}
        onSubmit={handleStockAdjustment}
      />
    </div>
  );
};

export default StockManagement;