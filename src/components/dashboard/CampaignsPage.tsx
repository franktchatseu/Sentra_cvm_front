import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Search, Target, Users, Calendar, MoreHorizontal, Eye, Play, Pause, Edit } from 'lucide-react';

export default function CampaignsPage() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const campaigns = [
    {
      id: 1,
      name: 'Summer Data Bundle Promotion',
      status: 'active',
      type: 'Acquisition',
      segment: 'High Value Users',
      offer: 'Double Data Bundle',
      startDate: '2025-01-15',
      endDate: '2025-01-31',
      performance: {
        sent: 15420,
        delivered: 14892,
        opened: 8934,
        converted: 2847,
        revenue: 45280
      }
    },
    {
      id: 2,
      name: 'Churn Prevention - Q1',
      status: 'scheduled',
      type: 'Retention',
      segment: 'At Risk Customers',
      offer: 'Special Retention Offer',
      startDate: '2025-01-22',
      endDate: '2025-02-15',
      performance: {
        sent: 0,
        delivered: 0,
        opened: 0,
        converted: 0,
        revenue: 0
      }
    },
    {
      id: 3,
      name: 'New Customer Welcome Series',
      status: 'active',
      type: 'Onboarding',
      segment: 'New Subscribers',
      offer: 'Welcome Bonus Package',
      startDate: '2025-01-10',
      endDate: '2025-02-10',
      performance: {
        sent: 3245,
        delivered: 3198,
        opened: 2456,
        converted: 894,
        revenue: 12340
      }
    },
    {
      id: 4,
      name: 'Weekend Voice Bundle Push',
      status: 'paused',
      type: 'Upsell',
      segment: 'Voice Heavy Users',
      offer: 'Weekend Voice Bundle',
      startDate: '2025-01-08',
      endDate: '2025-01-20',
      performance: {
        sent: 8765,
        delivered: 8432,
        opened: 4321,
        converted: 1234,
        revenue: 18750
      }
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Campaigns', count: campaigns.length },
    { value: 'active', label: 'Active', count: campaigns.filter(c => c.status === 'active').length },
    { value: 'scheduled', label: 'Scheduled', count: campaigns.filter(c => c.status === 'scheduled').length },
    { value: 'paused', label: 'Paused', count: campaigns.filter(c => c.status === 'paused').length },
    { value: 'completed', label: 'Completed', count: 0 }
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-[#3b8169]/10 text-[#3b8169]',
      scheduled: 'bg-yellow-100 text-yellow-800',
      paused: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const filteredCampaigns = selectedStatus === 'all' 
    ? campaigns 
    : campaigns.filter(campaign => campaign.status === selectedStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-2 text-base">Manage and monitor your customer engagement campaigns</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/campaigns/create')}
          className="inline-flex items-center px-4 py-2 bg-[#3b8169] hover:bg-[#2d5f4e] text-white font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 text-base whitespace-nowrap"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base font-medium transition-colors duration-200 ${
                  selectedStatus === option.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="hidden sm:inline">{option.label} ({option.count})</span>
                <span className="sm:hidden">{option.label}</span>
              </button>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none w-full sm:w-64 text-base"
              />
            </div>
            <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-base">
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-base font-semibold text-gray-900">
            {filteredCampaigns.length} Campaign{filteredCampaigns.length !== 1 ? 's' : ''}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg flex-shrink-0">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">{campaign.name}</div>
                        <div className="text-base text-gray-600 truncate">{campaign.type} • {campaign.offer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs sm:text-base font-medium ${getStatusBadge(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-base text-gray-900 truncate">{campaign.segment}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    {campaign.status === 'active' ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-base">
                          <span className="text-gray-600">Conversion:</span>
                          <span className="font-medium text-gray-900">
                            {((campaign.performance.converted / campaign.performance.sent) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-base">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-medium text-[#1a3d2e]">
                            ${campaign.performance.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-base text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div className="text-base text-gray-900">
                        <div>{campaign.startDate}</div>
                        <div className="text-gray-500 text-base">to {campaign.endDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      {campaign.status === 'paused' ? (
                        <button className="p-2 text-gray-400 hover:text-[#1a3d2e] transition-colors duration-200" title="Resume">
                          <Play className="w-4 h-4" />
                        </button>
                      ) : campaign.status === 'active' ? (
                        <button className="p-2 text-gray-400 hover:text-yellow-600 transition-colors duration-200" title="Pause">
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : null}
                      <button className="p-2 text-gray-400 hover:text-[#1a3d2e] transition-colors duration-200" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}