import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Grid3X3, List, Eye, Edit, Settings } from "lucide-react";
import { color, tw, components } from "../../../shared/utils/utils";
import { ConfigurationModal } from "../../../shared/components/GenericConfigurationPage";
import type { ConfigurationPageConfig } from "../../../shared/components/GenericConfigurationPage";

interface ConfigurationItem {
  id: string;
  name: string;
  description: string;
  type:
    | "campaign"
    | "offer"
    | "product"
    | "segment"
    | "user"
    | "config"
    | "control-group";
  category: string;
  subConfigs?: string[];
  lastModified: string;
  status: "active" | "inactive" | "draft";
  color: string;
  gradient: string;
  navigationPath: string;
}

export default function ConfigurationPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [configurations, setConfigurations] = useState<ConfigurationItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingConfig, setEditingConfig] = useState<
    ConfigurationItem | undefined
  >();

  // Modal configuration
  const modalConfig: ConfigurationPageConfig = {
    title: "Configuration Management",
    subtitle: "Manage and configure all system settings and parameters",
    entityName: "configuration",
    entityNamePlural: "configurations",
    backPath: "/dashboard/configurations",
    icon: Settings,
    searchPlaceholder: "Search configurations...",
    initialData: [],
    createButtonText: "Add Configuration",
    modalTitle: {
      create: "Add Configuration",
      edit: "Edit Configuration",
    },
    nameLabel: "Name",
    nameRequired: true,
    descriptionLabel: "Description",
    descriptionRequired: false,
    nameMaxLength: 100,
    descriptionMaxLength: 500,
    deleteConfirmTitle: "Delete Configuration",
    deleteConfirmMessage: (name: string) =>
      `Are you sure you want to delete "${name}"?`,
    deleteSuccessMessage: (name: string) =>
      `Configuration "${name}" deleted successfully`,
    createSuccessMessage: "Configuration created successfully",
    updateSuccessMessage: "Configuration updated successfully",
    deleteErrorMessage: "Failed to delete configuration",
    saveErrorMessage: "Failed to save configuration",
  };

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockConfigurations: ConfigurationItem[] = [
      {
        id: "campaign-1",
        name: "Campaign Management",
        description: "Manage and configure all campaign settings and templates",
        type: "campaign",
        category: "Management",
        subConfigs: [
          "Line of Business",
          "Campaign Communication Policy",
          "Campaign Objective",
          "Department",
          "Programs",
        ],
        lastModified: "2025-01-20",
        status: "active",
        color: "campaigns",
        gradient: `from-[${color.primary.accent}] to-[${color.primary.accent}]80`,
        navigationPath: "/dashboard/campaigns",
      },
      {
        id: "offer-1",
        name: "Offer Configuration",
        description: "Configure different types of offers and promotions",
        type: "offer",
        category: "Configuration",
        subConfigs: ["Offer Types", "Offer Catalogs", "Discount Rules"],
        lastModified: "2025-01-19",
        status: "active",
        color: "offers",
        gradient: `from-[${color.primary.accent}] to-[${color.primary.accent}]80`,
        navigationPath: "/dashboard/offers",
      },
      {
        id: "product-1",
        name: "Product Management",
        description: "Manage product catalog, categories, and types",
        type: "product",
        category: "Management",
        subConfigs: ["Product Catalogs", "Product Types", "Product Catalog"],
        lastModified: "2025-01-18",
        status: "active",
        color: "products",
        gradient: `from-[${color.primary.accent}] to-[${color.primary.accent}]80`,
        navigationPath: "/dashboard/products",
      },
      {
        id: "segment-1",
        name: "Segment Management",
        description: "Configure customer segmentation and targeting rules",
        type: "segment",
        category: "Management",
        subConfigs: [
          "Segment Rules",
          "Targeting Criteria",
          "Customer Segments",
        ],
        lastModified: "2025-01-16",
        status: "active",
        color: "segments",
        gradient: `from-[${color.primary.accent}] to-[${color.primary.accent}]80`,
        navigationPath: "/dashboard/segments",
      },
      {
        id: "user-1",
        name: "User Management",
        description: "Manage user accounts, roles, and permissions",
        type: "user",
        category: "Management",
        subConfigs: ["User Roles", "Permissions", "Account Settings"],
        lastModified: "2025-01-15",
        status: "active",
        color: "users",
        gradient: `from-[${color.primary.accent}] to-[${color.primary.accent}]80`,
        navigationPath: "/dashboard/user-management",
      },
      {
        id: "control-group-1",
        name: "Universal Control Groups",
        description:
          "Configure and manage universal control groups for campaigns",
        type: "control-group",
        category: "Configuration",
        subConfigs: [
          "Control Group Templates",
          "Customer Base Rules",
          "Scheduling Settings",
        ],
        lastModified: "2025-01-22",
        status: "active",
        color: "campaigns",
        gradient: `from-[${color.primary.accent}] to-[${color.primary.accent}]80`,
        navigationPath: "/dashboard/control-groups",
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
    { id: "all", name: "All Configurations", count: configurations.length },
    {
      id: "campaign",
      name: "Campaign",
      count: configurations.filter((c) => c.type === "campaign").length,
    },
    {
      id: "offer",
      name: "Offer",
      count: configurations.filter((c) => c.type === "offer").length,
    },
    {
      id: "product",
      name: "Product",
      count: configurations.filter((c) => c.type === "product").length,
    },
    {
      id: "segment",
      name: "Segment",
      count: configurations.filter((c) => c.type === "segment").length,
    },
    {
      id: "user",
      name: "User",
      count: configurations.filter((c) => c.type === "user").length,
    },
    {
      id: "control-group",
      name: "Control Group",
      count: configurations.filter((c) => c.type === "control-group").length,
    },
    {
      id: "config",
      name: "Configuration",
      count: configurations.filter((c) => c.type === "config").length,
    },
  ];

  const filteredConfigurations = configurations.filter((config) => {
    const matchesSearch =
      config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || config.type === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getStatusStyle = () => {
    // Return black text with black border for all statuses
    return {
      color: "#000000",
      backgroundColor: "transparent",
      borderColor: "#000000",
      border: "1px solid",
    };
  };

  const handleConfigurationClick = (config: ConfigurationItem) => {
    // Navigation removed - will be used for expandable view later
    // navigate(config.navigationPath);
  };

  const handleViewDetails = (config: ConfigurationItem) => {
    // Navigate to a details page showing all sub-configurations
    // For now, we'll navigate to the main page - we can create a details page later
    navigate(`/dashboard/configuration/${config.id}`);
  };

  const handleAddConfiguration = () => {
    setEditingConfig(undefined);
    setIsModalOpen(true);
  };

  const handleEditConfiguration = (config: ConfigurationItem) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const handleSaveConfiguration = async (itemData: {
    name: string;
    description?: string;
  }) => {
    try {
      setIsSaving(true);

      if (editingConfig) {
        // Update existing configuration
        setConfigurations(
          configurations.map((config) =>
            config.id === editingConfig.id
              ? {
                  ...config,
                  name: itemData.name,
                  description: itemData.description || "",
                  lastModified: new Date().toISOString().split("T")[0],
                }
              : config
          )
        );
      } else {
        // Create new configuration
        const newConfig: ConfigurationItem = {
          id: `config-${Date.now()}`,
          name: itemData.name,
          description: itemData.description || "",
          type: "config",
          category: "Configuration",
          subConfigs: [],
          lastModified: new Date().toISOString().split("T")[0],
          status: "active",
          color: "config",
          gradient: `from-[${color.primary.accent}] to-[${color.primary.accent}]80`,
          navigationPath: "/dashboard/configurations",
        };
        setConfigurations([...configurations, newConfig]);
      }

      setIsModalOpen(false);
      setEditingConfig(undefined);
    } catch (error) {
      console.error("Failed to save configuration:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div
            className="rounded-xl"
            style={{ backgroundColor: color.primary.accent }}
          ></div>
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
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${tw.textMuted}`}
            />
            <input
              type="text"
              placeholder="Search configurations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-4 ${components.input.default} rounded-xl focus:outline-none transition-all duration-200 text-sm`}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === "grid"
                  ? ` text-[${color.primary.action}]`
                  : `${tw.textMuted} hover:${tw.textSecondary}`
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === "list"
                  ? `text-[${color.primary.action}]`
                  : `${tw.textMuted} hover:${tw.textSecondary}`
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-6">
          {categories.map(
            (category) =>
              category.id !== "config" && (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? `bg-[#5F6F77] text-white`
                      : `bg-white ${tw.textSecondary} hover:bg-gray-50 border border-gray-300`
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              )
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-6">
        <p className={`${tw.textSecondary} text-sm`}>
          Showing {filteredConfigurations.length} of {configurations.length}{" "}
          configurations
        </p>
        <button
          onClick={handleAddConfiguration}
          className={`${tw.button} flex items-center space-x-2 hover:scale-105 text-sm whitespace-nowrap`}
        >
          <Plus className="h-4 w-4" />
          <span>Add Configuration</span>
        </button>
      </div>

      {/* Configurations Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredConfigurations.map((config, index) => {
            return (
              <div
                key={config.id}
                className={`group ${components.card.default} hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full`}
                style={{
                  animation: `fadeInUp 0.6s ease-out forwards ${index * 0.1}s`,
                  opacity: 0,
                  transform: "translateY(20px)",
                }}
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-bold ${tw.textPrimary} mb-2 leading-tight`}
                      >
                        {config.name}
                      </h3>
                      <p
                        className={`text-sm ${tw.textSecondary} leading-relaxed`}
                      >
                        {config.description}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-4">
                    <span
                      className={`bg-neutral-100 px-3 py-1 rounded-full text-sm font-medium ${tw.textSecondary}`}
                    >
                      {config.category}
                    </span>
                  </div>

                  {/* Sub-configurations */}
                  <div className="mb-6">
                    <p
                      className={`text-sm font-semibold ${tw.textPrimary} mb-3`}
                    >
                      Sub-configurations:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {config.subConfigs && config.subConfigs.length > 0 ? (
                        <>
                          {config.subConfigs
                            .slice(0, 2)
                            .map((subConfig, idx) => (
                              <span
                                key={idx}
                                className={`text-sm bg-neutral-100 ${tw.textSecondary} px-3 py-1 rounded-full`}
                              >
                                {subConfig}
                              </span>
                            ))}
                          {config.subConfigs.length > 2 && (
                            <span
                              className={`text-sm ${tw.textMuted} px-3 py-1 bg-gray-50 rounded-full`}
                            >
                              +{config.subConfigs.length - 2} more
                            </span>
                          )}
                        </>
                      ) : (
                        <span
                          className={`text-sm ${tw.textMuted} px-3 py-1 bg-gray-50 rounded-full`}
                        >
                          No sub-configurations
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    className={`flex items-center justify-between pt-4 border-t ${tw.borderDefault}`}
                  >
                    <span className={`text-sm ${tw.textMuted}`}>
                      Modified: {config.lastModified}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(config);
                        }}
                        className={`p-2 ${tw.textMuted} hover:bg-[${color.primary.accent}]/10 rounded-lg transition-all duration-200`}
                        style={{
                          "&:hover": { color: color.primary.accent },
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 hover:text-[${color.primary.accent}]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditConfiguration(config);
                        }}
                        className={`p-2 ${tw.textMuted} hover:bg-[${color.primary.accent}]/10 rounded-lg transition-all duration-200`}
                        style={{
                          "&:hover": { color: color.primary.accent },
                        }}
                        title="Edit Configuration"
                      >
                        <Edit className="h-4 w-4 hover:text-[${color.primary.accent}]" />
                      </button>
                      <span
                        className={`text-sm ${tw.textMuted} group-hover:text-[${color.primary.accent}] transition-colors duration-200 ml-1`}
                      >
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`${components.card.default} overflow-hidden`}>
          <div className={`divide-y ${tw.borderDefault}`}>
            {filteredConfigurations.map((config, index) => {
              return (
                <div
                  key={config.id}
                  className={`group p-4 sm:p-6 hover:bg-neutral-100/50 transition-all duration-300`}
                  style={{
                    animation: `fadeInUp 0.6s ease-out forwards ${
                      index * 0.1
                    }s`,
                    opacity: 0,
                    transform: "translateY(20px)",
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3
                          className={`${tw.cardHeading} ${tw.textPrimary} group-hover:${tw.textSecondary} transition-colors duration-300`}
                        >
                          {config.name}
                        </h3>
                      </div>
                      <p
                        className={`${tw.cardSubHeading} ${tw.textSecondary} mb-2`}
                      >
                        {config.description}
                      </p>
                      <div
                        className={`flex items-center space-x-4 text-sm sm:text-base ${tw.textMuted}`}
                      >
                        <span
                          className={`bg-neutral-100 px-2 py-1 rounded-full`}
                        >
                          {config.category}
                        </span>
                        <span>Modified: {config.lastModified}</span>
                        {config.subConfigs && (
                          <span>
                            {config.subConfigs.length} sub-configurations
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(config);
                        }}
                        className={`p-2 ${tw.textMuted} hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200`}
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditConfiguration(config);
                        }}
                        className={`p-2 ${tw.textMuted} hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all duration-200`}
                        title="Edit Configuration"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <span
                        className={`text-sm ${tw.textMuted} group-hover:${tw.textSecondary} transition-colors duration-200`}
                      >
                        →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      <ConfigurationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingConfig(undefined);
        }}
        item={
          editingConfig
            ? {
                id: Number(editingConfig.id.replace("config-", "")),
                name: editingConfig.name,
                description: editingConfig.description,
              }
            : undefined
        }
        onSave={handleSaveConfiguration}
        isSaving={isSaving}
        config={modalConfig}
      />

      {/* Empty State */}
      {filteredConfigurations.length === 0 && (
        <div className="text-center py-12">
          <div
            className={`p-4 bg-neutral-100 rounded-full w-16 h-16 mx-auto mb-4`}
          >
            <Search className={`h-8 w-8 ${tw.textMuted}`} />
          </div>
          <h3
            className={`text-lg sm:text-xl font-semibold ${tw.textPrimary} mb-2`}
          >
            No configurations found
          </h3>
          <p className={`text-base ${tw.textSecondary} mb-6`}>
            {searchTerm
              ? "Try adjusting your search terms"
              : "No configurations match the selected category"}
          </p>
          <button className={`${tw.button} text-sm whitespace-nowrap`}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
