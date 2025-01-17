import React from 'react';
import { MapPin } from 'lucide-react';

interface CarrierZoneSettingsProps {
  carrierId: string;
  zones: Array<{
    id: string;
    name: string;
    code: string;
    countries: string[];
  }>;
  onUpdate: (zoneId: string, data: any) => Promise<void>;
}

const CarrierZoneSettings: React.FC<CarrierZoneSettingsProps> = ({
  carrierId,
  zones,
  onUpdate
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700">Zones de livraison</h3>
      
      <div className="grid gap-4">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{zone.name}</div>
              <span className="text-sm text-gray-500">{zone.code}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div className="text-sm text-gray-600">
                {zone.countries.join(', ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarrierZoneSettings;