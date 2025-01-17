import React from 'react';
import { Clock } from 'lucide-react';

interface CarrierServiceSettingsProps {
  carrierId: string;
  services: Array<{
    id: string;
    name: string;
    code: string;
    type: 'express' | 'standard' | 'economy';
    transit_time_min?: number;
    transit_time_max?: number;
  }>;
  onUpdate: (serviceId: string, data: any) => Promise<void>;
}

const CarrierServiceSettings: React.FC<CarrierServiceSettingsProps> = ({
  carrierId,
  services,
  onUpdate
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700">Services disponibles</h3>
      
      <div className="grid gap-4">
        {services.map((service) => (
          <div key={service.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{service.name}</div>
              <span className="text-sm text-gray-500">{service.code}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                {service.transit_time_min && service.transit_time_max
                  ? `${service.transit_time_min}-${service.transit_time_max} jours`
                  : 'Délai non spécifié'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarrierServiceSettings;