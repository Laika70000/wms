import React, { useState } from 'react';
import { Package, Plus, Upload } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import ProductTable from '../../components/products/ProductTable';
import ProductSearch from '../../components/products/ProductSearch';
import ProductForm from '../../components/products/ProductForm';
import ProductImportModal from '../../components/products/ProductImportModal';
import { createProduct } from '../../services/merchant/productService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const ProductCatalog = () => {
  const { products, loading, error, refresh } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleCreateProduct = async (productData: any) => {
    try {
      await createProduct(productData);
      await refresh();
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error creating product:', err);
    }
  };

  const handleImportProducts = async (file: File) => {
    try {
      // Implémenter la logique d'import
      await refresh();
      setIsImportOpen(false);
    } catch (err) {
      console.error('Error importing products:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement des produits..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Catalogue Produits</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            Importer
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nouveau produit
          </button>
        </div>
      </div>

      <div className="mb-6">
        <ProductSearch 
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ProductTable 
          products={filteredProducts}
          onEdit={() => {}} // À implémenter
        />
      </div>

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateProduct}
      />

      <ProductImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportProducts}
      />
    </div>
  );
};

export default ProductCatalog;