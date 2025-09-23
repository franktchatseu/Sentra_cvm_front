import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
  Package,
  Settings
} from 'lucide-react';
import { Product, ProductFilters } from '../../types/product';
import { ProductCategory } from '../../types/productCategory';
import { productService } from '../../services/productService';
import { productCategoryService } from '../../services/productCategoryService';
import HeadlessSelect from '../ui/HeadlessSelect';
import { color, tw } from '../../design/utils';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    pageSize: 10,
    sortBy: 'created_at',
    sortDirection: 'DESC'
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const loadCategories = async () => {
    try {
      const response = await productCategoryService.getCategories();
      setCategories(response.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts(filters);
      setProducts(response.data);
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / (filters.pageSize || 10)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [filters]);

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleFilterChange = (key: keyof ProductFilters, value: string | number | boolean | undefined) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      if (product.is_active) {
        await productService.deactivateProduct(Number(product.id));
        setNotification({
          type: 'success',
          message: `Product "${product.name}" has been deactivated successfully.`
        });
      } else {
        await productService.activateProduct(Number(product.id));
        setNotification({
          type: 'success',
          message: `Product "${product.name}" has been activated successfully.`
        });
      }
      loadProducts();

      // Auto-hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product status';
      setError(errorMessage);
      setNotification({
        type: 'error',
        message: errorMessage
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await productService.deleteProduct(Number(productId));
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
            Products Management
          </h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>Manage your product catalog</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/dashboard/products/categories')}
            className={`${tw.primaryButton} px-3 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 text-base`}
          >
            <Settings className="w-5 h-5" />
            Categories
          </button>
          <button
            onClick={() => navigate('/dashboard/products/create')}
            className={`${tw.primaryButton} px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 text-base`}
          >
            <Plus className="w-5 h-5" />
            Create Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${color.ui.text.muted}]`} />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border border-[${color.ui.border}] rounded-lg focus:outline-none focus:border-[${color.sentra.main}] focus:ring-1 focus:ring-[${color.sentra.main}]/20`}
            />
          </div>

          {/* Category Filter */}
          <HeadlessSelect
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map((category) => ({
                value: category.id.toString(),
                label: category.name
              }))
            ]}
            value={filters.categoryId?.toString() || ''}
            onChange={(value) => handleFilterChange('categoryId', value ? Number(value) : undefined)}
            placeholder="All Categories"
            className="min-w-[160px]"
          />

          {/* Status Filter */}
          <HeadlessSelect
            options={[
              { value: '', label: 'All Status' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' }
            ]}
            value={filters.isActive === undefined ? '' : filters.isActive.toString()}
            onChange={(value) => handleFilterChange('isActive', value === '' ? undefined : value === 'true')}
            placeholder="All Status"
            className="min-w-[120px]"
          />

          {/* Sort */}
          <HeadlessSelect
            options={[
              { value: 'created_at-DESC', label: 'Newest First' },
              { value: 'created_at-ASC', label: 'Oldest First' },
              { value: 'name-ASC', label: 'Name A-Z' },
              { value: 'name-DESC', label: 'Name Z-A' },
              { value: 'product_id-ASC', label: 'Product ID A-Z' }
            ]}
            value={`${filters.sortBy}-${filters.sortDirection}`}
            onChange={(value) => {
              const [sortBy, sortDirection] = value.toString().split('-');
              setFilters({ ...filters, sortBy, sortDirection: sortDirection as 'ASC' | 'DESC' });
            }}
            placeholder="Sort by"
            className="min-w-[140px]"
          />
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md rounded-xl shadow-lg border p-4 transition-all duration-300 ${notification.type === 'success'
          ? `bg-[${color.status.success.light}] border-[${color.status.success.main}]/20 text-[${color.status.success.dark}]`
          : `bg-[${color.status.error.light}] border-[${color.status.error.main}]/20 text-[${color.status.error.dark}]`
          }`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-5 h-5 mr-3 ${notification.type === 'success' ? `text-[${color.status.success.main}]` : `text-[${color.status.error.main}]`
              }`}>
              {notification.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className={`ml-auto flex-shrink-0 ${tw.textMuted} hover:${tw.textSecondary}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={`bg-[${color.status.error.light}] border border-[${color.status.error.main}]/20 rounded-xl p-4 mb-6`}>
          <p className={`text-[${color.status.error.dark}]`}>{error}</p>
        </div>
      )}

      {/* Products Table */}
      <div className={`bg-white rounded-xl shadow-sm border border-[${color.ui.border}] overflow-hidden`}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-[${color.sentra.main}]`}></div>
            <span className={`ml-3 ${tw.textSecondary}`}>Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className={`w-16 h-16 text-[${color.entities.products}] mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${tw.textPrimary} mb-2`}>No products found</h3>
            <p className={`${tw.textMuted} mb-6`}>Get started by creating your first product.</p>
            <button
              onClick={() => navigate('/dashboard/products/create')}
              className={`${tw.primaryButton} px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto text-base`}
            >
              <Plus className="w-5 h-5" />
              Create Product
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`bg-[${color.ui.surface}]`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Product ID
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Product Name
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      DA ID
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Category
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Created
                    </th>
                    <th className={`px-6 py-4 text-right text-xs font-medium ${tw.textMuted} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-[${color.ui.border}]`}>
                  {products.map((product) => {
                    const categoryName = categories.find(cat => cat.id === parseInt(product.category_id))?.name || 'N/A';
                    const status = product.is_active ? 'Active' : 'Inactive';
                    const statusBadge = product.is_active ? `bg-[${color.status.success.light}] text-[${color.status.success.main}]` : `bg-[${color.ui.gray[100]}] text-[${color.ui.gray[800]}]`;

                    return (
                      <tr key={product.id} className={`hover:bg-[${color.ui.surface}]/50 transition-colors`}>
                        <td className={`px-6 py-4 text-sm ${tw.textPrimary} font-mono`}>
                          {product.product_id || product.id || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className={`text-sm font-medium ${tw.textPrimary}`}>{product.name}</div>
                            <div className={`text-sm ${tw.textMuted} truncate max-w-xs`}>
                              {product.description || 'No description'}
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm ${tw.textPrimary} font-mono`}>
                          {product.da_id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[${color.entities.products}]/10 text-[${color.entities.products}]`}>
                            {categoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge}`}>
                            {status}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm ${tw.textMuted}`}>
                          {new Date(product.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/products/${product.id}`)}
                              className={`p-2 ${tw.textMuted} hover:text-[${color.status.info.main}] transition-colors`}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/products/${product.id}/edit`)}
                              className={`p-2 ${tw.textMuted} hover:text-[${color.sentra.main}] transition-colors`}
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(product)}
                              className={`p-2 transition-colors ${product.is_active
                                ? `${tw.textMuted} hover:text-[${color.status.warning.main}]`
                                : `${tw.textMuted} hover:text-[${color.status.success.main}]`
                                }`}
                              title={product.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {product.is_active ? (
                                <PowerOff className="w-4 h-4" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className={`p-2 ${tw.textMuted} hover:text-[${color.status.error.main}] transition-colors`}
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className={`bg-[${color.ui.surface}] px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0`}>
              <div className={`text-base ${tw.textSecondary} text-center sm:text-left`}>
                Showing {((filters.page || 1) - 1) * (filters.pageSize || 10) + 1} to{' '}
                {Math.min((filters.page || 1) * (filters.pageSize || 10), total)} of {total} results
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                  disabled={filters.page === 1}
                  className={`p-2 border border-[${color.ui.border}] rounded-lg hover:bg-[${color.ui.surface}] disabled:opacity-50 disabled:cursor-not-allowed text-base whitespace-nowrap`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className={`px-4 py-2 text-base ${tw.textSecondary} whitespace-nowrap`}>
                  Page {filters.page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                  disabled={filters.page === totalPages}
                  className={`p-2 border border-[${color.ui.border}] rounded-lg hover:bg-[${color.ui.surface}] disabled:opacity-50 disabled:cursor-not-allowed text-base whitespace-nowrap`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

}
