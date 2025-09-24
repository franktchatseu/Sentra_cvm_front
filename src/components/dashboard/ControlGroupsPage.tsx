import { useState } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  Percent,
  Clock,
  Filter,
  MoreVertical,
  X,
  BarChart3
} from 'lucide-react';
import { campaignColors } from '../../config/campaignColors';

interface UniversalControlGroup {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'expired';
  generationTime: string;
  percentage: number;
  memberCount: number;
  customerBase: 'active_subscribers' | 'all_customers' | 'saved_segments';
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly';
  lastGenerated: string;
  nextGeneration?: string;
  createdBy: string;
  description?: string;
}

export default function ControlGroupsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data
  const controlGroups: UniversalControlGroup[] = [
    {
      id: '1',
      name: 'Premium Customer Control',
      status: 'active',
      generationTime: '2025-01-20 09:00',
      percentage: 15,
      memberCount: 12500,
      customerBase: 'active_subscribers',
      recurrence: 'weekly',
      lastGenerated: '2025-01-20',
      nextGeneration: '2025-01-27',
      createdBy: 'Marketing Team',
      description: 'Control group for premium customer campaigns'
    },
    {
      id: '2',
      name: 'General Population Control',
      status: 'active',
      generationTime: '2025-01-19 14:30',
      percentage: 10,
      memberCount: 25000,
      customerBase: 'all_customers',
      recurrence: 'monthly',
      lastGenerated: '2025-01-19',
      nextGeneration: '2025-02-19',
      createdBy: 'Data Science Team',
      description: 'Standard control group for all customer campaigns'
    },
    {
      id: '3',
      name: 'Segment-Based Control',
      status: 'inactive',
      generationTime: '2025-01-15 11:00',
      percentage: 20,
      memberCount: 8750,
      customerBase: 'saved_segments',
      recurrence: 'once',
      lastGenerated: '2025-01-15',
      createdBy: 'Campaign Manager',
      description: 'One-time control group for specific segment testing'
    }
  ];

  const filteredGroups = controlGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || group.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCustomerBaseLabel = (base: string) => {
    switch (base) {
      case 'active_subscribers':
        return 'Active Subscribers';
      case 'all_customers':
        return 'All Customers';
      case 'saved_segments':
        return 'Saved Segments';
      default:
        return base;
    }
  };

  const getRecurrenceLabel = (recurrence: string) => {
    switch (recurrence) {
      case 'once':
        return 'One-time';
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return recurrence;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Universal Control Groups</h1>
          <p className="text-gray-600 mt-1">
            Configure and manage universal control groups for campaigns
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: campaignColors.primary }}
        >
          <Plus className="h-4 w-4" />
          <span>Create Control Group</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search control groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Control Groups Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generation Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member Count
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Base
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recurrence
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGroups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${campaignColors.primary}20` }}
                        >
                          <Shield className="h-5 w-5" style={{ color: campaignColors.primary }} />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{group.name}</div>
                        {group.description && (
                          <div className="text-sm text-gray-500">{group.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(group.status)}`}>
                      {group.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {group.generationTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Percent className="h-4 w-4 mr-2 text-gray-400" />
                      {group.percentage}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      {group.memberCount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {getCustomerBaseLabel(group.customerBase)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {getRecurrenceLabel(group.recurrence)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        title="More options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No control groups found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first universal control group to get started'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-white rounded-lg transition-all duration-200"
              style={{ backgroundColor: campaignColors.primary }}
            >
              Create Control Group
            </button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${campaignColors.primary}20` }}
            >
              <Shield className="h-6 w-6" style={{ color: campaignColors.primary }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Control Groups</p>
              <p className="text-2xl font-bold text-gray-900">{controlGroups.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Groups</p>
              <p className="text-2xl font-bold text-gray-900">
                {controlGroups.filter(g => g.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Percent className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {controlGroups.reduce((sum, g) => sum + g.memberCount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Control Group Modal - Direct to Create */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create Universal Control Group</h3>
                <p className="text-sm text-gray-600 mt-1">Step 1 of 3</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#588157] text-[#588157] bg-white">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-[#588157]">Customer Base</span>
                  <div className="w-16 h-0.5 mx-4 bg-gray-300" />
                </div>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 text-gray-400 bg-white">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-500">Metrics</span>
                  <div className="w-16 h-0.5 mx-4 bg-gray-300" />
                </div>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 text-gray-400 bg-white">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-500">Scheduling</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Control Group Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#588157] focus:border-[#588157]"
                    placeholder="Enter control group name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select the Customer Base for your Control Group
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="customerBase"
                        value="active_subscribers"
                        defaultChecked
                        className="mt-1 w-4 h-4 text-[#588157] border-gray-300 focus:ring-[#588157]"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">Active Subscribers</div>
                        <div className="text-sm text-gray-500">Only active subscribers</div>
                      </div>
                    </label>
                    <label className="flex items-start p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="customerBase"
                        value="all_customers"
                        className="mt-1 w-4 h-4 text-[#588157] border-gray-300 focus:ring-[#588157]"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">All Customers</div>
                        <div className="text-sm text-gray-500">All customers in the database</div>
                      </div>
                    </label>
                    <label className="flex items-start p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="customerBase"
                        value="saved_segments"
                        className="mt-1 w-4 h-4 text-[#588157] border-gray-300 focus:ring-[#588157]"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">Saved Segments</div>
                        <div className="text-sm text-gray-500">Use predefined customer segments</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <button
                disabled
                className="px-4 py-2 border border-gray-300 text-gray-400 rounded-md cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-[#588157] text-white rounded-md hover:bg-[#3A5A40]"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
