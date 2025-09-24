import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Tag, ArrowLeft } from 'lucide-react';
import { color, tw } from '../../design/utils';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useToast } from '../../contexts/ToastContext';

interface OfferType {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function OfferTypesPage() {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { success, error: showError } = useToast();

  const [offerTypes, setOfferTypes] = useState<OfferType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingType, setEditingType] = useState<OfferType | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockOfferTypes: OfferType[] = [
      {
        id: 1,
        name: 'Discount Offers',
        description: 'Percentage or fixed amount discounts on products or services',
        isActive: true,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'Cashback Offers',
        description: 'Money back rewards for purchases',
        isActive: true,
        createdAt: '2024-01-16',
        updatedAt: '2024-01-16'
      },
      {
        id: 3,
        name: 'Loyalty Points',
        description: 'Points-based reward system for customer retention',
        isActive: true,
        createdAt: '2024-01-17',
        updatedAt: '2024-01-17'
      },
      {
        id: 4,
        name: 'Bundle Offers',
        description: 'Combined product or service packages at special prices',
        isActive: false,
        createdAt: '2024-01-18',
        updatedAt: '2024-01-18'
      },
      {
        id: 5,
        name: 'Referral Rewards',
        description: 'Incentives for referring new customers',
        isActive: true,
        createdAt: '2024-01-19',
        updatedAt: '2024-01-19'
      }
    ];

    setTimeout(() => {
      setOfferTypes(mockOfferTypes);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredOfferTypes = offerTypes.filter(offerType => {
    const matchesSearch = offerType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (offerType.description && offerType.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const handleCreateOfferType = async () => {
    if (!newTypeName.trim()) return;

    try {
      setIsCreating(true);
      const newType: OfferType = {
        id: Date.now(),
        name: newTypeName.trim(),
        description: newTypeDescription.trim() || undefined,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };

      setOfferTypes(prev => [...prev, newType]);
      success('Offer Type Created', `"${newTypeName}" has been created successfully.`);
      setShowCreateModal(false);
      setNewTypeName('');
      setNewTypeDescription('');
    } catch (err) {
      console.error('Failed to create offer type:', err);
      showError('Error', err instanceof Error ? err.message : 'Failed to create offer type');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditOfferType = (offerType: OfferType) => {
    setEditingType(offerType);
    setEditName(offerType.name);
    setEditDescription(offerType.description || '');
  };

  const handleUpdateOfferType = async () => {
    if (!editingType || !editName.trim()) return;

    try {
      setIsUpdating(true);
      setOfferTypes(prev => prev.map(type =>
        type.id === editingType.id
          ? { ...type, name: editName.trim(), description: editDescription.trim() || undefined }
          : type
      ));

      success('Offer Type Updated', `"${editName}" has been updated successfully.`);
      setEditingType(null);
      setEditName('');
      setEditDescription('');
    } catch (err) {
      console.error('Failed to update offer type:', err);
      showError('Error', err instanceof Error ? err.message : 'Failed to update offer type');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOfferType = async (offerType: OfferType) => {
    const confirmed = await confirm({
      title: 'Delete Offer Type',
      message: `Are you sure you want to delete "${offerType.name}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      setOfferTypes(prev => prev.filter(type => type.id !== offerType.id));
      success('Offer Type Deleted', `"${offerType.name}" has been deleted successfully.`);
    } catch (err) {
      console.error('Failed to delete offer type:', err);
      showError('Error', err instanceof Error ? err.message : 'Failed to delete offer type');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-[${color.sentra.main}]`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/offers')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Offer Types</h1>
            <p className={`${tw.textSecondary} mt-2 text-sm`}>Manage different types of offers available in your system</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm text-white"
            style={{ backgroundColor: color.sentra.main }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
            }}
          >
            <Plus className="w-4 h-4" />
            Create Offer Type
          </button>
        </div>
      </div>

      {/* Search */}
      <div className={`bg-white my-5`}>
        <div className="relative w-full">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${color.ui.text.muted}]`} />
          <input
            type="text"
            placeholder="Search offer types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 text-sm border border-[${color.ui.border}] rounded-lg focus:outline-none`}
          />
        </div>
      </div>

      {/* Offer Types Table */}
      <div className={`bg-white rounded-xl border border-[${color.ui.border}] overflow-hidden`}>
        {filteredOfferTypes.length === 0 ? (
          <div className="text-center py-12">
            <Tag className={`w-16 h-16 text-[${color.entities.offers}] mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>
              {searchTerm ? 'No Offer Types Found' : 'No Offer Types'}
            </h3>
            <p className={`${tw.textMuted} mb-6`}>
              {searchTerm ? 'Try adjusting your search terms.' : 'Create your first offer type to get started.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto text-sm text-white"
                style={{ backgroundColor: color.sentra.main }}
              >
                <Plus className="w-4 h-4" />
                Create Offer Type
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className={`bg-gradient-to-r from-[${color.ui.surface}] to-[${color.ui.surface}]/80 border-b border-[${color.ui.border}]`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Offer Type
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Description
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-4 text-right text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOfferTypes.map((offerType) => (
                    <tr key={offerType.id} className="hover:bg-[${color.ui.surface}]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: color.entities.offers }}
                          >
                            <Tag className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className={`text-base font-semibold ${tw.textPrimary}`}>
                              {offerType.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${tw.textSecondary} max-w-xs truncate`}>
                          {offerType.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-base font-medium ${offerType.isActive
                          ? `bg-[${color.status.success.light}] text-[${color.status.success.main}]`
                          : `bg-[${color.ui.gray[100]}] text-[${color.ui.gray[800]}]`
                          }`}>
                          {offerType.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditOfferType(offerType)}
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              color: color.sentra.main,
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLButtonElement).style.backgroundColor = `${color.sentra.main}10`;
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOfferType(offerType)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {filteredOfferTypes.map((offerType) => (
                <div key={offerType.id} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: color.entities.offers }}
                    >
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-base font-semibold ${tw.textPrimary} mb-1`}>
                        {offerType.name}
                      </div>
                      <div className={`text-sm ${tw.textSecondary} mb-2`}>
                        {offerType.description || 'No description'}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-base font-medium ${offerType.isActive
                          ? `bg-[${color.status.success.light}] text-[${color.status.success.main}]`
                          : `bg-[${color.ui.gray[100]}] text-[${color.ui.gray[800]}]`
                          }`}>
                          {offerType.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditOfferType(offerType)}
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              color: color.sentra.main,
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLButtonElement).style.backgroundColor = `${color.sentra.main}10`;
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOfferType(offerType)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create Offer Type Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">New Offer Type</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTypeName('');
                  setNewTypeDescription('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Type Name *
                </label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                  placeholder="e.g., Discount Offers, Cashback Offers..."
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTypeDescription}
                  onChange={(e) => setNewTypeDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                  placeholder="Offer type description..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTypeName('');
                    setNewTypeDescription('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOfferType}
                  disabled={!newTypeName.trim() || isCreating}
                  className="px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  style={{ backgroundColor: color.sentra.main }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                  }}
                >
                  {isCreating ? 'Creating...' : 'Create Offer Type'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Offer Type Modal */}
      {editingType && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Offer Type</h2>
              <button
                onClick={() => {
                  setEditingType(null);
                  setEditName('');
                  setEditDescription('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Type Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                  placeholder="e.g., Discount Offers, Cashback Offers..."
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                  placeholder="Offer type description..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingType(null);
                    setEditName('');
                    setEditDescription('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateOfferType}
                  disabled={!editName.trim() || isUpdating}
                  className="px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  style={{ backgroundColor: color.sentra.main }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main;
                  }}
                >
                  {isUpdating ? 'Updating...' : 'Update Offer Type'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}