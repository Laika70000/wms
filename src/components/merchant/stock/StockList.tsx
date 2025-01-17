import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Product } from '../../../types/inventory';

interface StockListProps {
  products: Product[];
  onAdjustStock: (productId: string) => void;
}

const StockList: React.FC<StockListProps> = ({ products, onAdjustStock }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Produit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              SKU
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Stock actuel
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Stock minimum
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium">{product.name}</div>
                  {product.description && (
                    <div className="text-sm text-gray-500">{product.description}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{product.sku}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className={product.minStock >= 0 ? 'text-red-600' : ''}>
                    {/* Le stock sera ajouté via le hook useStock */}
                    0
                  </span>
                  {product.minStock >= 0 && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {product.minStock}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onAdjustStock(product.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Ajuster le stock
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockList;