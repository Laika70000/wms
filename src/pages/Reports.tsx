import React from 'react';
import { BarChart3 } from 'lucide-react';

const Reports = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Reports content coming soon...</p>
      </div>
    </div>
  );
};

export default Reports;