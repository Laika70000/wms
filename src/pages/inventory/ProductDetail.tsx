import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, AlertTriangle, MapPin, History } from 'lucide-react';
import { getProduct, getProductStock, getStockMovements } from '../../services/inventoryService';
import { Product, ProductStock, StockMovement } from '../../types/inventory';
import StockMovementList from '../../components/inventory/StockMovementList';
import ProductStockDisplay from '../../components/inventory/ProductStock';
import AdjustStockModal from '../../components/inventory/AdjustStockModal';
import { updateStock } from '../../services/stockService';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [stock, setStock] = useState<ProductStock | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProductData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [productData, stockData, movementsData] = await Promise.all([
          getProduct(id),
          getProductStock(id),
          getStockMovements(id)
        ]);
        
        setProduct(productData);
        setStock(stockData);
        setMovements(movementsData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Error loading product data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  const handleStockAdjustment = async (data: {
    quantity: number;
    type: 'reception' | 'adjustment';
    notes?: string;
  }) => {
    if (!product || !stock?.locations[0]) return;

    try {
      await updateStock({
        productId: product.id,
        locationId: stock.locations[0].location.id,
        quantity: data.quantity,
        type: data.type,
        notes: data.notes
      });

      // Recharger les données
      const [newStock, newMovements] = await Promise.all([
        getProductStock(product.id),
        getStockMovements(product.id)
      ]);

      setStock(newStock);
      setMovements(newMovements);
      setIsAdjustModalOpen(false);
    } catch (err) {
      console.error('Error adjusting stock:', err);
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  if (error || !product || !stock) {
    return (
      <div className="p-6 text-red-600">
        {error || 'Produit non trouvé'}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-gray-600">SKU: {product.sku}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Informations</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" />
                <span>Stock actuel</span>
              </div>
              <ProductStockDisplay stock={stock} minStock={product.minStock} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-gray-400" />
                <span>Stock minimum</span>
              </div>
              <span>{product.minStock}</span>
            </div>

            {stock.locations.map(loc => (
              <div key={loc.location.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>
                    {loc.location.aisle}-{loc.location.section}-{loc.location.shelf}
                  </span>
                </div>
                <span>{loc.quantity} unités</span>
              </div>
            ))}

            <button
              onClick={() => setIsAdjustModalOpen(true)}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ajuster le stock
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Mouvements de stock</h2>
            <History className="w-5 h-5 text-gray-400" />
          </div>
          <StockMovementList movements={movements} />
        </div>
      </div>

      <AdjustStockModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        onSubmit={handleStockAdjustment}
      />
    </div>
  );
};

export default ProductDetail;