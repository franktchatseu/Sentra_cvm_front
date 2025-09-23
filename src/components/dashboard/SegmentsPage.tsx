import { useState } from 'react';
import { Plus, Filter, Search, Users, Database, Zap, MoreHorizontal, Eye, Edit, Copy, Play } from 'lucide-react';
import { color, tw } from '../../design/utils';

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
      dynamic: <Zap className={`w-4 h-4 text-[${color.status.info.main}]`} />,
      static: <Database className={`w-4 h-4 text-[${color.entities.segments}]`} />,
      trigger: <Play className={`w-4 h-4 text-[${color.status.success.main}]`} />
    };
    return icons[type as keyof typeof icons] || <Users className={`w-4 h-4 text-[${color.ui.text.muted}]`} />;
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      dynamic: `bg-[${color.status.info.light}] text-[${color.status.info.main}]`,
      static: `bg-[${color.entities.segments}]/10 text-[${color.entities.segments}]`,
      trigger: `bg-[${color.status.success.light}] text-[${color.status.success.main}]`
    };
    return badges[type as keyof typeof badges] || `bg-[${color.ui.gray[100]}] text-[${color.ui.gray[800]}]`;
  };

  const filteredSegments = selectedType === 'all'
    ? segments
    : segments.filter(segment => segment.type === selectedType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Segments</h1>
          <p className={`${tw.textSecondary} mt-2 text-base`}>Build and manage customer segments for precise targeting</p>
        </div>
        <button className={`inline-flex items-center px-4 py-2 text-base ${tw.primaryButton} font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 whitespace-nowrap`}>
          <Plus className="h-5 w-5 mr-2" />
          Create Segment
        </button>
      </div>

      {/* Type Filters */}
      <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] p-4 sm:p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Type Tabs */}
          <div className={`flex flex-wrap gap-1 bg-[${color.ui.surface}] rounded-lg p-1`}>
            {segmentTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base font-medium transition-colors duration-200 ${selectedType === type.value
                  ? `bg-white text-[${color.sentra.main}] shadow-sm`
                  : `${tw.textSecondary} hover:${tw.textPrimary}`
                  }`}
              >
                <span className="hidden sm:inline">{type.label} ({type.count})</span>
                <span className="sm:hidden">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[${color.ui.text.muted}]`} />
              <input
                type="text"
                placeholder="Search segments..."
                className={`pl-10 pr-4 py-2 border border-[${color.ui.border}] rounded-lg focus:outline-none focus:border-[${color.sentra.main}] focus:ring-1 focus:ring-[${color.sentra.main}]/20 w-full sm:w-64 text-base`}
              />
            </div>
            <button className={`flex items-center px-3 py-2 text-base border border-[${color.ui.border}] ${tw.textSecondary} rounded-lg hover:bg-[${color.ui.surface}] transition-colors duration-200`}>
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Segments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredSegments.map((segment) => (
          <div key={segment.id} className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] hover:shadow-md transition-shadow duration-200`}>
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[${color.entities.segments}]/10 to-[${color.entities.segments}]/20 rounded-xl`}>
                    {getTypeIcon(segment.type)}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${tw.textPrimary} text-sm sm:text-base lg:text-lg`}>{segment.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium ${getTypeBadge(segment.type)}`}>
                      {segment.type.charAt(0).toUpperCase() + segment.type.slice(1)}
                    </span>
                  </div>
                </div>
                <button className={`p-2 ${tw.textMuted} hover:${tw.textSecondary} transition-colors duration-200`}>
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className={`${tw.textSecondary} text-sm sm:text-base mb-4`}>{segment.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                <div className={`text-center p-2 sm:p-3 bg-[${color.ui.surface}] rounded-lg`}>
                  <div className={`text-base sm:text-lg lg:text-xl font-bold ${tw.textPrimary}`}>{segment.size.toLocaleString()}</div>
                  <div className={`text-xs sm:text-sm ${tw.textMuted}`}>Customers</div>
                </div>
                <div className={`text-center p-2 sm:p-3 bg-[${color.ui.surface}] rounded-lg`}>
                  <div className={`text-base sm:text-lg lg:text-xl font-bold ${tw.textPrimary}`}>{segment.campaigns}</div>
                  <div className={`text-xs sm:text-sm ${tw.textMuted}`}>Campaigns</div>
                </div>
                <div className={`text-center p-2 sm:p-3 bg-[${color.ui.surface}] rounded-lg`}>
                  <div className={`text-base sm:text-lg lg:text-xl font-bold ${segment.growth.startsWith('+') ? `text-[${color.status.success.main}]` : segment.growth.startsWith('-') ? `text-[${color.status.error.main}]` : `${tw.textMuted}`}`}>
                    {segment.growth}
                  </div>
                  <div className={`text-xs sm:text-sm ${tw.textMuted}`}>Growth</div>
                </div>
              </div>

              {/* Criteria */}
              {segment.criteria.length > 0 && (
                <div className={`bg-[${color.ui.surface}] rounded-lg p-4 mb-4`}>
                  <div className={`text-sm sm:text-base font-medium ${tw.textPrimary} mb-2`}>Criteria</div>
                  <div className="space-y-1">
                    {segment.criteria.slice(0, 3).map((criterion, index) => (
                      <div key={index} className={`flex items-center space-x-2 text-sm sm:text-base ${tw.textSecondary}`}>
                        <span className="font-medium">{criterion.field}</span>
                        <span className={`text-[${color.status.info.main}] font-mono`}>{criterion.operator}</span>
                        <span className={`bg-[${color.status.info.light}] text-[${color.status.info.main}] px-2 py-1 rounded text-xs sm:text-sm`}>{criterion.value}</span>
                      </div>
                    ))}
                    {segment.criteria.length > 3 && (
                      <div className={`text-xs sm:text-sm ${tw.textMuted}`}>
                        +{segment.criteria.length - 3} more criteria
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className={`flex items-center justify-between pt-4 border-t border-[${color.ui.border}]`}>
                <div className="flex items-center space-x-2">
                  <button className={`p-2 ${tw.textMuted} hover:text-[${color.status.info.main}] transition-colors duration-200`} title="View Details">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className={`p-2 ${tw.textMuted} hover:text-[${color.sentra.main}] transition-colors duration-200`} title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className={`p-2 ${tw.textMuted} hover:text-[${color.status.success.main}] transition-colors duration-200`} title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className={`text-xs sm:text-sm ${tw.textMuted}`}>
                  Updated: {segment.lastUpdated}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSegments.length === 0 && (
        <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] p-12 text-center`}>
          <Users className={`w-12 h-12 text-[${color.entities.segments}] mx-auto mb-4`} />
          <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-2`}>No segments found</h3>
          <p className={`${tw.textSecondary} mb-6`}>Create your first segment to start targeting specific customer groups</p>
          <button className={`inline-flex items-center px-4 py-2 text-base ${tw.primaryButton} font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 whitespace-nowrap`}>
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Segment
          </button>
        </div>
      )}
    </div>
  );
}