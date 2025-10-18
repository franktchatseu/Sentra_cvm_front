import { useState, useEffect } from 'react';
import { Plus, Search, Grid, List as ListIcon, FileText, X } from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';
import ListUpload from '../components/ListUpload';

interface SegmentList {
    list_id: number;
    name: string;
    description: string;
    subscriber_count: number;
    created_on: string;
    list_type: 'seed' | 'and' | 'standard';
    tags?: string[];
}

export default function SegmentListPage() {
    const [lists, setLists] = useState<SegmentList[]>([]);
    const [filteredLists, setFilteredLists] = useState<SegmentList[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedList, setSelectedList] = useState<SegmentList | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Mock data - in real app, this would come from API
    const mockLists: SegmentList[] = [
        {
            list_id: 1,
            name: 'High Value Customers',
            description: 'Customers with high lifetime value',
            subscriber_count: 1250,
            created_on: '2024-01-15',
            list_type: 'standard',
            tags: ['premium', 'high-value']
        },
        {
            list_id: 2,
            name: 'Mobile Users',
            description: 'Users who primarily use mobile devices',
            subscriber_count: 3200,
            created_on: '2024-01-20',
            list_type: 'standard',
            tags: ['mobile', 'active']
        },
        {
            list_id: 3,
            name: 'Seed List - VIP',
            description: 'Internal seed list for testing',
            subscriber_count: 50,
            created_on: '2024-01-10',
            list_type: 'seed',
            tags: ['internal', 'test']
        },
        {
            list_id: 4,
            name: 'Churned Customers',
            description: 'Customers who have churned in the last 6 months',
            subscriber_count: 890,
            created_on: '2024-01-25',
            list_type: 'standard',
            tags: ['churned', 'retention']
        },
        {
            list_id: 5,
            name: 'New Subscribers',
            description: 'Recently acquired subscribers',
            subscriber_count: 2100,
            created_on: '2024-02-01',
            list_type: 'standard',
            tags: ['new', 'acquisition']
        }
    ];

    useEffect(() => {
        loadLists();
    }, []);

    useEffect(() => {
        filterLists();
    }, [searchQuery, lists]);

    const loadLists = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            setTimeout(() => {
                setLists(mockLists);
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error loading lists:', error);
            setIsLoading(false);
        }
    };

    const filterLists = () => {
        if (!searchQuery.trim()) {
            setFilteredLists(lists);
            return;
        }

        const filtered = lists.filter(list =>
            list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            list.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            list.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredLists(filtered);
    };

    const handleCreateList = (listData: any) => {
        // For now, just close the modal without creating anything
        // since we don't have a backend endpoint
        console.log('List data received:', listData);
        setShowCreateModal(false);
    };

    const handleEditList = (list: SegmentList) => {
        setSelectedList(list);
        setShowCreateModal(true);
    };

    const handleDeleteList = (listId: number) => {
        setLists(prev => prev.filter(list => list.list_id !== listId));
    };

    const getListTypeColor = (type: string) => {
        switch (type) {
            case 'seed':
                return 'bg-yellow-100 text-yellow-800';
            case 'and':
                return 'bg-blue-100 text-blue-800';
            case 'standard':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Segment Lists</h1>
                    <p className={`text-sm ${tw.textSecondary} mt-1`}>
                        Manage and organize your customer lists for segment building
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                    style={{ backgroundColor: color.sentra.main }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New List
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search lists by name, description, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <ListIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Lists Display */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredLists.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>No lists found</h3>
                    <p className={`text-sm ${tw.textSecondary} mb-4`}>
                        {searchQuery ? 'No lists match your search criteria.' : 'Get started by creating your first list.'}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First List
                        </button>
                    )}
                </div>
            ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {filteredLists.map((list) => (
                        <div
                            key={list.list_id}
                            className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex items-center justify-between' : ''
                                }`}
                        >
                            {viewMode === 'grid' ? (
                                <>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-1`}>
                                                {list.name}
                                            </h3>
                                            <p className={`text-sm ${tw.textSecondary} mb-2`}>
                                                {list.description}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getListTypeColor(list.list_type)}`}>
                                            {list.list_type}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm ${tw.textSecondary}`}>Subscribers</span>
                                            <span className={`font-semibold ${tw.textPrimary}`}>
                                                {formatNumber(list.subscriber_count)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm ${tw.textSecondary}`}>Created</span>
                                            <span className={`text-sm ${tw.textPrimary}`}>
                                                {formatDate(list.created_on)}
                                            </span>
                                        </div>

                                        {list.tags && list.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {list.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleEditList(list)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteList(list.list_id)}
                                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className={`text-lg font-semibold ${tw.textPrimary}`}>
                                                {list.name}
                                            </h3>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getListTypeColor(list.list_type)}`}>
                                                {list.list_type}
                                            </span>
                                        </div>
                                        <p className={`text-sm ${tw.textSecondary} mb-2`}>
                                            {list.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className={`${tw.textSecondary}`}>
                                                {formatNumber(list.subscriber_count)} subscribers
                                            </span>
                                            <span className={`${tw.textSecondary}`}>
                                                Created {formatDate(list.created_on)}
                                            </span>
                                        </div>
                                        {list.tags && list.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {list.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEditList(list)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteList(list.list_id)}
                                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className={`text-xl font-semibold ${tw.textPrimary}`}>
                                    {selectedList ? 'Edit List' : 'Create New List'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setSelectedList(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <ListUpload
                                onListDataChange={handleCreateList}
                                listData={selectedList ? {
                                    list_id: selectedList.list_id,
                                    list_description: selectedList.description,
                                    list_type: selectedList.list_type,
                                    list_label: selectedList.name,
                                    mode: 'existing'
                                } : undefined}
                                hideExistingLists={true}
                                showCreateButton={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}