import React, { useMemo } from 'react';
import { MapPin, Package, Archive, AlertTriangle } from 'lucide-react';
import { Location } from '../../types/inventory';

interface LocationStatisticsProps {
  locations: Location[];
}

const LocationStatistics: React.FC<LocationStatisticsProps> = ({ locations }) => {
  const stats = useMemo(() => {
    const totalLocations = locations.length;
    const totalCapacity = locations.reduce((sum, loc) => sum + loc.capacity, 0);
    const totalOccupied = locations.reduce((sum, loc) => sum + loc.occupied, 0);
    const fullLocations = locations.filter(loc => loc.occupied >= loc.capacity).length;

    return {
      totalLocations,
      totalCapacity,
      totalOccupied,
      fullLocations,
      occupancyRate: totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0
    };
  }, [locations]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          <h3 className="text-gray-600">Total emplacements</h3>
        </div>
        <p className="text-2xl font-semibold">{stats.totalLocations}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-5 h-5 text-green-500" />
          <h3 className="text-gray-600">Capacité totale</h3>
        </div>
        <p className="text-2xl font-semibold">{stats.totalCapacity.toFixed(2)} m³</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Archive className="w-5 h-5 text-purple-500" />
          <h3 className="text-gray-600">Taux d'occupation</h3>
        </div>
        <p className="text-2xl font-semibold">{stats.occupancyRate.toFixed(1)}%</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-gray-600">Emplacements pleins</h3>
        </div>
        <p className="text-2xl font-semibold">{stats.fullLocations}</p>
      </div>
    </div>
  );
};

export default LocationStatistics;