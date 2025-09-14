import { useState, useEffect } from 'react';
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
import { Segment, SegmentFilters } from '../../types/segment';
import { segmentService } from '../../services/segmentService';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import SegmentModal from '../modals/SegmentModal';

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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const filters: SegmentFilters = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedTags.length > 0) filters.tags = selectedTags;
      if (statusFilter !== 'all') filters.is_active = statusFilter === 'active';

      const response = await segmentService.getSegments(filters);
      setSegments(response.segments);
    } catch (err: any) {
      setError(err.message || 'Failed to load segments');
    } finally {
      setIsLoading(false);
    }
  };

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
    } catch (err: any) {
      showError('Error deleting segment', err.message || 'Failed to delete segment');
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
    } catch (err: any) {
      showError(`Error ${action}ing segment`, err.message || `Failed to ${action} segment`);
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
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Segment Management</h1>
            <p className="text-gray-600 text-sm md:text-lg">Create and manage customer segments</p>
          </div>
          <button 
            onClick={handleCreateSegment}
            className="group flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-4 md:px-6 py-3 rounded-xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-semibold">Create Segment</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search segments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 py-2">Filter by tags:</span>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTags(prev => 
                    prev.includes(tag) 
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading segments...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-red-700 font-medium mb-3">{error}</p>
              <button
                onClick={loadSegments}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredSegments.length === 0 ? (
          <div className="p-8 md:p-16 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-12">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No segments found</h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                {searchTerm || selectedTags.length > 0 ? 'No segments match your search criteria.' : 'No segments have been created yet.'}
              </p>
              {!searchTerm && selectedTags.length === 0 && (
                <button
                  onClick={handleCreateSegment}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
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
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Segment</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Tags</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Customers</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Created</th>
                    <th className="px-8 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredSegments.map((segment) => (
                    <tr key={segment.segment_id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                      <td className="px-8 py-6">
                        <div>
                          <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                            {segment.name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{segment.description}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-1">
                          {segment.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {segment.customer_count?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          segment.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {segment.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm text-gray-900 font-medium">
                          {new Date(segment.created_on).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
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
                <div key={segment.segment_id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
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
                      <span key={tag} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      segment.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {segment.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
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
    </div>
  );
}
