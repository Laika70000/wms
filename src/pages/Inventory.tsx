import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, ArrowUpDown } from 'lucide-react';
import { Product } from '../types/inventory';
import { getProducts, getLowStockProducts } from '../services/inventoryService';

const Inventory = () => {
  const [products] = useState<Product[]>(getProducts());
  const [showLowStock, setShowLowStock] = useState(false);
  const lowStockProducts = getLowStockProducts();

  const handleAddProduct = () => {
    alert('Add product functionality coming soon');
  };

  const handleAdjustStock = (productId: string) => {
    alert(`Adjust stock for product ${productId}`);
  };

  const displayedProducts = showLowStock 
    ? lowStockProducts 
    : products;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Inventory Management</h1>
        </div>
        <div className="flex gap-3">
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              showLowStock 
                ? 'bg-red-50 text-red-700 border-red-200' 
                : 'bg-white border-gray-200'
            }`}
            onClick={() => setShowLowStock(!showLowStock)}
          >
            <AlertTriangle className="w-4 h-4" />
            Low Stock ({lowStockProducts.length})
          </button>
          <button 
            onClick={handleAddProduct}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        product.quantity <= product.minStock ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {product.quantity}
                      </span>
                      {product.quantity <= product.minStock && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(product.lastUpdated).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                      onClick={() => handleAdjustStock(product.id)}
                    >
                      <ArrowUpDown className="w-4 h-4" />
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;