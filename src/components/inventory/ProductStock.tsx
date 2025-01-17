import React from 'react';
import { ProductStock as ProductStockType } from '../../types/inventory';

interface ProductStockDisplayProps {
  stock: ProductStockType;
  minStock: number;
}

const ProductStockDisplay: React.FC<ProductStockDisplayProps> = ({ stock, minStock }) => {
  const isLowStock = stock.totalQuantity <= minStock;

  return (
    <div>
      <div className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
        {stock.totalQuantity} unités
      </div>
      {isLowStock && (
        <div className="text-sm text-red-500">Stock faible</div>
      )}
    </div>
  );
};

export default ProductStockDisplay;