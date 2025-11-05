import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, ChevronRight, Settings } from "lucide-react";
import { color, tw, components } from "../../../shared/utils/utils";

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

// Sub-configuration mapping - maps sub-config names to their actual routes
const subConfigRoutes: Record<string, string> = {
  "Line of Business": "/dashboard/line-of-business",
  "Campaign Communication Policy": "/dashboard/campaign-communication-policy",
  "Campaign Objective": "/dashboard/campaign-objectives",
  Department: "/dashboard/departments",
  Programs: "/dashboard/programs",
  "Offer Types": "/dashboard/offer-types",
  "Offer Catalogs": "/dashboard/offer-catalogs",
  "Product Catalogs": "/dashboard/products/catalogs",
  "Product Types": "/dashboard/product-types",
  "Segment Rules": "/dashboard/segments",
  "User Roles": "/dashboard/user-management",
};

export default function ConfigurationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [config, setConfig] = useState<ConfigurationItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - same as ConfigurationPage
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
    ];

    const foundConfig = mockConfigurations.find((c) => c.id === id);
    setConfig(foundConfig || null);
  }, [id]);

  const filteredSubConfigs =
    config?.subConfigs?.filter((subConfig) =>
      subConfig.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (!config) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className={`text-xl font-semibold ${tw.textPrimary} mb-2`}>
            Configuration not found
          </h2>
          <button
            onClick={() => navigate("/dashboard/configuration")}
            className="px-4 py-2 text-white rounded-lg transition-all mt-4"
            style={{ backgroundColor: color.primary.action }}
          >
            Back to Configurations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate("/dashboard/configuration")}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>
              {config.name}
            </h1>
            <p className={`${tw.textSecondary} mt-2 text-sm`}>
              {config.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 ${tw.textSecondary}`}
            >
              {config.category}
            </span>
            <span className={`text-sm ${tw.textMuted}`}>
              Modified: {config.lastModified}
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${tw.textMuted}`}
        />
        <input
          type="text"
          placeholder="Search sub-configurations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 ${components.input.default} rounded-xl focus:outline-none transition-all duration-200 text-sm`}
        />
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className={`${tw.textSecondary} text-sm`}>
          {filteredSubConfigs.length} sub-configuration
          {filteredSubConfigs.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Sub-configurations Grid */}
      {filteredSubConfigs.length === 0 ? (
        <div className={`${components.card.default} text-center py-12`}>
          <Settings className={`w-12 h-12 ${tw.textMuted} mx-auto mb-4`} />
          <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-2`}>
            {searchTerm
              ? "No sub-configurations found"
              : "No sub-configurations available"}
          </h3>
          <p className={`${tw.textSecondary}`}>
            {searchTerm
              ? "Try adjusting your search terms"
              : "This configuration doesn't have any sub-configurations yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredSubConfigs.map((subConfig, index) => {
            const route = subConfigRoutes[subConfig];
            return (
              <div
                key={index}
                onClick={() => {
                  if (route) {
                    navigate(route);
                  }
                }}
                className={`group ${
                  components.card.default
                } hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 ${
                  route ? "cursor-pointer" : "cursor-default"
                } flex flex-col h-full`}
                style={{
                  animation: `fadeInUp 0.6s ease-out forwards ${index * 0.1}s`,
                  opacity: 0,
                  transform: "translateY(20px)",
                }}
              >
                <div className="flex flex-col h-full">
                  {/* Icon/Header */}
                  <div className="mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{
                        background: `linear-gradient(135deg, ${color.primary.accent}20 0%, ${color.primary.accent}10 100%)`,
                      }}
                    >
                      <Settings
                        className="w-6 h-6"
                        style={{ color: color.primary.accent }}
                      />
                    </div>
                    <h3
                      className={`text-lg font-bold ${tw.textPrimary} leading-tight`}
                    >
                      {subConfig}
                    </h3>
                  </div>

                  {/* Footer */}
                  <div
                    className={`flex items-center justify-between pt-4 border-t ${tw.borderDefault} mt-auto`}
                  >
                    <span className={`text-sm ${tw.textMuted}`}>
                      {route ? "Click to configure" : "Coming soon"}
                    </span>
                    {route && (
                      <ChevronRight
                        className={`w-5 h-5 ${tw.textMuted} group-hover:text-[${color.primary.accent}] transition-colors duration-200`}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
