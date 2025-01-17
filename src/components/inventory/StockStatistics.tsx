import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Package } from 'lucide-react';

interface StockStatistics {
  totalProducts: number;
  lowStockProducts: number;
  totalValue: number;
  stockTurnover: number;
}

interface StockStatisticsProps {
  statistics: StockStatistics;
}

const StockStatistics: React.FC<StockStatisticsProps> = ({ statistics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-5 h-5 text-blue-500" />
          <h3 className="text-gray-600">Total produits</h3>
        </div>
        <p className="text-2xl font-semibold">{statistics.totalProducts}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <h3 className="text-gray-600">Stock faible</h3>
        </div>
        <p className="text-2xl font-semibold">{statistics.lowStockProducts}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-5 h-5 text-green-500" />
          <h3 className="text-gray-600">Valeur du stock</h3>
        </div>
        <p className="text-2xl font-semibold">{statistics.totalValue.toFixed(2)} €</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          <h3 className="text-gray-600">Rotation du stock</h3>
        </div>
        <p className="text-2xl font-semibold">{statistics.stockTurnover.toFixed(1)}</p>
      </div>
    </div>
  );
};

export default StockStatistics;