import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Target,
  MessageSquare,
  Package,
  Users,
  Plus,
  Edit,
  Eye,
  ChevronRight,
  Grid3X3,
  List,
  Shield,
} from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';

interface ConfigurationItem {
  id: string;
  name: string;
  description: string;
  type: 'campaign' | 'offer' | 'product' | 'segment' | 'user' | 'config' | 'control-group';
  category: string;
  subConfigs?: string[];
  lastModified: string;
  status: 'active' | 'inactive' | 'draft';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  navigationPath: string;
}

export default function ConfigurationPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [configurations, setConfigurations] = useState<ConfigurationItem[]>([]);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockConfigurations: ConfigurationItem[] = [
      {
        id: 'campaign-1',
        name: 'Campaign Management',
        description: 'Manage and configure all campaign settings and templates',
        type: 'campaign',
        category: 'Management',
        subConfigs: ['Campaign Templates', 'SMS Campaigns', 'Email Campaigns'],
        lastModified: '2025-01-20',
        status: 'active',
        icon: Target,
        color: 'campaigns',
        gradient: `from-[${color.entities.campaigns}] to-[${color.entities.campaigns}]80`,
        navigationPath: '/dashboard/campaigns'
      },
      {
        id: 'offer-1',
        name: 'Offer Configuration',
        description: 'Configure different types of offers and promotions',
        type: 'offer',
        category: 'Configuration',
        subConfigs: ['Offer Types', 'Offer Categories', 'Discount Rules'],
        lastModified: '2025-01-19',
        status: 'active',
        icon: MessageSquare,
        color: 'offers',
        gradient: `from-[${color.entities.offers}] to-[${color.entities.offers}]80`,
        navigationPath: '/dashboard/offers'
      },
      {
        id: 'product-1',
        name: 'Product Management',
        description: 'Manage product catalog, categories, and types',
        type: 'product',
        category: 'Management',
        subConfigs: ['Product Categories', 'Product Types', 'Product Catalog'],
        lastModified: '2025-01-18',
        status: 'active',
        icon: Package,
        color: 'products',
        gradient: `from-[${color.entities.products}] to-[${color.entities.products}]80`,
        navigationPath: '/dashboard/products'
      },
      {
        id: 'segment-1',
        name: 'Segment Management',
        description: 'Configure customer segmentation and targeting rules',
        type: 'segment',
        category: 'Management',
        subConfigs: ['Segment Rules', 'Targeting Criteria', 'Customer Segments'],
        lastModified: '2025-01-16',
        status: 'active',
        icon: Users,
        color: 'segments',
        gradient: `from-[${color.entities.segments}] to-[${color.entities.segments}]80`,
        navigationPath: '/dashboard/segments'
      },
      {
        id: 'user-1',
        name: 'User Management',
        description: 'Manage user accounts, roles, and permissions',
        type: 'user',
        category: 'Management',
        subConfigs: ['User Roles', 'Permissions', 'Account Settings'],
        lastModified: '2025-01-15',
        status: 'active',
        icon: Users,
        color: 'users',
        gradient: `from-[${color.entities.users}] to-[${color.entities.users}]80`,
        navigationPath: '/dashboard/user-management'
      },
      {
        id: 'control-group-1',
        name: 'Universal Control Groups',
        description: 'Configure and manage universal control groups for campaigns',
        type: 'control-group',
        category: 'Configuration',
        subConfigs: ['Control Group Templates', 'Customer Base Rules', 'Scheduling Settings', 'Variance Calculations'],
        lastModified: '2025-01-22',
        status: 'active',
        icon: Shield,
        color: 'campaigns',
        gradient: `from-[${color.entities.campaigns}] to-[${color.entities.campaigns}]80`,
        navigationPath: '/dashboard/control-groups'
      },
      // {
      //   id: 'config-1',
      //   name: 'System Configuration',
      //   description: 'Global system settings and configuration parameters',
      //   type: 'config',
      //   category: 'System',
      //   subConfigs: ['API Settings', 'Email Templates', 'Notification Rules', 'System Preferences'],
      //   lastModified: '2025-01-14',
      //   status: 'active',
      //   icon: Cog,
      //   color: 'slate',
      //   gradient: 'from-slate-500 to-gray-600'
      // }
    ];

    // Set configurations immediately since it's mock data
    setConfigurations(mockConfigurations);
  }, []);

  const categories = [
    { id: 'all', name: 'All Configurations', count: configurations.length },
    { id: 'campaign', name: 'Campaign', count: configurations.filter(c => c.type === 'campaign').length },
    { id: 'offer', name: 'Offer', count: configurations.filter(c => c.type === 'offer').length },
    { id: 'product', name: 'Product', count: configurations.filter(c => c.type === 'product').length },
    { id: 'segment', name: 'Segment', count: configurations.filter(c => c.type === 'segment').length },
    { id: 'user', name: 'User', count: configurations.filter(c => c.type === 'user').length },
    { id: 'control-group', name: 'Control Group', count: configurations.filter(c => c.type === 'control-group').length },
    { id: 'config', name: 'Configuration', count: configurations.filter(c => c.type === 'config').length }
  ];

  const filteredConfigurations = configurations.filter(config => {
    const matchesSearch = config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || config.type === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return {
          backgroundColor: color.status.success.light,
          color: color.status.success.main,
          borderColor: `${color.status.success.main}20`
        };
      case 'inactive':
        return {
          backgroundColor: color.ui.surface,
          color: tw.textSecondary,
          borderColor: color.ui.border
        };
      case 'draft':
        return {
          backgroundColor: color.status.warning.light,
          color: color.status.warning.main,
          borderColor: `${color.status.warning.main}20`
        };
      default:
        return {
          backgroundColor: color.ui.surface,
          color: tw.textSecondary,
          borderColor: color.ui.border
        };
    }
  };

  const handleConfigurationClick = (config: ConfigurationItem) => {
    navigate(config.navigationPath);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="rounded-xl" style={{ backgroundColor: color.entities.configuration }}>
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
              Configuration Management
            </h1>
            <p className={`${tw.textSecondary} mt-2 text-sm`}>
              Manage and configure all system settings and parameters
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={` mb-8`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${tw.textMuted}`} />
            <input
              type="text"
              placeholder="Search configurations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-4 border border-[${color.ui.border}] rounded-xl focus:outline-none transition-all duration-200 text-sm`}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid'
                ? `bg-[${color.sentra.main}]/10 text-[${color.sentra.main}]`
                : `${tw.textMuted} hover:${tw.textSecondary}`
                }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list'
                ? `bg-[${color.sentra.main}]/10 text-[${color.sentra.main}]`
                : `${tw.textMuted} hover:${tw.textSecondary}`
                }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-6">
          {categories.map((category) => (
            category.id !== 'config' && (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${selectedCategory === category.id
                  ? `bg-[${color.sentra.main}] text-white border border-[${color.sentra.main}]`
                  : `bg-white ${tw.textSecondary} hover:bg-gray-50 border border-gray-300`
                  }`}
              >
                {category.name} ({category.count})
              </button>
            )
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-6">
        <p className={`${tw.textSecondary} text-sm`}>
          Showing {filteredConfigurations.length} of {configurations.length} configurations
        </p>
        <button
          className="flex items-center space-x-2 px-3 py-2 text-white rounded-lg transition-all duration-200 hover:scale-105 text-sm whitespace-nowrap"
          style={{ backgroundColor: color.sentra.main }}
          onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
          onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Configuration</span>
        </button>
      </div>

      {/* Configurations Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredConfigurations.map((config, index) => {
            const Icon = config.icon;
            return (
              <div
                key={config.id}
                onClick={() => handleConfigurationClick(config)}
                className={`group bg-white rounded-2xl border border-[${color.ui.border}] p-6 hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer`}
                style={{
                  animation: `fadeInUp 0.6s ease-out forwards ${index * 0.1}s`,
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}
              >
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${color.entities[config.color as keyof typeof color.entities]}, ${color.entities[config.color as keyof typeof color.entities]}80)`
                  }}
                ></div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-xl shadow-lg group-hover:scale-110 transition-all duration-500"
                      style={{
                        backgroundColor: color.entities[config.color as keyof typeof color.entities]
                      }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-semibold border"
                      style={getStatusStyle(config.status)}
                    >
                      {config.status}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h3 className={`text-base sm:text-lg lg:text-xl font-bold ${tw.textPrimary} mb-2 group-hover:${tw.textSecondary} transition-colors duration-300`}>
                      {config.name}
                    </h3>
                    <p className={`${tw.textSecondary} text-sm sm:text-base mb-3 line-clamp-2`}>
                      {config.description}
                    </p>
                    <div className={`flex items-center text-xs sm:text-sm ${tw.textMuted}`}>
                      <span className={`bg-[${color.ui.surface}] px-2 py-1 rounded-full`}>
                        {config.category}
                      </span>
                    </div>
                  </div>

                  {/* Sub-configs */}
                  {config.subConfigs && config.subConfigs.length > 0 && (
                    <div className="mb-4">
                      <p className={`text-xs sm:text-sm font-semibold ${tw.textMuted} mb-2`}>Sub-configurations:</p>
                      <div className="flex flex-wrap gap-1">
                        {config.subConfigs.slice(0, 3).map((subConfig, idx) => (
                          <span key={idx} className={`text-xs sm:text-sm bg-[${color.ui.surface}] ${tw.textSecondary} px-2 py-1 rounded-full`}>
                            {subConfig}
                          </span>
                        ))}
                        {config.subConfigs.length > 3 && (
                          <span className={`text-xs sm:text-sm ${tw.textMuted} px-2 py-1`}>
                            +{config.subConfigs.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className={`flex items-center justify-between pt-4 border-t border-[${color.ui.border}]`}>
                    <span className={`text-xs sm:text-sm ${tw.textMuted}`}>
                      Modified: {config.lastModified}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button className={`p-2 ${tw.textMuted} hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200`}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className={`p-2 ${tw.textMuted} hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all duration-200`}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <ChevronRight className={`h-4 w-4 ${tw.textMuted} group-hover:${tw.textSecondary} transition-colors duration-200`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`bg-white rounded-2xl border border-[${color.ui.border}] overflow-hidden`}>
          <div className={`divide-y divide-[${color.ui.border}]`}>
            {filteredConfigurations.map((config, index) => {
              const Icon = config.icon;
              return (
                <div
                  key={config.id}
                  onClick={() => handleConfigurationClick(config)}
                  className={`group p-4 sm:p-6 hover:bg-[${color.ui.surface}]/50 transition-all duration-300 cursor-pointer`}
                  style={{
                    animation: `fadeInUp 0.6s ease-out forwards ${index * 0.1}s`,
                    opacity: 0,
                    transform: 'translateY(20px)'
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="p-3 rounded-xl shadow-lg"
                      style={{
                        backgroundColor: color.entities[config.color as keyof typeof color.entities]
                      }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-sm sm:text-base font-bold ${tw.textPrimary} group-hover:${tw.textSecondary} transition-colors duration-300`}>
                          {config.name}
                        </h3>
                        <span
                          className="px-3 py-1 rounded-full text-sm font-semibold border"
                          style={getStatusStyle(config.status)}
                        >
                          {config.status}
                        </span>
                      </div>
                      <p className={`${tw.textSecondary} text-sm sm:text-base mb-2`}>
                        {config.description}
                      </p>
                      <div className={`flex items-center space-x-4 text-xs sm:text-sm ${tw.textMuted}`}>
                        <span className={`bg-[${color.ui.surface}] px-2 py-1 rounded-full`}>
                          {config.category}
                        </span>
                        <span>Modified: {config.lastModified}</span>
                        {config.subConfigs && (
                          <span>{config.subConfigs.length} sub-configurations</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className={`p-2 ${tw.textMuted} hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200`}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className={`p-2 ${tw.textMuted} hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all duration-200`}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <ChevronRight className={`h-4 w-4 ${tw.textMuted} group-hover:${tw.textSecondary} transition-colors duration-200`} />
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
          <div className={`p-4 bg-[${color.ui.surface}] rounded-full w-16 h-16 mx-auto mb-4`}>
            <Search className={`h-8 w-8 ${tw.textMuted}`} />
          </div>
          <h3 className={`text-lg sm:text-xl font-semibold ${tw.textPrimary} mb-2`}>No configurations found</h3>
          <p className={`text-base ${tw.textSecondary} mb-6`}>
            {searchTerm ? 'Try adjusting your search terms' : 'No configurations match the selected category'}
          </p>
          <button
            className="px-4 py-2 text-white rounded-lg transition-all duration-200 text-sm whitespace-nowrap"
            style={{ backgroundColor: color.sentra.main }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.hover; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = color.sentra.main; }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
