import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  AlertCircle
} from 'lucide-react';
import { CreateProductRequest } from '../types/product';
import { productService } from '../services/productService';
import CategorySelector from '../../../shared/components/CategorySelector';
import CreateCategoryModal from '../../../shared/components/CreateCategoryModal';
import { tw } from '../../../shared/utils/utils';
import { useToast } from '../../../contexts/ToastContext';

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { success } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateProductRequest>({
    product_id: '',
    name: '',
    da_id: '',
    description: '',
    category_id: undefined,
    is_active: true
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_id.trim() || !formData.name.trim()) {
      setError('Product ID and Name are required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await productService.createProduct(formData);
      success('Product Created', `"${formData.name}" has been created successfully.`);
      navigate('/dashboard/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateProductRequest, value: string | number | boolean | undefined) => {
    setFormData({ ...formData, [field]: value });
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/dashboard/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create New Product
          </h1>
          <p className="text-gray-600 text-sm">Add a new product to your catalog</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.product_id}
                onChange={(e) => handleInputChange('product_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:outline-none"
                placeholder="e.g., VOICE_BUNDLE_001"
              />
              <p className="text-sm text-gray-500 mt-1">Unique identifier for the product</p>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:outline-none"
                placeholder="e.g., Premium Voice Bundle"
              />
            </div>

            {/* DA ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DA ID
              </label>
              <input
                type="text"
                value={formData.da_id}
                onChange={(e) => handleInputChange('da_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:outline-none"
                placeholder="e.g., DA_001"
              />
              <p className="text-sm text-gray-500 mt-1">Data Analytics identifier</p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <CategorySelector
                value={formData.category_id}
                onChange={(categoryId) => handleInputChange('category_id', categoryId)}
                placeholder="Select Category"
                allowCreate={true}
                onCreateCategory={() => setShowCreateModal(true)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:outline-none"
                placeholder="Describe the product features and benefits..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_active"
                    checked={formData.is_active === true}
                    onChange={() => handleInputChange('is_active', true)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:outline-none"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_active"
                    checked={formData.is_active === false}
                    onChange={() => handleInputChange('is_active', false)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:outline-none"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard/products')}
              className={`${tw.ghostButton} px-3 py-2 text-sm rounded-lg flex items-center gap-2`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`${tw.primaryButton} px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

    </div>
  );
}
