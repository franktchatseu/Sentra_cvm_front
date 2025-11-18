import { Flag, Building2, Users, Briefcase } from "lucide-react";
import {
  ConfigurationPageConfig,
  ConfigurationItem,
} from "../components/GenericConfigurationPage";

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
