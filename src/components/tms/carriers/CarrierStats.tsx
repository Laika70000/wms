import React from 'react';
import { Package, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface CarrierStatsProps {
  stats: {
    totalShipments: number;
    onTimeDeliveries: number;
    averageTransitTime: number;
    issues: number;
  };
}

const CarrierStats: React.FC<CarrierStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-5 h-5 text-blue-500" />
          <h3 className="text-gray-600">Total expéditions</h3>
        </div>
        <p className="text-2xl font-semibold">{stats.totalShipments}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <h3 className="text-gray-600">Livraisons à temps</h3>
        </div>
        <p className="text-2xl font-semibold">
          {((stats.onTimeDeliveries / stats.totalShipments) * 100).toFixed(1)}%
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-5 h-5 text-purple-500" />
          <h3 className="text-gray-600">Délai moyen</h3>
        </div>
        <p className="text-2xl font-semibold">{stats.averageTransitTime.toFixed(1)} jours</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="text-gray-600">Incidents</h3>
        </div>
        <p className="text-2xl font-semibold">
          {((stats.issues / stats.totalShipments) * 100).toFixed(1)}%
        </p>
      </div>
    </div>
  );
};

export default CarrierStats;