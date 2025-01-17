import React from 'react';
import { Map } from 'lucide-react';

const Locations = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Map className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Warehouse Locations</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Locations content coming soon...</p>
      </div>
    </div>
  );
};

export default Locations;