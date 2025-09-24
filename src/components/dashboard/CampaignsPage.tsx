import { useState, useEffect } from 'react';
import { Plus, Filter, Search, Target, Users, Calendar, MoreHorizontal, Eye, Play, Pause, Edit } from 'lucide-react';
import { color, tw } from '../../design/utils';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function CampaignsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

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
      active: `bg-[${color.status.success.light}] text-[${color.status.success.main}]`,
      scheduled: `bg-[${color.status.warning.light}] text-[${color.status.warning.main}]`,
      paused: `bg-[${color.ui.gray[100]}] text-[${color.ui.gray[800]}]`,
      completed: `bg-[${color.status.info.light}] text-[${color.status.info.main}]`
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
          <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Campaigns</h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>Manage and monitor your customer engagement campaigns</p>
        </div>
        <button
          className="inline-flex items-center px-4 py-2 font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 text-sm whitespace-nowrap text-white"
          style={{ backgroundColor: color.sentra.main }}
          onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
          onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Campaign
        </button>
      </div>

      <div className={`bg-white rounded-xl border border-[${color.ui.border}] p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-3">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedStatus === option.value
                  ? 'shadow-lg border-2'
                  : 'border'
                  }`}
                style={{
                  backgroundColor: selectedStatus === option.value ? 'white' : 'white',
                  borderColor: selectedStatus === option.value ? color.sentra.main : color.ui.border,
                  color: selectedStatus === option.value ? color.sentra.main : color.ui.text.secondary
                }}
                onMouseEnter={(e) => {
                  if (selectedStatus !== option.value) {
                    (e.target as HTMLButtonElement).style.backgroundColor = `${color.sentra.main}20`;
                    (e.target as HTMLButtonElement).style.color = color.sentra.main;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedStatus !== option.value) {
                    (e.target as HTMLButtonElement).style.backgroundColor = color.ui.surface;
                    (e.target as HTMLButtonElement).style.color = color.ui.text.secondary;
                  }
                }}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[${color.ui.text.muted}]`} />
              <input
                type="text"
                placeholder="Search campaigns..."
                className={`pl-10 pr-4 py-2.5 border border-[${color.ui.border}] rounded-lg focus:outline-none focus:ring-0 focus:border-gray-300 w-72 text-sm`}
              />
            </div>
            <button className={`flex items-center px-4 py-2.5 border border-[${color.ui.border}] ${tw.textSecondary} rounded-lg hover:bg-[${color.ui.surface}] transition-colors text-base font-medium`}>
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-2xl border border-[${color.ui.border}] overflow-hidden`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner variant="modern" size="xl" color="primary" className="mb-4" />
            <p className={`${tw.textMuted} font-medium text-sm`}>Loading campaigns...</p>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Campaign</th>
                  <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Status</th>
                  <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Segment</th>
                  <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Performance</th>
                  <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Dates</th>
                  <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`bg-white divide-y divide-[${color.ui.border}]/50`}>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className={`group hover:bg-[${color.ui.surface}]/30 transition-all duration-300`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className={`relative flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0`} style={{ background: `${color.entities.campaigns}` }}>
                          <Target className={`w-5 h-5 text-white`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`font-semibold text-base ${tw.textPrimary} truncate`}>{campaign.name}</div>
                          <div className={`text-sm ${tw.textSecondary} truncate flex items-center space-x-2 mt-1`}>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium`} style={{ background: `${color.entities.campaigns}20`, color: color.entities.campaigns }}>
                              {campaign.type}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="truncate">{campaign.offer}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(campaign.status)}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <Users className={`w-4 h-4 text-[${color.entities.segments}] flex-shrink-0`} />
                        <span className={`text-sm ${tw.textPrimary} truncate`}>{campaign.segment}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {campaign.status === 'active' ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className={`${tw.textSecondary}`}>Conversion:</span>
                            <span className={`font-medium ${tw.textPrimary}`}>
                              {((campaign.performance.converted / campaign.performance.sent) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className={`${tw.textSecondary}`}>Revenue:</span>
                            <span className={`font-medium text-[${color.sentra.main}]`}>
                              ${campaign.performance.revenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className={`text-sm ${tw.textMuted}`}>-</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <Calendar className={`w-4 h-4 text-[${color.entities.analytics}] flex-shrink-0`} />
                        <div className={`text-sm ${tw.textPrimary} space-y-1`}>
                          <div className="font-medium">{campaign.startDate}</div>
                          <div className={`${tw.textMuted} text-sm`}>to {campaign.endDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <button className={`group p-3 rounded-xl ${tw.textMuted} hover:text-white transition-all duration-300`} style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.status.info.main; }} onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'; }} title="View Details">
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                        {campaign.status === 'paused' ? (
                          <button className={`group p-3 rounded-xl ${tw.textMuted} hover:text-white transition-all duration-300`} style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }} onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'; }} title="Resume">
                            <Play className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          </button>
                        ) : campaign.status === 'active' ? (
                          <button className={`group p-3 rounded-xl ${tw.textMuted} hover:text-white transition-all duration-300`} style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.status.warning.main; }} onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'; }} title="Pause">
                            <Pause className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          </button>
                        ) : null}
                        <button className={`group p-3 rounded-xl ${tw.textMuted} hover:text-white transition-all duration-300`} style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }} onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'; }} title="Edit">
                          <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                        <button className={`group p-3 rounded-xl ${tw.textMuted} hover:text-white transition-all duration-300`} style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.ui.gray[600]; }} onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'; }}>
                          <MoreHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${color.entities.campaigns}20` }}>
              <Target className="w-8 h-8" style={{ color: color.entities.campaigns }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              {selectedStatus === 'completed'
                ? "No completed campaigns yet. Campaigns will appear here once they finish running."
                : `No ${selectedStatus} campaigns found. Try creating a new campaign or check other status filters.`
              }
            </p>
            {selectedStatus !== 'completed' && (
              <button
                className="mt-4 px-4 py-2 text-sm font-medium rounded-lg text-white transition-all duration-200"
                style={{ backgroundColor: color.sentra.main }}
                onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
              >
                Create Your First Campaign
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}