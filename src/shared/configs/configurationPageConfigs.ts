import {
  Flag,
  Building2,
  Users,
  Briefcase,
  Tag,
  Megaphone,
  Layers,
} from "lucide-react";
import {
  ConfigurationPageConfig,
  ConfigurationItem,
} from "../components/GenericConfigurationPage";
import {
  TypeConfigurationItem,
  TypeConfigurationPageConfig,
} from "../components/TypeConfigurationPage";

// Hardcoded objectives data
const hardcodedObjectives: ConfigurationItem[] = [
  {
    id: 1,
    name: "New Customer Acquisition",
    description: "Attract and convert new customers to your service",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z",
  },
  {
    id: 2,
    name: "Customer Retention",
    description: "Keep existing customers engaged and loyal",
    created_at: "2024-01-10T09:15:00Z",
    updated_at: "2024-01-18T16:20:00Z",
  },
  {
    id: 3,
    name: "Churn Prevention",
    description: "Prevent at-risk customers from leaving",
    created_at: "2024-01-12T11:00:00Z",
    updated_at: "2024-01-19T13:30:00Z",
  },
  {
    id: 4,
    name: "Upsell/Cross-sell",
    description: "Increase revenue from existing customers",
    created_at: "2024-01-14T15:30:00Z",
    updated_at: "2024-01-21T10:15:00Z",
  },
  {
    id: 5,
    name: "Dormant Customer Reactivation",
    description: "Re-engage inactive or dormant customers",
    created_at: "2024-01-08T08:45:00Z",
    updated_at: "2024-01-15T12:00:00Z",
  },
];

// Hardcoded departments data
const hardcodedDepartments: ConfigurationItem[] = [
  {
    id: 1,
    name: "Marketing",
    description: "Responsible for marketing campaigns and customer acquisition",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z",
  },
  {
    id: 2,
    name: "Sales",
    description: "Handles sales operations and customer relationships",
    created_at: "2024-01-10T09:15:00Z",
    updated_at: "2024-01-18T16:20:00Z",
  },
  {
    id: 3,
    name: "Customer Support",
    description: "Provides customer service and technical support",
    created_at: "2024-01-12T11:00:00Z",
    updated_at: "2024-01-19T13:30:00Z",
  },
  {
    id: 4,
    name: "Product Management",
    description: "Manages product development and strategy",
    created_at: "2024-01-14T15:30:00Z",
    updated_at: "2024-01-21T10:15:00Z",
  },
  {
    id: 5,
    name: "Finance",
    description: "Handles financial operations and budget management",
    created_at: "2024-01-08T08:45:00Z",
    updated_at: "2024-01-15T12:00:00Z",
  },
];

// Hardcoded team roles data
const hardcodedTeamRoles: ConfigurationItem[] = [
  {
    id: 1,
    name: "Campaign Manager",
    description: "Responsible for planning and executing marketing campaigns",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z",
  },
  {
    id: 2,
    name: "Content Creator",
    description: "Creates and manages content for campaigns",
    created_at: "2024-01-10T09:15:00Z",
    updated_at: "2024-01-18T16:20:00Z",
  },
  {
    id: 3,
    name: "Data Analyst",
    description: "Analyzes campaign performance and provides insights",
    created_at: "2024-01-12T11:00:00Z",
    updated_at: "2024-01-19T13:30:00Z",
  },
  {
    id: 4,
    name: "Designer",
    description: "Creates visual assets and designs for campaigns",
    created_at: "2024-01-14T15:30:00Z",
    updated_at: "2024-01-21T10:15:00Z",
  },
];

// Hardcoded line of business data
const hardcodedLineOfBusiness: ConfigurationItem[] = [
  {
    id: 1,
    name: "GSM",
    description:
      "Global System for Mobile Communications - Mobile network services",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z",
  },
  {
    id: 2,
    name: "Internet",
    description:
      "Internet and broadband services for residential and business customers",
    created_at: "2024-01-10T09:15:00Z",
    updated_at: "2024-01-18T16:20:00Z",
  },
  {
    id: 3,
    name: "Fixed Line",
    description: "Traditional landline telephone services",
    created_at: "2024-01-12T11:00:00Z",
    updated_at: "2024-01-19T13:30:00Z",
  },
  {
    id: 4,
    name: "Enterprise Solutions",
    description: "Business telecommunications and IT solutions",
    created_at: "2024-01-14T15:30:00Z",
    updated_at: "2024-01-21T10:15:00Z",
  },
  {
    id: 5,
    name: "Digital Services",
    description: "Digital transformation and cloud services",
    created_at: "2024-01-08T08:45:00Z",
    updated_at: "2024-01-15T12:00:00Z",
  },
];

// Campaign Objectives Configuration
export const campaignObjectivesConfig: ConfigurationPageConfig = {
  // Page configuration
  title: "Campaign Objectives",
  subtitle: "Define and manage your campaign objectives",
  entityName: "objective",
  entityNamePlural: "objectives",
  configType: "campaignObjectives",

  // Navigation
  backPath: "/dashboard/configuration",

  // UI
  icon: Flag,
  searchPlaceholder: "Search objectives by name or description...",

  // Data
  initialData: hardcodedObjectives,

  // Labels
  createButtonText: "Create Objective",
  modalTitle: {
    create: "Create New Campaign Objective",
    edit: "Edit Campaign Objective",
  },
  nameLabel: "Objective Name",
  nameRequired: true,
  descriptionLabel: "Description",
  descriptionRequired: false,

  // Validation
  nameMaxLength: 100,
  descriptionMaxLength: 500,

  // Messages
  deleteConfirmTitle: "Delete Objective",
  deleteConfirmMessage: (name: string) =>
    `Are you sure you want to delete "${name}"? This action cannot be undone.`,
  deleteSuccessMessage: (name: string) =>
    `"${name}" has been deleted successfully.`,
  createSuccessMessage: "Objective created successfully",
  updateSuccessMessage: "Objective updated successfully",
  deleteErrorMessage: "Failed to delete objective",
  saveErrorMessage: "Please try again later.",
};

// Departments Configuration
export const departmentsConfig: ConfigurationPageConfig = {
  // Page configuration
  title: "Departments",
  subtitle: "Define and manage your departments",
  entityName: "department",
  entityNamePlural: "departments",
  configType: "departments",

  // Navigation
  backPath: "/dashboard/configuration",

  // UI
  icon: Building2,
  searchPlaceholder: "Search departments by name or description...",

  // Data
  initialData: hardcodedDepartments,

  // Labels
  createButtonText: "Create Department",
  modalTitle: {
    create: "Create New Department",
    edit: "Edit Department",
  },
  nameLabel: "Department Name",
  nameRequired: true,
  descriptionLabel: "Description",
  descriptionRequired: false,

  // Validation
  nameMaxLength: 100,
  descriptionMaxLength: 500,

  // Messages
  deleteConfirmTitle: "Delete Department",
  deleteConfirmMessage: (name: string) =>
    `Are you sure you want to delete "${name}"? This action cannot be undone.`,
  deleteSuccessMessage: (name: string) =>
    `"${name}" has been deleted successfully.`,
  createSuccessMessage: "Department created successfully",
  updateSuccessMessage: "Department updated successfully",
  deleteErrorMessage: "Failed to delete department",
  saveErrorMessage: "Please try again later.",
};

// Team Roles Configuration
export const teamRolesConfig: ConfigurationPageConfig = {
  // Page configuration
  title: "Team Roles",
  subtitle: "Define and manage team roles and responsibilities",
  entityName: "role",
  entityNamePlural: "roles",

  // Navigation
  backPath: "/dashboard/configuration",

  // UI
  icon: Users,
  searchPlaceholder: "Search roles by name or description...",

  // Data
  initialData: hardcodedTeamRoles,

  // Labels
  createButtonText: "Create Role",
  modalTitle: {
    create: "Create New Team Role",
    edit: "Edit Team Role",
  },
  nameLabel: "Role Name",
  nameRequired: true,
  descriptionLabel: "Role Description",
  descriptionRequired: true,

  // Validation
  nameMaxLength: 80,
  descriptionMaxLength: 300,

  // Messages
  deleteConfirmTitle: "Delete Role",
  deleteConfirmMessage: (name: string) =>
    `Are you sure you want to delete the role "${name}"? This action cannot be undone.`,
  deleteSuccessMessage: (name: string) =>
    `Role "${name}" has been deleted successfully.`,
  createSuccessMessage: "Team role created successfully",
  updateSuccessMessage: "Team role updated successfully",
  deleteErrorMessage: "Failed to delete team role",
  saveErrorMessage: "Please try again later.",
};

// Line of Business Configuration
export const lineOfBusinessConfig: ConfigurationPageConfig = {
  // Page configuration
  title: "Line of Business",
  subtitle: "Define and manage your business lines and services",
  entityName: "business line",
  entityNamePlural: "business lines",
  configType: "lineOfBusiness",

  // Navigation
  backPath: "/dashboard/configuration",

  // UI
  icon: Briefcase,
  searchPlaceholder: "Search business lines by name or description...",

  // Data
  initialData: hardcodedLineOfBusiness,

  // Labels
  createButtonText: "Create Business Line",
  modalTitle: {
    create: "Create New Line of Business",
    edit: "Edit Line of Business",
  },
  nameLabel: "Business Line Name",
  nameRequired: true,
  descriptionLabel: "Description",
  descriptionRequired: false,

  // Validation
  nameMaxLength: 100,
  descriptionMaxLength: 500,

  // Messages
  deleteConfirmTitle: "Delete Business Line",
  deleteConfirmMessage: (name: string) =>
    `Are you sure you want to delete "${name}"? This action cannot be undone.`,
  deleteSuccessMessage: (name: string) =>
    `"${name}" has been deleted successfully.`,
  createSuccessMessage: "Business line created successfully",
  updateSuccessMessage: "Business line updated successfully",
  deleteErrorMessage: "Failed to delete business line",
  saveErrorMessage: "Please try again later.",
};

// Hardcoded offer types data
const hardcodedOfferTypes: TypeConfigurationItem[] = [
  {
    id: 1,
    name: "Data",
    description: "Data bundle offers and packages",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    isActive: true,
  },
  {
    id: 2,
    name: "Voice",
    description: "Voice call offers and packages",
    created_at: "2024-01-16T09:15:00Z",
    updated_at: "2024-01-16T09:15:00Z",
    isActive: true,
  },
  {
    id: 3,
    name: "SMS",
    description: "SMS text message offers and packages",
    created_at: "2024-01-17T11:00:00Z",
    updated_at: "2024-01-17T11:00:00Z",
    isActive: true,
  },
  {
    id: 4,
    name: "Combo",
    description: "Combined data, voice, and SMS packages",
    created_at: "2024-01-18T15:30:00Z",
    updated_at: "2024-01-18T15:30:00Z",
    isActive: true,
  },
  {
    id: 5,
    name: "Voucher",
    description: "Voucher-based offers and discounts",
    created_at: "2024-01-19T08:45:00Z",
    updated_at: "2024-01-19T08:45:00Z",
    isActive: true,
  },
  {
    id: 6,
    name: "Loyalty",
    description: "Loyalty program offers and rewards",
    created_at: "2024-01-20T14:20:00Z",
    updated_at: "2024-01-20T14:20:00Z",
    isActive: true,
  },
  {
    id: 7,
    name: "Bundle",
    description: "Product or service bundle packages",
    created_at: "2024-01-21T10:15:00Z",
    updated_at: "2024-01-21T10:15:00Z",
    isActive: true,
  },
  {
    id: 8,
    name: "Bonus",
    description: "Bonus value and extra benefits",
    created_at: "2024-01-22T12:00:00Z",
    updated_at: "2024-01-22T12:00:00Z",
    isActive: true,
  },
];

// Hardcoded campaign types data
const hardcodedCampaignTypes: TypeConfigurationItem[] = [
  {
    id: 1,
    name: "Multiple Target Group",
    description:
      "Target multiple segments with different offers for each segment",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    isActive: true,
  },
  {
    id: 2,
    name: "Champion-Challenger",
    description: "Test challenger strategies against a champion segment",
    created_at: "2024-01-16T09:15:00Z",
    updated_at: "2024-01-16T09:15:00Z",
    isActive: true,
  },
  {
    id: 3,
    name: "A/B Test",
    description: "Compare two variants (A and B) with equal distribution",
    created_at: "2024-01-17T11:00:00Z",
    updated_at: "2024-01-17T11:00:00Z",
    isActive: true,
  },
  {
    id: 4,
    name: "Round Robin",
    description: "Sequential offer rotation based on time intervals",
    created_at: "2024-01-18T15:30:00Z",
    updated_at: "2024-01-18T15:30:00Z",
    isActive: true,
  },
  {
    id: 5,
    name: "Multiple Level",
    description: "Conditional offer mapping with behavioral triggers",
    created_at: "2024-01-19T08:45:00Z",
    updated_at: "2024-01-19T08:45:00Z",
    isActive: true,
  },
];

// Hardcoded segment types data
const hardcodedSegmentTypes: TypeConfigurationItem[] = [
  {
    id: 1,
    name: "Static",
    description:
      "Manually curated member lists that remain fixed until explicitly updated",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    isActive: true,
  },
  {
    id: 2,
    name: "Dynamic",
    description:
      "Rule-driven segments that recalculate membership based on the latest customer data",
    created_at: "2024-01-16T09:15:00Z",
    updated_at: "2024-01-16T09:15:00Z",
    isActive: true,
  },
  {
    id: 3,
    name: "Predictive",
    description:
      "Model-led segments produced by machine learning scoring or propensity models",
    created_at: "2024-01-17T11:00:00Z",
    updated_at: "2024-01-17T11:00:00Z",
    isActive: true,
  },
  {
    id: 4,
    name: "Behavioral",
    description:
      "Segments based on customer activity signals like recency, frequency, or channel engagement",
    created_at: "2024-01-18T15:30:00Z",
    updated_at: "2024-01-18T15:30:00Z",
    isActive: true,
  },
  {
    id: 5,
    name: "Demographic",
    description:
      "Grouping built around demographic attributes such as age, region, or income band",
    created_at: "2024-01-19T08:45:00Z",
    updated_at: "2024-01-19T08:45:00Z",
    isActive: true,
  },
  {
    id: 6,
    name: "Geographic",
    description:
      "Location-based segmentation using country, region, or site-level metadata",
    created_at: "2024-01-20T14:20:00Z",
    updated_at: "2024-01-20T14:20:00Z",
    isActive: true,
  },
  {
    id: 7,
    name: "Transactional",
    description:
      "Built using spend, frequency, or specific purchase patterns from billing and POS systems",
    created_at: "2024-01-21T10:15:00Z",
    updated_at: "2024-01-21T10:15:00Z",
    isActive: true,
  },
];

// Hardcoded product types data
const hardcodedProductTypes: TypeConfigurationItem[] = [
  {
    id: 1,
    name: "Data Products",
    description:
      "Mobile data bundles, internet packages, and data-related services",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    isActive: true,
    metadataValue: 25,
  },
  {
    id: 2,
    name: "Voice Products",
    description: "Call minutes, voice packages, and communication services",
    created_at: "2024-01-16T09:15:00Z",
    updated_at: "2024-01-16T09:15:00Z",
    isActive: true,
    metadataValue: 18,
  },
  {
    id: 3,
    name: "SMS Products",
    description: "Text messaging packages and SMS-based services",
    created_at: "2024-01-17T11:00:00Z",
    updated_at: "2024-01-17T11:00:00Z",
    isActive: true,
    metadataValue: 12,
  },
  {
    id: 4,
    name: "Value Added Services",
    description:
      "Additional services like music streaming, gaming, and content",
    created_at: "2024-01-18T15:30:00Z",
    updated_at: "2024-01-18T15:30:00Z",
    isActive: true,
    metadataValue: 8,
  },
  {
    id: 5,
    name: "Device Products",
    description: "Mobile devices, accessories, and hardware products",
    created_at: "2024-01-19T08:45:00Z",
    updated_at: "2024-01-19T08:45:00Z",
    isActive: false,
    metadataValue: 5,
  },
];

// Offer Types Configuration
export const offerTypesConfig: TypeConfigurationPageConfig = {
  // Page configuration
  title: "Offer Types",
  subtitle:
    "Define and manage different types of offers available in your system",
  entityName: "offer type",
  entityNamePlural: "offer types",
  configType: "offerTypes",

  // Navigation
  backPath: "/dashboard/configuration",

  // UI
  icon: Tag,
  searchPlaceholder: "Search offer types by name or description...",

  // Data
  initialData: hardcodedOfferTypes,

  // Labels
  createButtonText: "Create Offer Type",
  modalTitle: {
    create: "Create New Offer Type",
    edit: "Edit Offer Type",
  },
  nameLabel: "Offer Type Name",
  nameRequired: true,
  descriptionLabel: "Description",
  descriptionRequired: false,

  // Validation
  nameMaxLength: 100,
  descriptionMaxLength: 500,

  // Messages
  deleteConfirmTitle: "Delete Offer Type",
  deleteConfirmMessage: (name: string) =>
    `Are you sure you want to delete "${name}"? This action cannot be undone.`,
  deleteSuccessMessage: (name: string) =>
    `"${name}" has been deleted successfully.`,
  createSuccessMessage: "Offer type created successfully",
  updateSuccessMessage: "Offer type updated successfully",
  deleteErrorMessage: "Failed to delete offer type",
  saveErrorMessage: "Please try again later.",
};

// Campaign Types Configuration
export const campaignTypesConfig: TypeConfigurationPageConfig = {
  // Page configuration
  title: "Campaign Types",
  subtitle:
    "Define and manage different types of campaigns available in your system",
  entityName: "campaign type",
  entityNamePlural: "campaign types",
  configType: "campaignTypes",

  // Navigation
  backPath: "/dashboard/configuration",

  // UI
  icon: Megaphone,
  searchPlaceholder: "Search campaign types by name or description...",

  // Data
  initialData: hardcodedCampaignTypes,

  // Labels
  createButtonText: "Create Campaign Type",
  modalTitle: {
    create: "Create New Campaign Type",
    edit: "Edit Campaign Type",
  },
  nameLabel: "Campaign Type Name",
  nameRequired: true,
  descriptionLabel: "Description",
  descriptionRequired: false,

  // Validation
  nameMaxLength: 100,
  descriptionMaxLength: 500,

  // Messages
  deleteConfirmTitle: "Delete Campaign Type",
  deleteConfirmMessage: (name: string) =>
    `Are you sure you want to delete "${name}"? This action cannot be undone.`,
  deleteSuccessMessage: (name: string) =>
    `"${name}" has been deleted successfully.`,
  createSuccessMessage: "Campaign type created successfully",
  updateSuccessMessage: "Campaign type updated successfully",
  deleteErrorMessage: "Failed to delete campaign type",
  saveErrorMessage: "Please try again later.",
};

// Segment Types Configuration
export const segmentTypesConfig: TypeConfigurationPageConfig = {
  // Page configuration
  title: "Segment Types",
  subtitle:
    "Define and manage different types of segments available in your system",
  entityName: "segment type",
  entityNamePlural: "segment types",
  configType: "segmentTypes",

  // Navigation
  backPath: "/dashboard/configuration",

  // UI
  icon: Layers,
  searchPlaceholder: "Search segment types by name or description...",

  // Data
  initialData: hardcodedSegmentTypes,

  // Labels
  createButtonText: "Create Segment Type",
  modalTitle: {
    create: "Create New Segment Type",
    edit: "Edit Segment Type",
  },
  nameLabel: "Segment Type Name",
  nameRequired: true,
  descriptionLabel: "Description",
  descriptionRequired: false,

  // Validation
  nameMaxLength: 100,
  descriptionMaxLength: 500,

  // Messages
  deleteConfirmTitle: "Delete Segment Type",
  deleteConfirmMessage: (name: string) =>
    `Are you sure you want to delete "${name}"? This action cannot be undone.`,
  deleteSuccessMessage: (name: string) =>
    `"${name}" has been deleted successfully.`,
  createSuccessMessage: "Segment type created successfully",
  updateSuccessMessage: "Segment type updated successfully",
  deleteErrorMessage: "Failed to delete segment type",
  saveErrorMessage: "Please try again later.",
};

// Product Types Configuration
export const productTypesConfig: TypeConfigurationPageConfig = {
  title: "Product Types",
  subtitle: "Define and manage different types of products in your catalog",
  entityName: "product type",
  entityNamePlural: "product types",
  configType: "productTypes",
  backPath: "/dashboard/products",
  icon: Briefcase,
  searchPlaceholder: "Search product types by name or description...",
  initialData: hardcodedProductTypes,
  createButtonText: "Create Product Type",
  modalTitle: {
    create: "Create New Product Type",
    edit: "Edit Product Type",
  },
  nameLabel: "Product Type Name",
  nameRequired: true,
  descriptionLabel: "Description",
  descriptionRequired: false,
  nameMaxLength: 120,
  descriptionMaxLength: 600,
  statusLabel: "Status",
  metadataField: {
    label: "Associated Products",
    type: "number",
    placeholder: "Enter number of products",
  },
  deleteConfirmTitle: "Delete Product Type",
  deleteConfirmMessage: (name: string) =>
    `Are you sure you want to delete "${name}"? This action cannot be undone.`,
  deleteSuccessMessage: (name: string) =>
    `"${name}" has been deleted successfully.`,
  createSuccessMessage: "Product type created successfully",
  updateSuccessMessage: "Product type updated successfully",
  deleteErrorMessage: "Failed to delete product type",
  saveErrorMessage: "Please try again later.",
};

// Helper function to create new configuration easily
export function createConfigurationPageConfig(
  overrides: Partial<ConfigurationPageConfig>
): ConfigurationPageConfig {
  return {
    // Default values
    title: "Configuration",
    subtitle: "Manage configuration items",
    entityName: "item",
    entityNamePlural: "items",
    backPath: "/dashboard/configuration",
    icon: Flag,
    searchPlaceholder: "Search items...",
    initialData: [],
    createButtonText: "Create Item",
    modalTitle: {
      create: "Create New Item",
      edit: "Edit Item",
    },
    nameLabel: "Name",
    nameRequired: true,
    descriptionLabel: "Description",
    descriptionRequired: false,
    nameMaxLength: 100,
    descriptionMaxLength: 500,
    deleteConfirmTitle: "Delete Item",
    deleteConfirmMessage: (name: string) =>
      `Are you sure you want to delete "${name}"?`,
    deleteSuccessMessage: (name: string) =>
      `"${name}" has been deleted successfully.`,
    createSuccessMessage: "Item created successfully",
    updateSuccessMessage: "Item updated successfully",
    deleteErrorMessage: "Failed to delete item",
    saveErrorMessage: "Please try again later.",

    // Apply overrides
    ...overrides,
  };
}
