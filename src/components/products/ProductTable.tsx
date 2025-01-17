import React from 'react';
import { Product } from '../../types/inventory';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit }) => {
  return (
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
            Prix
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Stock Min
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {products.map((product) => (
          <tr key={product.id} className="hover:bg-gray-50">
            <td className="px-6 py-4">
              <div className="font-medium text-gray-900">{product.name}</div>
              {product.description && (
                <div className="text-sm text-gray-500">{product.description}</div>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{product.sku}</td>
            <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
            <td className="px-6 py-4 whitespace-nowrap">{product.price}€</td>
            <td className="px-6 py-4 whitespace-nowrap">{product.minStock}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <button 
                onClick={() => onEdit(product)}
                className="text-blue-600 hover:text-blue-800"
              >
                Modifier
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductTable;