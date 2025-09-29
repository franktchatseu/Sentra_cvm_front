import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Filter,
  Users,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  PowerOff
} from 'lucide-react';
import { Segment, SegmentFilters } from '../../../../shared/types/segment';
import { segmentService } from '../services/segmentService';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import SegmentModal from '../components/SegmentModal';
import LoadingSpinner from '../../../shared/componen../../../shared/components/ui/LoadingSpinner';
import { color, tw } from '../../../shared/utils/utils';

interface SegmentActionsDropdownProps {
  segment: Segment;
  onEdit: (segment: Segment) => void;
  onDelete: (segment: Segment) => void;
  onToggleStatus: (segment: Segment) => void;
}

function SegmentActionsDropdown({ segment, onEdit, onDelete, onToggleStatus }: SegmentActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            <button
              onClick={() => {
                onEdit(segment);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Edit className="w-4 h-4 mr-3" />
              Edit Segment
            </button>
            <button
              onClick={() => {
                onToggleStatus(segment);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              {segment.is_active ? (
                <>
                  <PowerOff className="w-4 h-4 mr-3" />
                  Deactivate
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-3" />
                  Activate
                </>
              )}
            </button>
            <button
              onClick={() => {
                onDelete(segment);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Delete Segment
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function SegmentManagementPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();

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

      const filters: SegmentFilters = {};
      if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
      if (selectedTags.length > 0) filters.tags = selectedTags;
      if (statusFilter !== 'all') filters.is_active = statusFilter === 'active';

      const response = await segmentService.getSegments(filters);
      setSegments(response.segments);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load segments');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, selectedTags, statusFilter]);

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

  const handleEditSegment = (segment: Segment) => {
    setSelectedSegment(segment);
    setIsModalOpen(true);
  };

  const handleDeleteSegment = async (segment: Segment) => {
    const confirmed = await confirm({
      title: 'Delete Segment',
      message: `Are you sure you want to delete "${segment.name}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await segmentService.deleteSegment(segment.segment_id);
      await loadSegments();
      success('Segment deleted', `Segment "${segment.name}" has been deleted successfully`);
    } catch (err: unknown) {
      showError('Error deleting segment', (err as Error).message || 'Failed to delete segment');
    }
  };

  const handleToggleStatus = async (segment: Segment) => {
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
      await segmentService.toggleSegmentStatus(segment.segment_id, !segment.is_active);
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
      segment.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => segment.tags.includes(tag));

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
        {(selectedTags.length > 0 || statusFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[${color.ui.border}]/30">
            <span className={`text-sm font-medium ${tw.textPrimary} py-2`}>Active filters:</span>
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1.5 text-sm bg-[${color.sentra.main}]/10 text-[${color.sentra.main}] rounded-full border border-[${color.sentra.main}]/20">
                Status: {statusFilter === 'active' ? 'Active' : 'Inactive'}
                <button
                  onClick={() => setStatusFilter('all')}
                  className="ml-2 text-[${color.sentra.main}] hover:text-[${color.sentra.hover}]"
                >
                  ×
                </button>
              </span>
            )}
            {selectedTags.map(tag => (
              <span key={tag} className="inline-flex items-center px-3 py-1.5 text-sm bg-[${color.sentra.main}]/10 text-[${color.sentra.main}] rounded-full border border-[${color.sentra.main}]/20">
                {tag}
                <button
                  onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                  className="ml-2 text-[${color.sentra.main}] hover:text-[${color.sentra.hover}]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] overflow-hidden`}>
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
            <div className="hidden lg:block overflow-hidden">
              <table className="min-w-full">
                <thead className={`bg-gradient-to-r from-[${color.ui.surface}] to-[${color.ui.surface}]/80 border-b border-[${color.ui.border}]`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>Segment</th>
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
                        <div className="flex flex-wrap gap-1">
                          {segment.tags.map(tag => (
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
                            {new Date(segment.created_on).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <SegmentActionsDropdown
                          segment={segment}
                          onEdit={handleEditSegment}
                          onDelete={handleDeleteSegment}
                          onToggleStatus={handleToggleStatus}
                        />
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
                    <SegmentActionsDropdown
                      segment={segment}
                      onEdit={handleEditSegment}
                      onDelete={handleDeleteSegment}
                      onToggleStatus={handleToggleStatus}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {segment.tags.map(tag => (
                      <span key={tag} className={`inline-flex items-center px-2 py-1 bg-[${color.entities.segments}]/10 text-[${color.entities.segments}] text-sm font-medium rounded-full`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${segment.is_active ? `bg-[${color.status.success.light}] text-[${color.status.success.main}]` : `bg-[${color.status.error.light}] text-[${color.status.error.main}]`
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
                      Created: {new Date(segment.created_on).toLocaleDateString('en-US', {
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

            <div className="p-6 space-y-6">
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
                        className="mr-3 text-[${color.sentra.main}] focus:ring-[${color.sentra.main}]"
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
              <div className="flex space-x-3 pt-4 border-t border-[${color.ui.border}]">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSelectedTags([]);
                  }}
                  className={`flex-1 px-4 py-2 text-sm border border-[${color.ui.border}] ${tw.textSecondary} rounded-lg hover:bg-[${color.ui.surface}] transition-colors`}
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
