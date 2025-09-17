import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Layers, Grid3X3, List } from 'lucide-react';
import HeadlessSelect from '../ui/HeadlessSelect';

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
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data - in real app, this would come from API
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
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && productType.isActive) ||
                         (selectedStatus === 'inactive' && !productType.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateProductType = () => {
    // TODO: Implement create product type functionality
    console.log('Create product type');
  };

  const handleEditProductType = (id: number) => {
    // TODO: Implement edit product type functionality
    console.log('Edit product type:', id);
  };

  const handleDeleteProductType = (id: number) => {
    // TODO: Implement delete product type functionality
    console.log('Delete product type:', id);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Types</h1>
          <p className="text-gray-600 mt-2 text-sm">Manage different types of products in your catalog</p>
        </div>
        <button 
          onClick={handleCreateProductType}
          className="inline-flex items-center px-3 py-2 text-base bg-[#3b8169] hover:bg-[#2d5f4e] text-white font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Product Type
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search product types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none w-full sm:w-64"
              />
            </div>
            <HeadlessSelect
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value as 'all' | 'active' | 'inactive')}
              placeholder="Filter by status"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-[#3b8169] text-white' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-[#3b8169] text-white' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Types Display */}
      {filteredProductTypes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No product types found</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first product type.</p>
          <button 
            onClick={handleCreateProductType}
            className="inline-flex items-center px-4 py-2 text-base bg-[#3b8169] hover:bg-[#2d5f4e] text-white font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Product Type
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              {filteredProductTypes.length} Product Type{filteredProductTypes.length !== 1 ? 's' : ''}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProductTypes.map((productType, index) => (
              <div
                key={productType.id}
                className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#3b8169]/20 transition-all duration-300 cursor-pointer"
                style={{
                  animation: `fadeInUp 0.6s ease-out forwards ${index * 0.1}s`,
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}
              >
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-all duration-500">
                      <Layers className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        productType.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {productType.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {productType.productCount} products
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                      {productType.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {productType.description || 'No description available'}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Created: {new Date(productType.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditProductType(productType.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Edit product type"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProductType(productType.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete product type"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">
              {filteredProductTypes.length} Product Type{filteredProductTypes.length !== 1 ? 's' : ''}
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredProductTypes.map((productType, index) => (
              <div 
                key={productType.id} 
                className="group p-6 hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                style={{
                  animation: `fadeInUp 0.6s ease-out forwards ${index * 0.1}s`,
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                    <Layers className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                        {productType.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        productType.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {productType.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {productType.productCount} products
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {productType.description || 'No description available'}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        Created: {new Date(productType.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditProductType(productType.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Edit product type"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProductType(productType.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete product type"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
