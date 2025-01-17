import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import CarrierLogo from './CarrierLogo';

interface CarrierCardProps {
  carrier: {
    id: string;
    name: string;
    code: string;
    type: string;
    status: 'active' | 'inactive';
  };
  onAddService: (carrierId: string) => void;
  onAddZone: (carrierId: string) => void;
}

const CarrierCard: React.FC<CarrierCardProps> = ({ 
  carrier,
  onAddService,
  onAddZone
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <CarrierLogo code={carrier.code} />
          <div>
            <h3 className="font-medium">{carrier.name}</h3>
            <p className="text-sm text-gray-500">{carrier.code}</p>
          </div>
        </div>
        <Link
          to={`/tms/carriers/${carrier.id}`}
          className="text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Type</span>
          <span className="capitalize">{carrier.type}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Statut</span>
          <div className="flex items-center gap-2">
            {carrier.status === 'active' ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-700">Actif</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-red-700">Inactif</span>
              </>
            )}
          </div>
        </div>

        <div className="pt-4 border-t flex justify-between">
          <button
            onClick={() => onAddService(carrier.id)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-4 h-4" />
            Service
          </button>
          <button
            onClick={() => onAddZone(carrier.id)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-4 h-4" />
            Zone
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarrierCard;