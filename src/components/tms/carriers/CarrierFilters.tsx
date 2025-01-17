import React from 'react';
import { Search, Filter } from 'lucide-react';

interface CarrierFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

const CarrierFilters: React.FC<CarrierFiltersProps> = ({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange
}) => {
  return (
    <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between">
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un transporteur..."
          className="flex-1 border-none focus:ring-0"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            className="border-gray-300 rounded-md"
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
          >
            <option value="all">Tous les types</option>
            <option value="express">Express</option>
            <option value="standard">Standard</option>
            <option value="economy">Economy</option>
          </select>
        </div>

        <select
          className="border-gray-300 rounded-md"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
      </div>
    </div>
  );
};

export default CarrierFilters;