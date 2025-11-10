import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Search,
  FileText,
  Download,
  Trash2,
  Eye,
  Filter,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import { quicklistService } from '../services/quicklistService';
import { QuickList, UploadType } from '../types/quicklist';
import CreateQuickListModal from '../components/CreateQuickListModal';
import QuickListDetailsModal from '../components/QuickListDetailsModal';
import CreateCommunicationModal from '../../communications/components/CreateCommunicationModal';

export default function QuickListsPage() {
  const navigate = useNavigate();
  const { success: showToast, error: showError } = useToast();
  const { confirm } = useConfirm();

  const [quicklists, setQuicklists] = useState<QuickList[]>([]);
  const [uploadTypes, setUploadTypes] = useState<UploadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUploadType, setSelectedUploadType] = useState<string>('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQuickList, setSelectedQuickList] = useState<QuickList | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCommunicateModalOpen, setIsCommunicateModalOpen] = useState(false);
  const [communicateQuickList, setCommunicateQuickList] = useState<QuickList | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadQuickLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedUploadType]);

  const loadInitialData = async () => {
    try {
      const [quicklistsRes, uploadTypesRes] = await Promise.all([
        quicklistService.getAllQuickLists({ limit: 100 }),
        quicklistService.getUploadTypes({ activeOnly: true }),
      ]);
      setQuicklists(quicklistsRes.data || []);
      setUploadTypes(uploadTypesRes.data || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      showError('Failed to load QuickLists');
    } finally {
      setLoading(false);
    }
  };

  const loadQuickLists = async () => {
    try {
      setLoading(true);
      let response;
      if (searchTerm) {
        response = await quicklistService.searchQuickLists({
          q: searchTerm,
          upload_type: selectedUploadType || undefined,
          limit: 100,
        });
      } else {
        response = await quicklistService.getAllQuickLists({
          upload_type: selectedUploadType || undefined,
          limit: 100,
        });
      }
      
      // Enrich quicklists with full details to get row_count and file_size
      const enrichedQuicklists = await Promise.all(
        (response.data || []).map(async (ql) => {
          try {
            const detailsResponse = await quicklistService.getQuickListById(ql.id, true);
            return detailsResponse.data;
          } catch (err) {
            console.error(`Failed to load details for quicklist ${ql.id}:`, err);
            return ql; // Fallback to original data
          }
        })
      );
      
      setQuicklists(enrichedQuicklists);
    } catch (err) {
      console.error('Failed to load quicklists:', err);
      showError('Failed to load QuickLists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuickList = async (file: File, uploadType: string, name: string, description?: string) => {
    try {
      const request = {
        file,
        upload_type: uploadType,
        name,
        description,
        created_by: 'user@example.com', // TODO: Get from auth context
      };

      const response = await quicklistService.createQuickList(request);
      showToast('QuickList created successfully!');
      setIsCreateModalOpen(false);
      
      // Wait a bit for backend processing, then reload
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadQuickLists();
      
      // Open the details modal with the newly created QuickList
      if (response.data) {
        // Fetch the complete QuickList with all details
        try {
          const detailsResponse = await quicklistService.getQuickListById(response.data.id, true);
          setSelectedQuickList(detailsResponse.data);
          setIsDetailsModalOpen(true);
        } catch (detailsErr) {
          console.error('Failed to load quicklist details:', detailsErr);
        }
      }
    } catch (err) {
      console.error('Failed to create quicklist:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create QuickList';
      showError(errorMessage);
    }
  };

  const handleViewDetails = (quicklist: QuickList) => {
    setSelectedQuickList(quicklist);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (quicklist: QuickList) => {
    const confirmed = await confirm({
      title: 'Delete QuickList',
      message: `Are you sure you want to delete "${quicklist.name}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      await quicklistService.deleteQuickList(quicklist.id);
      showToast(`QuickList "${quicklist.name}" deleted successfully!`);
      await loadQuickLists();
    } catch (err) {
      console.error('Failed to delete quicklist:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete QuickList';
      showError(errorMessage);
    }
  };

  const handleExport = async (quicklist: QuickList, format: 'csv' | 'json') => {
    try {
      const blob = await quicklistService.exportQuickList(quicklist.id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quicklist.name}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast(`QuickList exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Failed to export quicklist:', err);
      showError('Failed to export QuickList');
    }
  };

  const handleCommunicate = (quicklist: QuickList) => {
    setCommunicateQuickList(quicklist);
    setIsCommunicateModalOpen(true);
  };

  const filteredQuicklists = quicklists;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>QuickLists</h1>
            <p className={`${tw.textSecondary} mt-2 text-sm`}>
              Upload and manage customer data lists for quick communication
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm text-white"
          style={{ backgroundColor: color.primary.action }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = color.interactive.hover;
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = color.primary.action;
          }}
        >
          <Upload className="w-4 h-4" />
          Upload QuickList
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quicklists by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Upload Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedUploadType}
              onChange={(e) => setSelectedUploadType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">All Upload Types</option>
              {uploadTypes.map((type) => (
                <option key={type.upload_type} value={type.upload_type}>
                  {type.upload_type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* QuickLists Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner variant="modern" size="lg" color="primary" className="mr-3" />
            <span className={`${tw.textSecondary}`}>Loading quicklists...</span>
          </div>
        ) : filteredQuicklists.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className={`${tw.textMuted} mb-6`}>
              {searchTerm
                ? 'No quicklists match your search.'
                : 'No quicklists yet. Upload your first list to get started.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto text-sm text-white"
                style={{ backgroundColor: color.primary.action }}
              >
                <Upload className="w-4 h-4" />
                Upload QuickList
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Upload Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Rows
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    File Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredQuicklists.map((quicklist, index) => (
                  <tr 
                    key={quicklist.id} 
                    className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{quicklist.name}</div>
                        {quicklist.description && (
                          <div className="text-xs text-gray-500 mt-1">{quicklist.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {quicklist.upload_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {quicklist.row_count != null ? quicklist.row_count.toLocaleString() : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {quicklist.file_size != null ? formatFileSize(quicklist.file_size) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(quicklist.created_at)}</div>
                      <div className="text-xs text-gray-500">{quicklist.created_by}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleCommunicate(quicklist)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                          title="Send Communication"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewDetails(quicklist)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExport(quicklist, 'csv')}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Export"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(quicklist)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateQuickListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateQuickList}
        uploadTypes={uploadTypes}
      />

      {selectedQuickList && (
        <QuickListDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedQuickList(null);
          }}
          quicklist={selectedQuickList}
          onExport={handleExport}
          onCommunicate={(ql) => {
            setIsDetailsModalOpen(false);
            handleCommunicate(ql);
          }}
        />
      )}

      {communicateQuickList && (
        <CreateCommunicationModal
          isOpen={isCommunicateModalOpen}
          onClose={() => {
            setIsCommunicateModalOpen(false);
            setCommunicateQuickList(null);
          }}
          quicklist={communicateQuickList}
          onSuccess={(result) => {
            showToast(`Communication sent successfully! ${result.total_messages_sent} messages sent.`);
            setIsCommunicateModalOpen(false);
            setCommunicateQuickList(null);
          }}
        />
      )}
    </div>
  );
}
