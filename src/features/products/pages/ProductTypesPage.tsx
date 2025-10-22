import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Edit, Trash2, Layers } from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';
import { useConfirm } from '../../../contexts/ConfirmContext';
import { useToast } from '../../../contexts/ToastContext';

interface ProductType {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProductTypesPage() {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { success, error: showError } = useToast();

  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingType, setEditingType] = useState<ProductType | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const mockProductTypes: ProductType[] = [
      {
        id: 1,
        name: 'Data Products',
        description: 'Mobile data bundles, internet packages, and data-related services',
        isActive: true,
        productCount: 25,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'Voice Products',
        description: 'Call minutes, voice packages, and communication services',
        isActive: true,
        productCount: 18,
        createdAt: '2024-01-16',
        updatedAt: '2024-01-16'
      },
      {
        id: 3,
        name: 'SMS Products',
        description: 'Text messaging packages and SMS-based services',
        isActive: true,
        productCount: 12,
        createdAt: '2024-01-17',
        updatedAt: '2024-01-17'
      },
      {
        id: 4,
        name: 'Value Added Services',
        description: 'Additional services like music streaming, gaming, and content',
        isActive: true,
        productCount: 8,
        createdAt: '2024-01-18',
        updatedAt: '2024-01-18'
      },
      {
        id: 5,
        name: 'Device Products',
        description: 'Mobile devices, accessories, and hardware products',
        isActive: false,
        productCount: 5,
        createdAt: '2024-01-19',
        updatedAt: '2024-01-19'
      }
    ];

    setTimeout(() => {
      setProductTypes(mockProductTypes);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProductTypes = productTypes.filter(productType => {
    const matchesSearch = productType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (productType.description && productType.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const handleCreateProductType = async () => {
    if (!newTypeName.trim()) return;

    try {
      setIsCreating(true);
      // Mock API call
      const newType: ProductType = {
        id: Date.now(),
        name: newTypeName.trim(),
        description: newTypeDescription.trim() || undefined,
        isActive: true,
        productCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };

      setProductTypes(prev => [...prev, newType]);
      success('Product Type Created', `"${newTypeName}" has been created successfully.`);
      setShowCreateModal(false);
      setNewTypeName('');
      setNewTypeDescription('');
    } catch (err) {
      console.error('Failed to create product type:', err);
      showError('Error', err instanceof Error ? err.message : 'Failed to create product type');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditProductType = (productType: ProductType) => {
    setEditingType(productType);
    setEditName(productType.name);
    setEditDescription(productType.description || '');
  };

  const handleUpdateProductType = async () => {
    if (!editingType || !editName.trim()) return;

    try {
      setIsUpdating(true);
      // Mock API call
      setProductTypes(prev => prev.map(type =>
        type.id === editingType.id
          ? { ...type, name: editName.trim(), description: editDescription.trim() || undefined }
          : type
      ));

      success('Product Type Updated', `"${editName}" has been updated successfully.`);
      setEditingType(null);
      setEditName('');
      setEditDescription('');
    } catch (err) {
      console.error('Failed to update product type:', err);
      showError('Error', err instanceof Error ? err.message : 'Failed to update product type');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProductType = async (productType: ProductType) => {
    const confirmed = await confirm({
      title: 'Delete Product Type',
      message: `Are you sure you want to delete "${productType.name}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      setProductTypes(prev => prev.filter(type => type.id !== productType.id));
      success('Product Type Deleted', `"${productType.name}" has been deleted successfully.`);
    } catch (err) {
      console.error('Failed to delete product type:', err);
      showError('Error', err instanceof Error ? err.message : 'Failed to delete product type');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[${color.primary.action}]"></div>
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
            onClick={() => navigate('/dashboard/products')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>Product Types</h1>
            <p className={`${tw.textSecondary} mt-2 text-sm`}>Manage different types of products in your catalog</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className={`${tw.button} flex items-center gap-2`}
          >
            Create Product Type
          </button>
        </div>
      </div>

      {/* Search */}
      <div>
        <div className="relative w-full">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${tw.textMuted}]`} />
          <input
            type="text"
            placeholder="Search product types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 text-sm border border-[${tw.borderDefault}] rounded-lg focus:outline-none`}
          />
        </div>
      </div>


      {/* Product Types Table */}
      <div className={`bg-white rounded-xl border border-[${tw.borderDefault}] overflow-hidden`}>
        {filteredProductTypes.length === 0 ? (
          <div className="text-center py-12">
            {/* Icon removed */}
            <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>
              {searchTerm ? 'No Product Types Found' : 'No Product Types'}
            </h3>
            <p className={`${tw.textMuted} mb-6`}>
              {searchTerm ? 'Try adjusting your search terms.' : 'Create your first product type to get started.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className={`${tw.button} flex items-center gap-2 mx-auto`}
              >
                Create Product Type
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className={`${tw.tableHeader}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Product Type
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Description
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Products
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
                  {filteredProductTypes.map((productType) => (
                    <tr key={productType.id} className="hover:bg-[${color.surface.background}]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`text-base font-semibold ${tw.textPrimary}`}>
                          {productType.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${tw.textSecondary} max-w-xs truncate`}>
                          {productType.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${tw.textPrimary}`}>
                          {productType.productCount}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${productType.isActive
                          ? `bg-[${color.status.success}] text-[${color.status.success}]`
                          : `bg-[${color.surface.cards}] text-[${color.text.primary}]`
                          }`}>
                          {productType.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditProductType(productType)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title="Edit Product Type"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProductType(productType)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete Product Type"
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
              {filteredProductTypes.map((productType) => (
                <div key={productType.id} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className={`text-base font-semibold ${tw.textPrimary} mb-1`}>
                        {productType.name}
                      </div>
                      <div className={`text-sm ${tw.textSecondary} mb-2`}>
                        {productType.description || 'No description'}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className={`text-sm ${tw.textMuted}`}>
                            {productType.productCount} products
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${productType.isActive
                            ? `bg-[${color.status.success}] text-[${color.status.success}]`
                            : `bg-[${color.surface.cards}] text-[${color.text.primary}]`
                            }`}>
                            {productType.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditProductType(productType)}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProductType(productType)}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Delete
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

      {/* Create Product Type Modal */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">New Product Type</h2>
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
                  Product Type Name *
                </label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                  placeholder="e.g., Data Products, Voice Products..."
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
                  placeholder="Product type description..."
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
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProductType}
                  disabled={!newTypeName.trim() || isCreating}
                  className={`${tw.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isCreating ? 'Creating...' : 'Create Product Type'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Product Type Modal */}
      {editingType && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Product Type</h2>
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
                  Product Type Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                  placeholder="e.g., Data Products, Voice Products..."
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
                  placeholder="Product type description..."
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
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProductType}
                  disabled={!editName.trim() || isUpdating}
                  className={`${tw.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isUpdating ? 'Updating...' : 'Update Product Type'}
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