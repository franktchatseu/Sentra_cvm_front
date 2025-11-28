import { useState, useEffect, useMemo } from "react";
import {
  User,
  Save,
  Mail,
  Phone,
  Clock,
  Shield,
  X,
  CheckCircle,
} from "lucide-react";
import { userService } from "../services/userService";
import { UserType, UpdateUserRequest } from "../types/user";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { color, tw, button } from "../../../shared/utils/utils";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";

const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
];

export default function UserProfilePage() {
  const { user: authUser } = useAuth();
  const { success, error: showError } = useToast();

  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserRequest>({
    first_name: "",
    last_name: "",
    middle_name: null,
    preferred_name: null,
    email_address: "",
    phone_number: null,
    department: null,
    job_title: null,
    timezone: "",
    language_preference: "",
  });

  useEffect(() => {
    if (authUser?.user_id) {
      loadUserProfile();
    } else {
      setIsLoading(false);
      showError(
        "Error",
        "User information not available. Please log in again."
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const loadUserProfile = async () => {
    if (!authUser?.user_id) return;

    try {
      setIsLoading(true);
      const response = await userService.getUserById(authUser.user_id);

      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        setFormData({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          middle_name: userData.middle_name || null,
          preferred_name: userData.preferred_name || null,
          email_address: userData.email_address || userData.email || "",
          phone_number: userData.phone_number || null,
          department: userData.department || null,
          job_title: userData.job_title || null,
          timezone: userData.timezone || "",
          language_preference: userData.language_preference || "",
        });
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      showError(
        "Error",
        "Failed to load user profile. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const nullableFields = useMemo(
    () =>
      new Set([
        "middle_name",
        "preferred_name",
        "phone_number",
        "department",
        "job_title",
        "language_preference",
      ]),
    []
  );

  const languageLookup = useMemo(() => {
    return languageOptions.reduce<Record<string, string>>((acc, option) => {
      acc[option.value] = option.label;
      return acc;
    }, {});
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        value === "" && nullableFields.has(name)
          ? (null as string | null)
          : value,
    }));
  };

  const handleSelectChange = (name: keyof UpdateUserRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value || null,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const response = await userService.updateUser(user.id, formData);

      if (response.success) {
        setUser(response.data);
        setIsEditing(false);
        success(
          "Profile Updated",
          "Your profile has been updated successfully."
        );
        // Reload profile to get latest data
        await loadUserProfile();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      showError("Error", "Failed to update profile. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        middle_name: user.middle_name || null,
        preferred_name: user.preferred_name || null,
        email_address: user.email_address || user.email || "",
        phone_number: user.phone_number || null,
        department: user.department || null,
        job_title: user.job_title || null,
        timezone: user.timezone || "",
        language_preference: user.language_preference || "",
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString?: string | null, includeTime = false) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return includeTime
      ? date.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-yellow-100 text-yellow-800";
      case "locked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner variant="modern" size="xl" color="primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load user profile.</p>
      </div>
    );
  }

  const statusValue =
    (user.account_status || user.status || "unknown")?.toLowerCase() ??
    "unknown";
  const statusLabel =
    statusValue === "unknown"
      ? "Status Unknown"
      : statusValue
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");
  const lastLoginValue = user.last_login_at || user.last_login || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${tw.textPrimary}`}>My Profile</h1>
          <p className={`text-sm ${tw.textSecondary} mt-1`}>
            Manage your personal information and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: button.action.background,
                  color: button.action.color,
                  borderRadius: button.action.borderRadius,
                  padding: `${button.action.paddingY} ${button.action.paddingX}`,
                }}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner variant="modern" size="sm" color="white" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 inline mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: button.action.background,
                color: button.action.color,
                borderRadius: button.action.borderRadius,
                padding: `${button.action.paddingY} ${button.action.paddingX}`,
              }}
            >
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Profile Header */}
        <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: color.primary.accent }}
            >
              {user.first_name?.[0]?.toUpperCase() || ""}
              {user.last_name?.[0]?.toUpperCase() || ""}
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${tw.textPrimary}`}>
                {user.first_name} {user.middle_name} {user.last_name}
                {user.preferred_name && (
                  <span className="text-gray-500 font-normal ml-2">
                    ({user.preferred_name})
                  </span>
                )}
              </h2>
              <p className={`text-sm ${tw.textSecondary} mt-1`}>
                {user.email_address || user.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    statusValue
                  )}`}
                >
                  {statusLabel}
                </span>
                {user.role_name && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {user.role_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>
              Personal Information
            </h3>

            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1`}
              >
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className={`text-sm ${tw.textPrimary}`}>
                  {user.first_name || "N/A"}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1`}
              >
                Middle Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className={`text-sm ${tw.textPrimary}`}>
                  {user.middle_name || "N/A"}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1`}
              >
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className={`text-sm ${tw.textPrimary}`}>
                  {user.last_name || "N/A"}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1`}
              >
                Preferred Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="preferred_name"
                  value={formData.preferred_name || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className={`text-sm ${tw.textPrimary}`}>
                  {user.preferred_name || "N/A"}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1 flex items-center gap-2`}
              >
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email_address"
                  value={formData.email_address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className={`text-sm ${tw.textPrimary}`}>
                  {user.email_address || user.email || "N/A"}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1 flex items-center gap-2`}
              >
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className={`text-sm ${tw.textPrimary}`}>
                  {user.phone_number || "N/A"}
                </p>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>
              Professional Information
            </h3>

            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1`}
              >
                Department
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="department"
                  value={formData.department || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className={`text-sm ${tw.textPrimary}`}>
                  {user.department || "N/A"}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1`}
              >
                Job Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className={`text-sm ${tw.textPrimary}`}>
                  {user.job_title || "N/A"}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1`}
              >
                Timezone
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  placeholder="e.g., UTC, America/New_York"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className={`text-sm ${tw.textPrimary}`}>
                  {user.timezone || "N/A"}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1`}
              >
                Language Preference
              </label>
              {isEditing ? (
                <HeadlessSelect
                  options={languageOptions}
                  value={formData.language_preference || ""}
                  onChange={(value) =>
                    handleSelectChange(
                      "language_preference",
                      (value as string) || ""
                    )
                  }
                  placeholder="Select language"
                  searchable
                />
              ) : (
                <p className={`text-sm ${tw.textPrimary}`}>
                  {languageLookup[user.language_preference ?? ""] ||
                    user.language_preference?.toUpperCase() ||
                    "N/A"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Account Information (Read-only) */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className={`text-lg font-semibold ${tw.textPrimary} mb-4`}>
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1`}
              >
                Username
              </label>
              <p className={`text-sm ${tw.textPrimary}`}>{user.username}</p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1 flex items-center gap-2`}
              >
                <Shield className="w-4 h-4" />
                Data Access Level
              </label>
              <p className={`text-sm ${tw.textPrimary}`}>
                {user.data_access_level || "N/A"}
              </p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1 flex items-center gap-2`}
              >
                <CheckCircle className="w-4 h-4" />
                PII Access
              </label>
              <p className={`text-sm ${tw.textPrimary}`}>
                {user.can_access_pii || user.pii_access ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1 flex items-center gap-2`}
              >
                <Clock className="w-4 h-4" />
                Last Login
              </label>
              <p className={`text-sm ${tw.textPrimary}`}>
                {formatDate(lastLoginValue, true)}
              </p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1`}
              >
                Account Created
              </label>
              <p className={`text-sm ${tw.textPrimary}`}>
                {formatDate(user.created_at)}
              </p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${tw.textSecondary} mb-1`}
              >
                Last Updated
              </label>
              <p className={`text-sm ${tw.textPrimary}`}>
                {formatDate(user.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
