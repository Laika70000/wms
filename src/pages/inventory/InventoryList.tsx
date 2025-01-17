import React, { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { useProducts } from '../../modules/inventory/hooks/useProducts';
import ProductList from '../../components/inventory/ProductList';
import StockStatistics from '../../components/inventory/StockStatistics';
import CreateProductModal from '../../components/inventory/CreateProductModal';
import AdjustStockModal from '../../components/inventory/AdjustStockModal';
import { createProduct } from '../../modules/inventory/api/inventoryApi';
import { updateStock } from '../../services/stockService';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const InventoryList = () => {
  const { products, loading, error, refresh } = useProducts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const handleCreateProduct = async (productData: any) => {
    try {
      await createProduct(productData);
      await refresh();
      setIsCreateModalOpen(false);
    } catch (error) {
      // Error is handled by createProduct
      console.error('Error creating product:', error);
    }
  };

  const handleAdjustStock = (productId: string) => {
    if (!productId) {
      toast.error('No product selected');
      return;
    }
    setSelectedProductId(productId);
    setIsAdjustModalOpen(true);
  };

  const handleStockAdjustment = async (data: {
    quantity: number;
    type: 'reception' | 'adjustment';
    locationId: string;
    notes?: string;
  }) => {
    if (!selectedProductId) {
      toast.error('No product selected');
      return;
    }

    try {
      await updateStock({
        productId: selectedProductId,
        locationId: data.locationId,
        quantity: data.quantity,
        type: data.type,
        notes: data.notes
      });
      
      await refresh();
      setIsAdjustModalOpen(false);
      setSelectedProductId(null);
    } catch (error) {
      // Error is handled by updateStock
      console.error('Error adjusting stock:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading inventory..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Inventory Management</h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Product
        </button>
      </div>

      <div className="mb-6">
        <StockStatistics statistics={{
          totalProducts: products.length,
          lowStockProducts: products.filter(p => p.minStock >= 0).length,
          totalValue: products.reduce((sum, p) => sum + (p.price || 0), 0),
          stockTurnover: 0 // To implement
        }} />
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <ProductList
          products={products}
          onAdjustStock={handleAdjustStock}
        />
      </div>

      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProduct}
      />

      {selectedProductId && (
        <AdjustStockModal
          isOpen={isAdjustModalOpen}
          onClose={() => {
            setIsAdjustModalOpen(false);
            setSelectedProductId(null);
          }}
          onSubmit={handleStockAdjustment}
        />
      )}
    </div>
  );
};

export default InventoryList;