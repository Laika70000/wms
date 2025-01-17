import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const BatchFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between">
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un lot..."
          className="flex-1 border-none focus:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          className="border-gray-300 rounded-md"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">À préparer</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminés</option>
        </select>
      </div>
    </div>
  );
};

export default BatchFilters;