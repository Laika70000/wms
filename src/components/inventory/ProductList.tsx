import React from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { Product } from '../../types/inventory';

interface ProductListProps {
  products: Product[];
  onAdjustStock: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAdjustStock }) => {
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
              Catégorie
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Emplacement
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
                <Link to={`/inventory/${product.id}`} className="hover:text-blue-600">
                  <div className="font-medium">{product.name}</div>
                  {product.description && (
                    <div className="text-sm text-gray-500">{product.description}</div>
                  )}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{product.sku}</td>
              <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className={product.minStock >= 0 ? 'text-red-600' : ''}>
                    {/* Le stock sera ajouté via ProductStock */}
                  </span>
                  {product.minStock >= 0 && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {/* Les emplacements seront ajoutés via ProductLocations */}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onAdjustStock(product.id)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                >
                  <ArrowUpDown className="w-4 h-4" />
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

export default ProductList;