import React, { useState } from 'react';
import { Plus, Filter, Search, Users, Database, Zap, MoreHorizontal, Eye, Edit, Copy, Play } from 'lucide-react';

export default function SegmentsPage() {
  const [selectedType, setSelectedType] = useState('all');
  
  const segments = [
    {
      id: 1,
      name: 'High Value Users',
      description: 'Customers with ARPU > $50 and active for 6+ months',
      type: 'dynamic',
      size: 15420,
      lastUpdated: '2025-01-18',
      criteria: [
        { field: 'ARPU', operator: '>', value: '50' },
        { field: 'Tenure', operator: '>=', value: '6 months' },
        { field: 'Status', operator: '=', value: 'Active' }
      ],
      campaigns: 5,
      status: 'active',
      growth: '+8.2%'
    },
    {
      id: 2,
      name: 'At Risk Customers',
      description: 'Users showing signs of potential churn based on usage patterns',
      type: 'dynamic',
      size: 8934,
      lastUpdated: '2025-01-18',
      criteria: [
        { field: 'Data Usage', operator: '<', value: '100MB' },
        { field: 'Voice Usage', operator: '<', value: '30min' },
        { field: 'Last Recharge', operator: '>', value: '30 days' }
      ],
      campaigns: 2,
      status: 'active',
      growth: '+12.5%'
    },
    {
      id: 3,
      name: 'New Subscribers',
      description: 'Customers who joined in the last 30 days',
      type: 'dynamic',
      size: 3245,
      lastUpdated: '2025-01-18',
      criteria: [
        { field: 'Activation Date', operator: '>=', value: '30 days ago' },
        { field: 'Status', operator: '=', value: 'Active' }
      ],
      campaigns: 1,
      status: 'active',
      growth: '+45.8%'
    },
    {
      id: 4,
      name: 'Voice Heavy Users',
      description: 'Customers with high voice usage and low data consumption',
      type: 'dynamic',
      size: 12867,
      lastUpdated: '2025-01-17',
      criteria: [
        { field: 'Voice MOU', operator: '>', value: '300' },
        { field: 'Data Usage', operator: '<', value: '500MB' }
      ],
      campaigns: 3,
      status: 'active',
      growth: '-2.1%'
    },
    {
      id: 5,
      name: 'Premium Campaign Targets',
      description: 'Manually curated list for premium product campaigns',
      type: 'static',
      size: 2543,
      lastUpdated: '2025-01-15',
      criteria: [],
      campaigns: 1,
      status: 'active',
      growth: '0%'
    },
    {
      id: 6,
      name: 'Youth Segment (18-25)',
      description: 'Young adults with high app usage and social media engagement',
      type: 'trigger',
      size: 9876,
      lastUpdated: '2025-01-18',
      criteria: [
        { field: 'Age', operator: 'between', value: '18-25' },
        { field: 'App Usage', operator: '>', value: '2GB' },
        { field: 'Social Apps', operator: '=', value: 'Active' }
      ],
      campaigns: 4,
      status: 'active',
      growth: '+15.3%'
    }
  ];

  const segmentTypes = [
    { value: 'all', label: 'All Segments', count: segments.length },
    { value: 'dynamic', label: 'Dynamic', count: segments.filter(s => s.type === 'dynamic').length },
    { value: 'static', label: 'Static', count: segments.filter(s => s.type === 'static').length },
    { value: 'trigger', label: 'Trigger-based', count: segments.filter(s => s.type === 'trigger').length }
  ];

  const getTypeIcon = (type: string) => {
    const icons = {
      dynamic: <Zap className="w-4 h-4 text-blue-600" />,
      static: <Database className="w-4 h-4 text-purple-600" />,
      trigger: <Play className="w-4 h-4 text-emerald-600" />
    };
    return icons[type as keyof typeof icons] || <Users className="w-4 h-4 text-gray-600" />;
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      dynamic: 'bg-blue-100 text-blue-800',
      static: 'bg-purple-100 text-purple-800',
      trigger: 'bg-emerald-100 text-emerald-800'
    };
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const filteredSegments = selectedType === 'all' 
    ? segments 
    : segments.filter(segment => segment.type === selectedType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Segments</h1>
          <p className="text-gray-600 mt-2 text-sm">Build and manage customer segments for precise targeting</p>
        </div>
        <button className="inline-flex items-center px-3 py-2 text-base bg-[#3b8169] hover:bg-[#2d5f4e] text-white font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105">
          <Plus className="h-5 w-5 mr-2" />
          Create Segment
        </button>
      </div>

      {/* Type Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Type Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {segmentTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-3 py-2 text-base rounded-md text-sm font-medium transition-colors duration-200 ${
                  selectedType === type.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type.label} ({type.count})
              </button>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search segments..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none "
              />
            </div>
            <button className="flex items-center px-3 py-2 text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Segments List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredSegments.map((segment) => (
          <div key={segment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                    {getTypeIcon(segment.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{segment.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(segment.type)}`}>
                      {segment.type.charAt(0).toUpperCase() + segment.type.slice(1)}
                    </span>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4">{segment.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{segment.size.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Customers</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{segment.campaigns}</div>
                  <div className="text-xs text-gray-500">Campaigns</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`text-xl font-bold ${segment.growth.startsWith('+') ? 'text-emerald-600' : segment.growth.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
                    {segment.growth}
                  </div>
                  <div className="text-xs text-gray-500">Growth</div>
                </div>
              </div>

              {/* Criteria */}
              {segment.criteria.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Criteria</div>
                  <div className="space-y-1">
                    {segment.criteria.slice(0, 3).map((criterion, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="font-medium">{criterion.field}</span>
                        <span className="text-blue-600 font-mono">{criterion.operator}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{criterion.value}</span>
                      </div>
                    ))}
                    {segment.criteria.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{segment.criteria.length - 3} more criteria
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200" title="View Details">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors duration-200" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors duration-200" title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Updated: {segment.lastUpdated}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSegments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No segments found</h3>
          <p className="text-gray-600 mb-6">Create your first segment to start targeting specific customer groups</p>
          <button className="inline-flex items-center px-3 py-2 text-base bg-[#3b8169] hover:bg-[#2d5f4e] text-white font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Segment
          </button>
        </div>
      )}
    </div>
  );
}