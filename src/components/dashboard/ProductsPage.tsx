import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
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

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [filters]);

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

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      if (product.status === 'active') {
        await productService.deactivateProduct(Number(product.id));
      } else {
        await productService.activateProduct(Number(product.id));
      }
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product status');
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      discontinued: 'bg-red-100 text-red-800'
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-indigo-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Products Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your product catalog</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard/products/categories')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <Settings className="w-5 h-5" />
                Categories
              </button>
              <button
                onClick={() => navigate('/dashboard/products/create')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Product
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.categoryId || ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {/* Sort */}
            <select
              value={`${filters.sortBy}-${filters.sortDirection}`}
              onChange={(e) => {
                const [sortBy, sortDirection] = e.target.value.split('-');
                setFilters({ ...filters, sortBy, sortDirection: sortDirection as 'ASC' | 'DESC' });
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at-DESC">Newest First</option>
              <option value="created_at-ASC">Oldest First</option>
              <option value="name-ASC">Name A-Z</option>
              <option value="name-DESC">Name Z-A</option>
              <option value="product_id-ASC">Product ID A-Z</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first product.</p>
              <button
                onClick={() => navigate('/dashboard/products/create')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create Product
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DA ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description || 'No description'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                          {product.sku || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                          {/* Assuming da_id is part of product, adjust if needed */}
                          N/A
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.category}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(product.status)}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(product.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/products/${product.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/products/${product.id}/edit`)}
                              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(product)}
                              className={`p-2 transition-colors ${
                                product.status === 'active' 
                                  ? 'text-gray-400 hover:text-orange-600' 
                                  : 'text-gray-400 hover:text-green-600'
                              }`}
                              title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {product.status === 'active' ? (
                                <PowerOff className="w-4 h-4" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete Product"
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

              {/* Pagination */}
              <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((filters.page || 1) - 1) * (filters.pageSize || 10) + 1} to{' '}
                  {Math.min((filters.page || 1) * (filters.pageSize || 10), total)} of {total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange((filters.page || 1) - 1)}
                    disabled={filters.page === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {filters.page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange((filters.page || 1) + 1)}
                    disabled={filters.page === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
