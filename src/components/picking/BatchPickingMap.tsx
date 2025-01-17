import React from 'react';
import { PickingRoute } from '../../types/picking';
import { MapPin, ArrowRight } from 'lucide-react';

interface BatchPickingMapProps {
  route: PickingRoute;
}

const BatchPickingMap: React.FC<BatchPickingMapProps> = ({ route }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Parcours optimisé</h3>
      
      <div className="flex flex-wrap items-center gap-2">
        {route.optimizedPath.map((location, index) => (
          <React.Fragment key={location}>
            <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-lg">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="font-medium">{location}</span>
            </div>
            {index < route.optimizedPath.length - 1 && (
              <ArrowRight className="w-4 h-4 text-gray-400" />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <p className="text-sm text-gray-600 mt-4">
        Distance estimée: {route.estimatedDistance} unités
      </p>
    </div>
  );
};

export default BatchPickingMap;