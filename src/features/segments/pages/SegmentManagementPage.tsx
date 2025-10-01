import { useState, useEffect, useCallback, useRef } from 'react';
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
  Power,
  PowerOff,
  X,
  Eye
} from 'lucide-react';
import { Segment, SegmentFilters, SegmentType, SortDirection } from '../types/segment';
import { segmentService } from '../services/segmentService';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import SegmentModal from '../components/SegmentModal';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import { color, tw } from '../../../shared/utils/utils';

// Mock data for testing
const MOCK_SEGMENT: Segment = {
  id: 1,
  segment_id: 1,
  name: 'High Value Customers',
  description: 'Customers with ARPU > $50 and active for 6+ months',
  type: 'dynamic',
  tags: ['vip', 'high-value', 'premium'],
  customer_count: 15420,
  size_estimate: 15420,
  created_at: '2025-01-15T10:30:00Z',
  created_on: '2025-01-15T10:30:00Z',
  updated_at: '2025-01-18T14:22:00Z',
  updated_on: '2025-01-18T14:22:00Z',
  created_by: 1,
  is_active: true,
  category: 1,
  visibility: 'private',
  refresh_frequency: 'daily'
};

const USE_MOCK_DATA = true; // Toggle this to switch between mock and real data

export default function SegmentManagementPage() {
  const navigate = useNavigate();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<SegmentType | 'all'>('all');
  const [page] = useState(1); // TODO: Implement pagination
  const [pageSize] = useState(20);
  const [sortBy] = useState<'id' | 'name' | 'type' | 'category' | 'created_at' | 'updated_at'>('created_at');
  const [sortDirection] = useState<SortDirection>('DESC');
  // const [totalPages, setTotalPages] = useState(1); // TODO: Use for pagination
  // const [totalCount, setTotalCount] = useState(0); // TODO: Use for pagination display
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const actionMenuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();

  // Calculate dropdown position based on button position
  const calculateDropdownPosition = (buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect();
    const dropdownWidth = 256; // w-64 = 16rem = 256px
    const dropdownHeight = 300; // Approximate height for action menu

    // Position dropdown below button with small gap
    let top = rect.bottom + 8;
    // Align dropdown's right edge with button's right edge for proper alignment
    let left = rect.right - dropdownWidth;

    // Prevent dropdown from going off the left edge of screen
    if (left < 8) left = 8;
    // Prevent dropdown from going off the right edge of screen
    if (left + dropdownWidth > window.innerWidth - 8) {
      left = window.innerWidth - dropdownWidth - 8;
    }

    // If dropdown would go off bottom of screen, show it above the button instead
    if (top + dropdownHeight > window.innerHeight - 8) {
      top = rect.top - dropdownHeight - 8;
    }

    return { top, left };
  };

  const handleActionMenuToggle = (segmentId: number, buttonElement: HTMLElement) => {
    if (showActionMenu === segmentId) {
      setShowActionMenu(null);
      setDropdownPosition(null);
    } else {
      const position = calculateDropdownPosition(buttonElement);
      setDropdownPosition(position);
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
          setDropdownPosition(null);
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
        setTimeout(() => {
          setSegments([MOCK_SEGMENT]);
          // setTotalCount(1);
          // setTotalPages(1);
          setIsLoading(false);
        }, 500); // Simulate API delay
        return;
      }

      // Build filters with all the new options
      const filters: SegmentFilters = {
        page,
        pageSize,
        sortBy,
        sortDirection,
      };

      if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
      if (selectedTags.length > 0) filters.tags = selectedTags;
      if (statusFilter !== 'all') filters.is_active = statusFilter === 'active';
      if (typeFilter !== 'all') filters.type = typeFilter;

      const response = await segmentService.getSegments(filters);

      // Handle both response formats
      const segmentData = response.data || response.segments || [];
      setSegments(segmentData);
      // setTotalCount(response.meta?.total || response.total || 0);
      // setTotalPages(response.meta?.totalPages || 1);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load segments');
      setSegments([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, selectedTags, statusFilter, typeFilter, page, pageSize, sortBy, sortDirection]);

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
    setDropdownPosition(null);
  };

  const handleEditSegment = (segmentId: number) => {
    navigate(`/dashboard/segments/${segmentId}/edit`);
    setShowActionMenu(null);
    setDropdownPosition(null);
  };

  const handleDeleteSegment = async (segment: Segment) => {
    setShowActionMenu(null);
    setDropdownPosition(null);
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

  const handleToggleStatus = async (segment: Segment) => {
    setShowActionMenu(null);
    setDropdownPosition(null);
    const action = segment.is_active ? 'deactivate' : 'activate';
    const confirmed = await confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Segment`,
      message: `Are you sure you want to ${action} "${segment.name}"?`,
      type: segment.is_active ? 'warning' : 'success',
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      const segmentId = segment.segment_id || segment.id!;
      await segmentService.toggleSegmentStatus(segmentId, !segment.is_active);
      await loadSegments();
      success(
        `Segment ${action}d`,
        `Segment "${segment.name}" has been ${action}d successfully`
      );
    } catch (err: unknown) {
      showError(`Error ${action}ing segment`, (err as Error).message || `Failed to ${action} segment`);
    }
  };

  const handleSaveSegment = async (segment: Segment) => {
    await loadSegments();
    success(
      selectedSegment ? 'Segment updated' : 'Segment created',
      `Segment "${segment.name}" has been ${selectedSegment ? 'updated' : 'created'} successfully`
    );
  };

  // Get all unique tags from segments
  const allTags = Array.from(new Set(segments?.flatMap(s => s.tags || []) || []));

  // Status filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const filteredSegments = (segments || []).filter(segment => {
    const matchesSearch = !searchTerm ||
      segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (segment.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => (segment.tags || []).includes(tag));

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && segment.is_active) ||
      (statusFilter === 'inactive' && !segment.is_active);

    return matchesSearch && matchesTags && matchesStatus;
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
              className={`flex items-center px-4 py-2.5 border border-[${color.ui.border}] ${tw.textSecondary} rounded-lg hover:bg-[${color.ui.surface}] transition-colors text-base font-medium`}
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedTags.length > 0 || statusFilter !== 'all' || typeFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className={`text-sm font-medium ${tw.textPrimary} py-2`}>Active filters:</span>
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                Status: {statusFilter === 'active' ? 'Active' : 'Inactive'}
                <button
                  onClick={() => setStatusFilter('all')}
                  className="ml-2 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
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
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead className={`bg-gradient-to-r from-[${color.ui.surface}] to-[${color.ui.surface}]/80 border-b border-[${color.ui.border}]`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Segment</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Type</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Tags</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Customers</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Status</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Created</th>
                    <th className={`px-6 py-3 text-right text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`bg-white divide-y divide-[${color.ui.border}]/50`}>
                  {filteredSegments.map((segment) => (
                    <tr key={segment.segment_id} className={`group hover:bg-[${color.ui.surface}]/30 transition-all duration-300`}>
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
                          {segment.type.charAt(0).toUpperCase() + segment.type.slice(1)}
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
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${segment.is_active ? `bg-[${color.status.success.light}] text-[${color.status.success.main}]` : `bg-[${color.status.error.light}] text-[${color.status.error.main}]`
                          }`}>
                          {segment.is_active ? 'Active' : 'Inactive'}
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
                              onClick={(e) => handleActionMenuToggle(segment.segment_id || segment.id!, e.currentTarget)}
                              className={`group p-3 rounded-xl ${tw.textMuted} hover:bg-[${color.entities.segments}]/10 transition-all duration-300`}
                            >
                              <MoreHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            </button>

                            {showActionMenu === (segment.segment_id || segment.id) && dropdownPosition && (
                              <div
                                className="fixed w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-3"
                                style={{
                                  zIndex: 99999,
                                  top: `${dropdownPosition.top}px`,
                                  left: `${dropdownPosition.left}px`,
                                  maxHeight: '80vh',
                                  overflowY: 'auto'
                                }}
                              >
                                <button
                                  onClick={() => handleToggleStatus(segment)}
                                  className="w-full flex items-center px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                                >
                                  {segment.is_active ? (
                                    <>
                                      <PowerOff className="w-4 h-4 mr-4" style={{ color: color.status.warning.main }} />
                                      Deactivate Segment
                                    </>
                                  ) : (
                                    <>
                                      <Power className="w-4 h-4 mr-4" style={{ color: color.status.success.main }} />
                                      Activate Segment
                                    </>
                                  )}
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

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredSegments.map((segment) => (
                <div key={segment.segment_id} className={`bg-white border border-[${color.ui.border}] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
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
                          onClick={(e) => handleActionMenuToggle(segment.segment_id || segment.id!, e.currentTarget)}
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
                      {segment.type.charAt(0).toUpperCase() + segment.type.slice(1)}
                    </span>
                    {segment.tags?.map(tag => (
                      <span key={tag} className={`inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${segment.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {segment.is_active ? 'Active' : 'Inactive'}
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
      {showAdvancedFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAdvancedFilters(false)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="p-6 border-b border-[${color.ui.border}]">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${tw.textPrimary}`}>Filter Segments</h3>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className={`p-2 ${tw.textMuted} hover:bg-[${color.ui.surface}] rounded-lg transition-colors`}
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
                      onChange={() => setTypeFilter('all')}
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
                      onChange={() => setTypeFilter('dynamic')}
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
                      onChange={() => setTypeFilter('static')}
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
                      onChange={() => setTypeFilter('trigger')}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <span className={`text-sm ${tw.textSecondary}`}>Trigger</span>
                  </label>
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className={`block text-sm font-medium ${tw.textPrimary} mb-3`}>Status</label>
                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={statusFilter === option.value}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${tw.textSecondary}`}>{option.label}</span>
                    </label>
                  ))}
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
                            if (e.target.checked) {
                              setSelectedTags(prev => [...prev, tag]);
                            } else {
                              setSelectedTags(prev => prev.filter(t => t !== tag));
                            }
                          }}
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
                    setStatusFilter('all');
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
        </div>
      )}
    </div>
  );
}
