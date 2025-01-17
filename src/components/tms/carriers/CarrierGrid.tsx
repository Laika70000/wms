import React from 'react';
import CarrierCard from './CarrierCard';
import { Truck } from 'lucide-react';

interface CarrierGridProps {
  carriers: Array<{
    id: string;
    name: string;
    code: string;
    type: string;
    status: 'active' | 'inactive';
  }>;
  onAddService: (carrierId: string) => void;
  onAddZone: (carrierId: string) => void;
}

const CarrierGrid: React.FC<CarrierGridProps> = ({ 
  carriers,
  onAddService,
  onAddZone
}) => {
  if (carriers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <Truck className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">Aucun transporteur</h3>
        <p className="text-gray-600">
          Ajoutez des transporteurs pour commencer à gérer vos expéditions.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {carriers.map((carrier) => (
        <CarrierCard 
          key={carrier.id} 
          carrier={carrier}
          onAddService={onAddService}
          onAddZone={onAddZone}
        />
      ))}
    </div>
  );
};

export default CarrierGrid;