import { useState, useEffect } from 'react';
import { 
  Search, 
  Settings, 
  Target, 
  MessageSquare, 
  Package, 
  Users, 
  Tag,
  Filter,
  Plus,
  Edit,
  Eye,
  ChevronRight,
  Grid3X3,
  List
} from 'lucide-react';

interface ConfigurationItem {
  id: string;
  name: string;
  description: string;
  type: 'campaign' | 'offer' | 'product' | 'segment' | 'user';
  category: string;
  subConfigs?: string[];
  lastModified: string;
  status: 'active' | 'inactive' | 'draft';
  icon: any;
  color: string;
  gradient: string;
}

export default function ConfigurationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [configurations, setConfigurations] = useState<ConfigurationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockConfigurations: ConfigurationItem[] = [
      {
        id: 'campaign-1',
        name: 'Campaign Templates',
        description: 'Predefined campaign structures and workflows',
        type: 'campaign',
        category: 'Templates',
        subConfigs: ['Email Campaigns', 'SMS Campaigns', 'Push Notifications'],
        lastModified: '2025-01-20',
        status: 'active',
        icon: Target,
        color: 'indigo',
        gradient: 'from-indigo-500 to-purple-600'
      },
      {
        id: 'offer-1',
        name: 'Offer Types',
        description: 'Configure different types of offers and promotions',
        type: 'offer',
        category: 'Types',
        subConfigs: ['Discount Offers', 'Bundle Offers', 'Free Trial Offers'],
        lastModified: '2025-01-19',
        status: 'active',
        icon: MessageSquare,
        color: 'emerald',
        gradient: 'from-emerald-500 to-teal-600'
      },
      {
        id: 'product-1',
        name: 'Product Categories',
        description: 'Manage product categorization and classification',
        type: 'product',
        category: 'Categories',
        subConfigs: ['Data Plans', 'Voice Plans', 'Device Categories'],
        lastModified: '2025-01-18',
        status: 'active',
        icon: Package,
        color: 'rose',
        gradient: 'from-rose-500 to-pink-600'
      },
      {
        id: 'product-2',
        name: 'Product Types',
        description: 'Define different product types and specifications',
        type: 'product',
        category: 'Types',
        subConfigs: ['Prepaid Plans', 'Postpaid Plans', 'Add-ons'],
        lastModified: '2025-01-17',
        status: 'active',
        icon: Tag,
        color: 'amber',
        gradient: 'from-amber-500 to-orange-600'
      },
      {
        id: 'segment-1',
        name: 'Segment Rules',
        description: 'Configure customer segmentation criteria and rules',
        type: 'segment',
        category: 'Rules',
        subConfigs: ['Demographic Rules', 'Behavioral Rules', 'Geographic Rules'],
        lastModified: '2025-01-16',
        status: 'active',
        icon: Users,
        color: 'blue',
        gradient: 'from-blue-500 to-cyan-600'
      },
      {
        id: 'user-1',
        name: 'User Roles',
        description: 'Manage user permissions and access levels',
        type: 'user',
        category: 'Permissions',
        subConfigs: ['Admin Roles', 'Manager Roles', 'Agent Roles'],
        lastModified: '2025-01-15',
        status: 'active',
        icon: Settings,
        color: 'purple',
        gradient: 'from-purple-500 to-indigo-600'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setConfigurations(mockConfigurations);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = [
    { id: 'all', name: 'All Configurations', count: configurations.length },
    { id: 'campaign', name: 'Campaign', count: configurations.filter(c => c.type === 'campaign').length },
    { id: 'offer', name: 'Offer', count: configurations.filter(c => c.type === 'offer').length },
    { id: 'product', name: 'Product', count: configurations.filter(c => c.type === 'product').length },
    { id: 'segment', name: 'Segment', count: configurations.filter(c => c.type === 'segment').length },
    { id: 'user', name: 'User', count: configurations.filter(c => c.type === 'user').length }
  ];

  const filteredConfigurations = configurations.filter(config => {
    const matchesSearch = config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || config.type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'draft': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                Configuration Management
              </h1>
              <p className="text-slate-600 mt-1">
                Manage and configure all system settings and parameters
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search configurations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            Showing {filteredConfigurations.length} of {configurations.length} configurations
          </p>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#3b8169] hover:bg-[#2d5f4e] text-white rounded-xl transition-all duration-200 hover:scale-105">
            <Plus className="h-4 w-4" />
            <span>Add Configuration</span>
          </button>
        </div>

        {/* Configurations Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConfigurations.map((config, index) => {
              const Icon = config.icon;
              return (
                <div
                  key={config.id}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 p-6 hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                  style={{
                    animation: `fadeInUp 0.6s ease-out forwards ${index * 0.1}s`,
                    opacity: 0,
                    transform: 'translateY(20px)'
                  }}
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg group-hover:scale-110 transition-all duration-500`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(config.status)}`}>
                        {config.status}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors duration-300">
                        {config.name}
                      </h3>
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                        {config.description}
                      </p>
                      <div className="flex items-center text-xs text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded-full">
                          {config.category}
                        </span>
                      </div>
                    </div>

                    {/* Sub-configs */}
                    {config.subConfigs && config.subConfigs.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Sub-configurations:</p>
                        <div className="flex flex-wrap gap-1">
                          {config.subConfigs.slice(0, 3).map((subConfig, idx) => (
                            <span key={idx} className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded-full">
                              {subConfig}
                            </span>
                          ))}
                          {config.subConfigs.length > 3 && (
                            <span className="text-xs text-slate-400 px-2 py-1">
                              +{config.subConfigs.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        Modified: {config.lastModified}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200">
                          <Edit className="h-4 w-4" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors duration-200" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredConfigurations.map((config, index) => {
                const Icon = config.icon;
                return (
                  <div
                    key={config.id}
                    className="group p-6 hover:bg-slate-50/50 transition-all duration-300 cursor-pointer"
                    style={{
                      animation: `fadeInUp 0.6s ease-out forwards ${index * 0.1}s`,
                      opacity: 0,
                      transform: 'translateY(20px)'
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                            {config.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(config.status)}`}>
                            {config.status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mb-2">
                          {config.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span className="bg-slate-100 px-2 py-1 rounded-full">
                            {config.category}
                          </span>
                          <span>Modified: {config.lastModified}</span>
                          {config.subConfigs && (
                            <span>{config.subConfigs.length} sub-configurations</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200">
                          <Edit className="h-4 w-4" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors duration-200" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredConfigurations.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No configurations found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'No configurations match the selected category'}
            </p>
            <button className="px-6 py-3 bg-[#3b8169] hover:bg-[#2d5f4e] text-white rounded-xl transition-all duration-200">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
