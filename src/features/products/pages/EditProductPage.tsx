import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Save,
  AlertCircle
} from 'lucide-react';
import { Product, UpdateProductRequest } from '../types/product';
import { productService } from '../services/productService';
import CategorySelector from '../../../shared/components/CategorySelector';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import { color, tw } from '../../../shared/utils/utils';

export default function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<UpdateProductRequest>({
    product_id: '',
    name: '',
    da_id: '',
    description: '',
    category_id: undefined,
    is_active: true
  });

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps


  const loadProduct = async () => {
    try {
      setIsLoadingProduct(true);
      setError(null);
      const productData = await productService.getProductById(id!, 'id');
      setProduct(productData);

      // Populate form with existing data based on API response structure
      setFormData({
        product_id: productData.product_id,
        name: productData.name,
        da_id: productData.da_id,
        description: productData.description || '',
        category_id: productData.category_id ? parseInt(productData.category_id) : undefined,
        is_active: productData.is_active
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name?.trim() || !formData.da_id?.trim()) {
      setError('Product name and DA ID are required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await productService.updateProduct(Number(id), formData);
      navigate('/dashboard/products');
    } catch (err) {
      // Extract detailed error message from backend response
      let errorMessage = 'Failed to update product';

      if (err && typeof err === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      console.error('Product update error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateProductRequest, value: string | number | boolean | undefined) => {
    setFormData({ ...formData, [field]: value });
  };

  if (isLoadingProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner variant="modern" size="xl" color="primary" className="mb-4" />
        <p className={`${tw.textMuted} font-medium text-sm`}>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard/products')}
            className="bg-[#3b8169] hover:bg-[#2d5f4e] text-white px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Edit Product
          </h1>
          <p className="text-gray-600 text-sm">Update product information</p>
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
                Product ID
              </label>
              <input
                type="text"
                value={formData.product_id}
                onChange={(e) => handleInputChange('product_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg "
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg "
                placeholder="e.g., Premium Voice Bundle"
              />
            </div>

            {/* DA ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DA ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.da_id}
                onChange={(e) => handleInputChange('da_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg "
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
                placeholder="Select or create a category"
                allowCreate={true}
              />
            </div>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg "
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

          {/* Actions */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard/products')}
              className="px-3 py-2 border text-sm border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: color.sentra.main }}
              onMouseEnter={(e) => { if (!isLoading) (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
              onMouseLeave={(e) => { if (!isLoading) (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
