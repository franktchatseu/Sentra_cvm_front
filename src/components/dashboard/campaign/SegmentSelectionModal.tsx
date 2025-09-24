import { useState, useEffect } from 'react';
import { X, Search, Plus, Target, Users, Filter, Check } from 'lucide-react';
import { CampaignSegment } from '../../../types/campaign';

interface SegmentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (segments: CampaignSegment[]) => void;
  selectedSegments: CampaignSegment[];
  editingSegment?: CampaignSegment | null;
  onCreateNew?: () => void;
}

// Mock segment data - in a real app, this would come from an API
const mockSegments: CampaignSegment[] = [
  {
    id: 'seg-001',
    name: 'High Value Customers',
    description: 'Customers with monthly spend > $100',
    customer_count: 15420,
    created_at: '2024-01-15',
    criteria: {
      spending_range: { min: 100, max: 1000 },
      customer_tier: ['gold', 'platinum'],
      account_age_days: { min: 90, max: 3650 }
    }
  },
  {
    id: 'seg-002',
    name: 'At Risk Customers',
    description: 'Customers showing churn signals',
    customer_count: 8934,
    created_at: '2024-01-10',
    criteria: {
      purchase_behavior: ['declining_usage', 'support_tickets'],
      account_age_days: { min: 30, max: 365 }
    }
  },
  {
    id: 'seg-003',
    name: 'New Subscribers',
    description: 'Customers who joined in the last 30 days',
    customer_count: 3245,
    created_at: '2024-01-20',
    criteria: {
      account_age_days: { min: 0, max: 30 },
      customer_tier: ['bronze', 'silver']
    }
  },
  {
    id: 'seg-004',
    name: 'Voice Heavy Users',
    description: 'Customers with high voice usage patterns',
    customer_count: 12678,
    created_at: '2024-01-12',
    criteria: {
      purchase_behavior: ['high_voice_usage'],
      spending_range: { min: 50, max: 200 }
    }
  },
  {
    id: 'seg-005',
    name: 'Data Bundle Enthusiasts',
    description: 'Customers who frequently purchase data bundles',
    customer_count: 18923,
    created_at: '2024-01-08',
    criteria: {
      purchase_behavior: ['frequent_data_purchase'],
      customer_tier: ['silver', 'gold']
    }
  },
  {
    id: 'seg-006',
    name: 'Weekend Warriors',
    description: 'Customers with high weekend usage',
    customer_count: 7456,
    created_at: '2024-01-18',
    criteria: {
      purchase_behavior: ['weekend_usage'],
      age_range: { min: 18, max: 35 }
    }
  },
  {
    id: 'seg-007',
    name: 'Business Customers',
    description: 'B2B customers and corporate accounts',
    customer_count: 4321,
    created_at: '2024-01-05',
    criteria: {
      customer_tier: ['business', 'enterprise'],
      spending_range: { min: 200, max: 2000 }
    }
  },
  {
    id: 'seg-008',
    name: 'Dormant Users',
    description: 'Customers with no activity in 60+ days',
    customer_count: 5678,
    created_at: '2024-01-14',
    criteria: {
      purchase_behavior: ['inactive'],
      account_age_days: { min: 60, max: 730 }
    }
  }
];

export default function SegmentSelectionModal({
  isOpen,
  onClose,
  onSelect,
  selectedSegments,
  editingSegment,
  onCreateNew
}: SegmentSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [tempSelectedSegments, setTempSelectedSegments] = useState<CampaignSegment[]>(selectedSegments);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempSelectedSegments(selectedSegments);
    }
  }, [isOpen, selectedSegments]);

  if (!isOpen) return null;

  const filteredSegments = mockSegments.filter(segment => {
    const matchesSearch = segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         segment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    
    // Add more filter logic here based on segment criteria
    return matchesSearch;
  });

  const handleSegmentToggle = (segment: CampaignSegment) => {
    const isSelected = tempSelectedSegments.some(s => s.id === segment.id);
    if (isSelected) {
      setTempSelectedSegments(tempSelectedSegments.filter(s => s.id !== segment.id));
    } else {
      setTempSelectedSegments([...tempSelectedSegments, segment]);
    }
  };

  const handleConfirm = () => {
    onSelect(tempSelectedSegments);
  };

  const totalSelectedCustomers = tempSelectedSegments.reduce((total, segment) => total + segment.customer_count, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingSegment ? 'Edit Segment' : 'Select Audience Segments'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Choose segments to target with your campaign
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 space-y-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search segments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b8169] focus:border-transparent"
            >
              <option value="all">All Segments</option>
              <option value="high_value">High Value</option>
              <option value="at_risk">At Risk</option>
              <option value="new">New Customers</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 bg-[#588157] text-white rounded-lg hover:bg-[#3A5A40] transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </button>
          </div>

          {/* Selection Summary */}
          {tempSelectedSegments.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-emerald-900">
                    {tempSelectedSegments.length} segment{tempSelectedSegments.length !== 1 ? 's' : ''} selected
                  </span>
                  <span className="text-sm text-emerald-700 ml-2">
                    ({totalSelectedCustomers.toLocaleString()} total customers)
                  </span>
                </div>
                <button
                  onClick={() => setTempSelectedSegments([])}
                  className="text-sm text-emerald-700 hover:text-emerald-900 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Segments List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSegments.map((segment) => {
              const isSelected = tempSelectedSegments.some(s => s.id === segment.id);
              
              return (
                <div
                  key={segment.id}
                  onClick={() => handleSegmentToggle(segment)}
                  className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-sm ${
                    isSelected
                      ? 'border-[#588157] bg-[#588157]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-[#588157] rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{segment.name}</h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{segment.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {segment.customer_count.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {segment.created_at}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSegments.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No segments found</h3>
              <p className="text-gray-500">Try adjusting your search or create a new segment</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 flex-shrink-0">
          <div className="text-sm text-gray-500">
            {tempSelectedSegments.length} of {filteredSegments.length} segments selected
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={tempSelectedSegments.length === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                tempSelectedSegments.length > 0
                  ? 'bg-[#588157] text-white hover:bg-[#3A5A40]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
