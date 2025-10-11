import { useState, useEffect } from 'react';
import { X, Search, Plus, Users, Check } from 'lucide-react';
import { CampaignSegment } from '../../types/campaign';
import HeadlessSelect from '../../../../shared/components/ui/HeadlessSelect';
import { color } from '../../../../shared/utils/utils';

interface SegmentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (segments: CampaignSegment[]) => void;
  selectedSegments: CampaignSegment[];
  editingSegment?: CampaignSegment | null;
  onCreateNew?: () => void;
}

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

  const filterOptions = [
    { value: 'all', label: 'All Segments' },
    { value: 'high_value', label: 'High Value' },
    { value: 'at_risk', label: 'At Risk' },
    { value: 'new', label: 'New Customers' },
    { value: 'inactive', label: 'Inactive' }
  ];

  useEffect(() => {
    if (isOpen) {
      setTempSelectedSegments(selectedSegments);
    }
  }, [isOpen, selectedSegments]);

  if (!isOpen) return null;

  const filteredSegments = mockSegments.filter(segment => {
    const matchesSearch = segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (segment.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());

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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
      <div className="bg-white rounded-2xl  w-full max-w-4xl max-h-[90vh] flex flex-col">
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

        <div className="px-6 pt-6 space-y-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search segments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg "
              />
            </div>
            <div className="w-48">
              <div className="[&_button]:py-2 [&_li]:py-1.5">
                <HeadlessSelect
                  options={filterOptions}
                  value={selectedFilter}
                  onChange={(value: string | number) => setSelectedFilter(value as string)}
                  placeholder="Filter segments"
                />
              </div>
            </div>
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 bg-[#3A5A40] text-white rounded-lg text-sm font-medium hover:bg-[#2f4a35] transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </button>
          </div>

          {tempSelectedSegments.length > 0 && (
            <div className="rounded-lg p-4 bg-emerald-100 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-emerald-700">
                    {tempSelectedSegments.length} segment{tempSelectedSegments.length !== 1 ? 's' : ''} selected
                  </span>
                  <span className="text-sm ml-2 text-emerald-600">
                    ({totalSelectedCustomers.toLocaleString()} total customers)
                  </span>
                </div>
                <button
                  onClick={() => setTempSelectedSegments([])}
                  className="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSegments.map((segment) => {
              const isSelected = tempSelectedSegments.some(s => s.id === segment.id);

              return (
                <div
                  key={segment.id}
                  onClick={() => handleSegmentToggle(segment)}
                  className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${isSelected
                    ? ''
                    : 'border-gray-100'
                    }`}
                  style={isSelected ? {
                    borderColor: '#10b981', // emerald-500
                    backgroundColor: 'white'
                  } : {
                    backgroundColor: 'white'
                  }}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color.entities.segments}20` }}>
                      <Users className="w-5 h-5" style={{ color: color.entities.segments }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-gray-900">{segment.name}</h4>
                      <p className="text-sm mt-1 line-clamp-2 text-gray-500">{segment.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {segment.customer_count.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
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
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={tempSelectedSegments.length === 0}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tempSelectedSegments.length > 0
                ? 'bg-[#3A5A40] text-white hover:bg-[#2f4a35]'
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
