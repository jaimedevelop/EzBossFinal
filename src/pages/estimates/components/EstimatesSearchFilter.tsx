import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

interface EstimatesSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const EstimatesSearchFilter: React.FC<EstimatesSearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange
}) => {
  const statuses = [
    'All Status',
    'Draft',
    'Pending',
    'Under Review',
    'Approved',
    'Rejected',
    'Expired'
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search estimates by number, client, or project..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-sm"
          >
            {statuses.map((status) => (
              <option key={status} value={status === 'All Status' ? '' : status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-sm"
          >
            <option value="estimateNumber">Sort by Number</option>
            <option value="client">Client Name</option>
            <option value="createdDate">Created Date</option>
            <option value="validUntil">Valid Until</option>
            <option value="total">Total Amount</option>
            <option value="status">Status</option>
          </select>

          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-sm">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Advanced</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstimatesSearchFilter;