import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Users,
  Tag,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Copy,
  RefreshCw,
  Download
} from 'lucide-react';
import { Segment, SegmentFilters, SegmentType, SortDirection } from '../types/segment';
import { segmentService } from '../services/segmentService';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import SegmentModal from '../components/SegmentModal';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import { color, tw } from '../../../shared/utils/utils';

// Mock data for testing
const MOCK_SEGMENTS: Segment[] = [
  {
    id: 1,
    segment_id: 1,
    name: 'High Value Customers',
    description: 'Customers with monthly spend > $100',
    type: 'dynamic',
    tags: ['vip', 'high-value', 'premium'],
    customer_count: 15420,
    size_estimate: 15420,
    created_at: '2024-01-15T10:30:00Z',
    created_on: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T14:22:00Z',
    updated_on: '2024-01-15T14:22:00Z',
    created_by: 1,
    is_active: true,
    category: 1,
    visibility: 'private',
    refresh_frequency: 'daily'
  },
  {
    id: 2,
    segment_id: 2,
    name: 'At Risk Customers',
    description: 'Customers showing churn signals',
    type: 'dynamic',
    tags: ['at-risk', 'churn', 'retention'],
    customer_count: 8934,
    size_estimate: 8934,
    created_at: '2024-01-10T09:15:00Z',
    created_on: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-10T11:30:00Z',
    updated_on: '2024-01-10T11:30:00Z',
    created_by: 1,
    is_active: true,
    category: 2,
    visibility: 'private',
    refresh_frequency: 'daily'
  },
  {
    id: 3,
    segment_id: 3,
    name: 'New Subscribers',
    description: 'Customers who joined in the last 30 days',
    type: 'dynamic',
    tags: ['new', 'onboarding', 'recent'],
    customer_count: 3245,
    size_estimate: 3245,
    created_at: '2024-01-20T08:45:00Z',
    created_on: '2024-01-20T08:45:00Z',
    updated_at: '2024-01-20T10:20:00Z',
    updated_on: '2024-01-20T10:20:00Z',
    created_by: 1,
    is_active: true,
    category: 1,
    visibility: 'public',
    refresh_frequency: 'daily'
  },
  {
    id: 4,
    segment_id: 4,
    name: 'Voice Heavy Users',
    description: 'Customers with high voice usage patterns',
    type: 'dynamic',
    tags: ['voice', 'heavy-users', 'communication'],
    customer_count: 12678,
    size_estimate: 12678,
    created_at: '2024-01-12T13:20:00Z',
    created_on: '2024-01-12T13:20:00Z',
    updated_at: '2024-01-12T15:45:00Z',
    updated_on: '2024-01-12T15:45:00Z',
    created_by: 1,
    is_active: true,
    category: 3,
    visibility: 'private',
    refresh_frequency: 'daily'
  },
  {
    id: 5,
    segment_id: 5,
    name: 'Data Bundle Enthusiasts',
    description: 'Customers who frequently purchase data bundles',
    type: 'dynamic',
    tags: ['data', 'bundles', 'heavy-data'],
    customer_count: 18923,
    size_estimate: 18923,
    created_at: '2024-01-08T11:10:00Z',
    created_on: '2024-01-08T11:10:00Z',
    updated_at: '2024-01-08T16:30:00Z',
    updated_on: '2024-01-08T16:30:00Z',
    created_by: 1,
    is_active: true,
    category: 2,
    visibility: 'public',
    refresh_frequency: 'daily'
  },
  {
    id: 6,
    segment_id: 6,
    name: 'Weekend Warriors',
    description: 'Customers with high weekend usage',
    type: 'dynamic',
    tags: ['weekend', 'leisure', 'entertainment'],
    customer_count: 7456,
    size_estimate: 7456,
    created_at: '2024-01-18T14:00:00Z',
    created_on: '2024-01-18T14:00:00Z',
    updated_at: '2024-01-18T16:15:00Z',
    updated_on: '2024-01-18T16:15:00Z',
    created_by: 1,
    is_active: true,
    category: 1,
    visibility: 'private',
    refresh_frequency: 'weekly'
  },
  {
    id: 7,
    segment_id: 7,
    name: 'Business Customers',
    description: 'B2B customers and corporate accounts',
    type: 'static',
    tags: ['business', 'corporate', 'b2b'],
    customer_count: 4321,
    size_estimate: 4321,
    created_at: '2024-01-05T09:30:00Z',
    created_on: '2024-01-05T09:30:00Z',
    updated_at: '2024-01-05T12:45:00Z',
    updated_on: '2024-01-05T12:45:00Z',
    created_by: 1,
    is_active: true,
    category: 3,
    visibility: 'private',
    refresh_frequency: 'monthly'
  },
  {
    id: 8,
    segment_id: 8,
    name: 'Dormant Users',
    description: 'Customers with no activity in 60+ days',
    type: 'dynamic',
    tags: ['dormant', 'inactive', 're-engagement'],
    customer_count: 5678,
    size_estimate: 5678,
    created_at: '2024-01-14T10:15:00Z',
    created_on: '2024-01-14T10:15:00Z',
    updated_at: '2024-01-14T13:20:00Z',
    updated_on: '2024-01-14T13:20:00Z',
    created_by: 1,
    is_active: false,
    category: 2,
    visibility: 'private',
    refresh_frequency: 'daily'
  }
];

const USE_MOCK_DATA = false; // Toggle this to switch between mock and real data

export default function SegmentManagementPage() {
  const navigate = useNavigate();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [allSegments, setAllSegments] = useState<Segment[]>([]); // Store all segments for tag calculation
  const [isLoading, setIsLoading] = useState(true);
  const [duplicatingSegment, setDuplicatingSegment] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<SegmentType | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy] = useState<'id' | 'name' | 'type' | 'category' | 'created_at' | 'updated_at'>('created_at');
  const [sortDirection] = useState<SortDirection>('DESC');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const actionMenuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();


  const handleActionMenuToggle = (segmentId: number) => {
    if (showActionMenu === segmentId) {
      setShowActionMenu(null);
    } else {
      setShowActionMenu(segmentId);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionMenu !== null) {
        const target = event.target as HTMLElement;
        const isInsideMenu = Object.values(actionMenuRefs.current).some(
          (ref) => ref?.contains(target)
        );
        if (!isInsideMenu) {
          setShowActionMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionMenu]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadSegments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');


      if (USE_MOCK_DATA) {
        // Use mock data for testing
        console.log('🚀 LOADING SEGMENTS - Using mock data');
        setSegments(MOCK_SEGMENTS);
        setTotalCount(MOCK_SEGMENTS.length);
        setTotalPages(Math.ceil(MOCK_SEGMENTS.length / pageSize));
        setIsLoading(false);
        return;
      }

      // Use client-side tag filtering (search endpoint has issues)

      const filters: SegmentFilters = {
        page,
        pageSize,
        sortBy,
        sortDirection,
        skipCache: true, // Always skip cache to get fresh data
      };

      if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
      if (typeFilter !== 'all') filters.type = typeFilter;

      const response = await segmentService.getSegments(filters);

      // Handle both response formats
      let segmentData = response.data || response.segments || [];

      // Apply client-side tag filtering if tags are selected
      if (selectedTags.length > 0) {
        segmentData = segmentData.filter(segment =>
          selectedTags.some(tag => (segment.tags || []).includes(tag))
        );
      }
      setSegments(segmentData);
      // Update allSegments for tag calculation
      setAllSegments(segmentData);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load segments');
      setSegments([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, selectedTags, typeFilter, page, pageSize, sortBy, sortDirection]);

  useEffect(() => {
    loadSegments();
  }, [loadSegments]);

  const handleSearch = () => {
    loadSegments();
  };

  const handleCreateSegment = () => {
    setSelectedSegment(null);
    setIsModalOpen(true);
  };

  const handleViewSegment = (segmentId: number) => {
    navigate(`/dashboard/segments/${segmentId}`);
    setShowActionMenu(null);
  };

  const handleEditSegment = (segmentId: number) => {
    const segment = segments.find(s => (s.segment_id || s.id) === segmentId);
    if (segment) {
      setSelectedSegment(segment);
      setIsModalOpen(true);
    }
    setShowActionMenu(null);
  };

  const handleDeleteSegment = async (segment: Segment) => {
    setShowActionMenu(null);
    const confirmed = await confirm({
      title: 'Delete Segment',
      message: `Are you sure you want to delete "${segment.name}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      const segmentId = segment.segment_id || segment.id!;
      await segmentService.deleteSegment(segmentId);
      await loadSegments();
      success('Segment deleted', `Segment "${segment.name}" has been deleted successfully`);
    } catch (err: unknown) {
      showError('Error deleting segment', (err as Error).message || 'Failed to delete segment');
    }
  };

  const handleDuplicateSegment = async (segment: Segment) => {
    setShowActionMenu(null);
    const confirmed = await confirm({
      title: 'Duplicate Segment',
      message: `Create a copy of "${segment.name}"?`,
      type: 'info',
      confirmText: 'Duplicate',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    const segmentId = segment.segment_id || segment.id!;
    const newName = `${segment.name} (Copy)`;

    try {
      setDuplicatingSegment(segmentId);

      await segmentService.duplicateSegment(segmentId, { new_name: newName });
      // Small delay to ensure backend has processed the duplicate
      await new Promise(resolve => setTimeout(resolve, 500));
      // Force refresh with cache-busting
      setSegments([]); // Clear current segments first
      await loadSegments();

      // Success: show toast and close modal
      success('Segment duplicated', `Segment "${newName}" has been created successfully`);
    } catch (err: unknown) {
      showError('Error duplicating segment', (err as Error).message || 'Failed to duplicate segment');
    } finally {
      setDuplicatingSegment(null);
    }
  };


  const handleSaveSegment = async (segment: Segment) => {
    await loadSegments();
    success(
      selectedSegment ? 'Segment updated' : 'Segment created',
      `Segment "${segment.name}" has been ${selectedSegment ? 'updated' : 'created'} successfully`
    );
  };

  const handleComputeSegment = async (segment: Segment) => {
    setShowActionMenu(null);
    const confirmed = await confirm({
      title: 'Compute Segment',
      message: `Do you want to compute the segment "${segment.name}"? This will refresh the member list.`,
      type: 'info',
      confirmText: 'Compute',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      const segmentId = segment.segment_id || segment.id!;
      await segmentService.computeSegment(segmentId);
      success('Segment computed', `Segment "${segment.name}" has been computed successfully`);
    } catch (err: unknown) {
      showError('Compute failed', (err as Error).message || 'Failed to compute segment');
    }
  };

  const handleExportSegment = async (segment: Segment) => {
    setShowActionMenu(null);
    try {
      const segmentId = segment.segment_id || segment.id!;
      const blob = await segmentService.exportSegment(segmentId, 'json');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${segment.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_segment.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success('Export successful', `Segment data has been exported as JSON`);
    } catch (err: unknown) {
      showError('Export failed', (err as Error).message || 'Failed to export segment');
    }
  };

  // Get all unique tags from all segments (not just filtered ones)
  const allTags = Array.from(new Set(allSegments?.flatMap(s => s.tags || []) || []));


  const filteredSegments = (segments || []).filter(segment => {
    const matchesSearch = !searchTerm ||
      segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (segment.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => (segment.tags || []).includes(tag));


    return matchesSearch && matchesTags;
  });

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className={``}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Segment Management</h1>
            <p className={`${tw.textSecondary} mt-2 text-sm`}>Create and manage customer segments</p>
          </div>
          <button
            onClick={handleCreateSegment}
            className="inline-flex items-center px-4 py-2 font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 text-sm whitespace-nowrap text-white"
            style={{ backgroundColor: color.sentra.main }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Segment
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={``}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-[${color.ui.text.muted}] w-5 h-5`} />
            <input
              type="text"
              placeholder="Search segments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className={`w-full pl-10 pr-4 py-3 border border-[${color.ui.border}] rounded-lg focus:outline-none transition-all duration-200 bg-white focus:ring-2 focus:ring-[${color.sentra.main}]/20`}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowAdvancedFilters(true)}
              className={`flex items-center px-4 py-2.5 border border-[${color.ui.border}] ${tw.textSecondary} rounded-lg hover:bg-gray-50 transition-colors text-base font-medium`}
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedTags.length > 0 || typeFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className={`text-sm font-medium ${tw.textPrimary} py-2`}>Active filters:</span>
            {typeFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                Type: {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                <button
                  onClick={() => setTypeFilter('all')}
                  className="ml-2 hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedTags.map(tag => (
              <span key={tag} className="inline-flex items-center px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-full border border-green-200">
                {tag}
                <button
                  onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                  className="ml-2 hover:text-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}]`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner variant="modern" size="xl" color="primary" className="mb-4" />
            <p className={`${tw.textMuted} font-medium text-sm`}>Loading segments...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <p className={`text-[${color.status.error.main}] font-medium mb-3 text-sm`}>{error}</p>
              <button
                onClick={loadSegments}
                className={`bg-[${color.status.error.main}] text-green-700 px-4 py-2 rounded-lg hover:bg-[${color.status.error.dark}] transition-colors font-medium text-sm`}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredSegments.length === 0 ? (
          <div className="p-8 md:p-16 text-center">
            <div className={`bg-gradient-to-br from-[${color.entities.segments}]/5 to-[${color.entities.segments}]/10 rounded-xl p-6 md:p-12`}>
              <div className={`bg-gradient-to-r from-[${color.entities.segments}] to-[${color.entities.segments}]/80 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center mx-auto mb-6`}>
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className={`text-xl font-bold ${tw.textPrimary} mb-3`}>No segments found</h3>
              <p className={`${tw.textSecondary} mb-8 text-sm max-w-md mx-auto`}>
                {searchTerm || selectedTags.length > 0 ? 'No segments match your search criteria.' : 'No segments have been created yet.'}
              </p>
              {!searchTerm && selectedTags.length === 0 && (
                <button
                  onClick={handleCreateSegment}
                  className="inline-flex items-center px-6 py-3 text-white rounded-xl transition-colors font-semibold text-sm"
                  style={{ backgroundColor: color.sentra.main }}
                  onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Segment
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="">
                <table className="min-w-full">
                  <thead className={`bg-gradient-to-r from-gray-50 to-gray-50/80 border-b border-[${color.ui.border}]`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Segment</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Type</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Tags</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Customers</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Visibility</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Created</th>
                      <th className={`px-6 py-3 text-right text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`bg-white divide-y divide-[${color.ui.border}]/50`}>
                    {filteredSegments.map((segment) => (
                      <tr key={segment.segment_id || segment.id} className={`group hover:bg-gray-50/30 transition-all duration-300`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <div className={`relative flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0`} style={{ background: `${color.entities.segments}` }}>
                              <Users className={`w-5 h-5 text-white`} />
                            </div>
                            <div>
                              <div className={`text-base font-semibold ${tw.textPrimary} group-hover:text-[${color.entities.segments}] transition-colors`}>
                                {segment.name}
                              </div>
                              <div className={`text-sm ${tw.textSecondary} mt-1`}>{segment.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${segment.type === 'dynamic' ? 'bg-purple-100 text-purple-700' :
                            segment.type === 'static' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                            {segment.type ? segment.type.charAt(0).toUpperCase() + segment.type.slice(1) : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {segment.tags?.map(tag => (
                              <span key={tag} className={`inline-flex items-center px-2 py-1 bg-[${color.entities.segments}]/10 text-[${color.entities.segments}] text-sm font-medium rounded-full`}>
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Users className={`w-4 h-4 text-[${color.entities.segments}] flex-shrink-0`} />
                            <span className={`text-sm ${tw.textPrimary}`}>
                              {segment.customer_count?.toLocaleString() || '0'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${segment.visibility === 'public' ? `bg-[${color.status.success.light}] text-[${color.status.success.main}]` : `bg-[${color.status.info.light}] text-[${color.status.info.main}]`
                            }`}>
                            {segment.visibility === 'public' ? 'Public' : 'Private'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`text-sm ${tw.textPrimary} font-medium`}>
                              {new Date(segment.created_on || segment.created_at!).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewSegment(segment.segment_id || segment.id!)}
                              className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-[${color.entities.segments}]/10 transition-all duration-300`}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            </button>
                            <button
                              onClick={() => handleEditSegment(segment.segment_id || segment.id!)}
                              className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-green-800 transition-all duration-300`}
                              style={{ backgroundColor: 'transparent' }}
                              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            </button>
                            <div className="relative" ref={(el) => { actionMenuRefs.current[String(segment.segment_id || segment.id!)] = el; }}>
                              <button
                                onClick={() => handleActionMenuToggle(segment.segment_id || segment.id!)}
                                className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-[${color.entities.segments}]/10 transition-all duration-300`}
                              >
                                <MoreHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                              </button>

                              {showActionMenu === (segment.segment_id || segment.id) && (
                                <div
                                  className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-3 z-50"
                                  style={{
                                    maxHeight: '80vh',
                                    overflowY: 'auto'
                                  }}
                                >

                                  <button
                                    onClick={() => handleDuplicateSegment(segment)}
                                    disabled={duplicatingSegment === (segment.segment_id || segment.id)}
                                    className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {duplicatingSegment === (segment.segment_id || segment.id) ? (
                                      <>
                                        <div className="w-4 h-4 mr-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                        Duplicating...
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-4 h-4 mr-4" style={{ color: color.sentra.main }} />
                                        Duplicate Segment
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleComputeSegment(segment)}
                                    className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                                  >
                                    <RefreshCw className="w-4 h-4 mr-4" />
                                    Compute Segment
                                  </button>

                                  <button
                                    onClick={() => handleExportSegment(segment)}
                                    className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                                  >
                                    <Download className="w-4 h-4 mr-4" />
                                    Export Segment
                                  </button>

                                  <div className="border-t border-gray-200 my-1"></div>

                                  <button
                                    onClick={() => handleDeleteSegment(segment)}
                                    className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 mr-4" style={{ color: color.status.error.main }} />
                                    Delete Segment
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredSegments.map((segment) => (
                <div key={segment.segment_id || segment.id} className={`bg-white border border-[${color.ui.border}] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-base font-semibold text-gray-900 mb-1">
                        {segment.name}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">{segment.description}</div>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleViewSegment(segment.segment_id || segment.id!)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditSegment(segment.segment_id || segment.id!)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <div className="relative" ref={(el) => { actionMenuRefs.current[`mobile-${segment.segment_id || segment.id!}`] = el; }}>
                        <button
                          onClick={() => handleActionMenuToggle(segment.segment_id || segment.id!)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${segment.type === 'dynamic' ? 'bg-purple-100 text-purple-700' :
                      segment.type === 'static' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                      {segment.type ? segment.type.charAt(0).toUpperCase() + segment.type.slice(1) : 'N/A'}
                    </span>
                    {segment.tags?.map(tag => (
                      <span key={tag} className={`inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${segment.visibility === 'public' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {segment.visibility === 'public' ? 'Public' : 'Private'}
                    </span>
                  </div>

                  <div className={`flex justify-between items-center text-sm ${tw.textSecondary}`}>
                    <div className="flex items-center">
                      <Users className={`w-3 h-3 mr-1 text-[${color.entities.segments}]`} />
                      {segment.customer_count?.toLocaleString() || '0'} customers
                    </div>
                    <div>
                      Created: {new Date(segment.created_on || segment.created_at!).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && filteredSegments.length > 0 && (
        <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] px-4 sm:px-6 py-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className={`text-base ${tw.textSecondary} text-center sm:text-left`}>
              Showing {((page - 1) * pageSize) + 1} to{' '}
              {Math.min(page * pageSize, totalCount)} of {totalCount} segments
            </div>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className={`p-2 border border-[${color.ui.border}] rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-base whitespace-nowrap`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className={`text-base ${tw.textSecondary} px-2`}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className={`p-2 border border-[${color.ui.border}] rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-base whitespace-nowrap`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Segment Modal */}
      <SegmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSegment(null);
        }}
        onSave={handleSaveSegment}
        segment={selectedSegment}
      />

      {/* Advanced Filters Side Modal */}
      {showAdvancedFilters && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAdvancedFilters(false)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="p-6 border-b border-[${color.ui.border}]">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${tw.textPrimary}`}>Filter Segments</h3>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className={`p-2 ${tw.textMuted} hover:bg-gray-50 rounded-lg transition-colors`}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Type Filter */}
              <div>
                <label className={`block text-sm font-medium ${tw.textPrimary} mb-3`}>Segment Type</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="all"
                      checked={typeFilter === 'all'}
                      onChange={(e) => {
                        e.stopPropagation();
                        setTypeFilter('all');
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <span className={`text-sm ${tw.textSecondary}`}>All Types</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="dynamic"
                      checked={typeFilter === 'dynamic'}
                      onChange={(e) => {
                        e.stopPropagation();
                        setTypeFilter('dynamic');
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <span className={`text-sm ${tw.textSecondary}`}>Dynamic</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="static"
                      checked={typeFilter === 'static'}
                      onChange={(e) => {
                        e.stopPropagation();
                        setTypeFilter('static');
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <span className={`text-sm ${tw.textSecondary}`}>Static</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="trigger"
                      checked={typeFilter === 'trigger'}
                      onChange={(e) => {
                        e.stopPropagation();
                        setTypeFilter('trigger');
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <span className={`text-sm ${tw.textSecondary}`}>Trigger</span>
                  </label>
                </div>
              </div>


              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div>
                  <label className={`block text-sm font-medium ${tw.textPrimary} mb-3`}>Tags</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allTags.map(tag => (
                      <label key={tag} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            if (e.target.checked) {
                              setSelectedTags(prev => [...prev, tag]);
                            } else {
                              setSelectedTags(prev => prev.filter(t => t !== tag));
                            }
                          }}
                          onClick={(e) => e.stopPropagation()} // Prevent event bubbling
                          className="mr-3 text-[${color.sentra.main}] focus:ring-[${color.sentra.main}]"
                        />
                        <span className={`text-sm ${tw.textSecondary}`}>{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setTypeFilter('all');
                    setSelectedTags([]);
                  }}
                  className={`flex-1 px-4 py-2 text-sm border border-gray-300 ${tw.textSecondary} rounded-lg hover:bg-gray-50 transition-colors`}
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    handleSearch();
                    setShowAdvancedFilters(false);
                  }}
                  className={`flex-1 px-4 py-2 text-sm text-white rounded-lg transition-colors`}
                  style={{ backgroundColor: color.sentra.main }}
                  onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
