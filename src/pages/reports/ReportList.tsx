import React from 'react';
import { BarChart3 } from 'lucide-react';

const ReportList = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Rapports</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Module de rapports en cours de développement...</p>
      </div>
    </div>
  );
};

export default ReportList;