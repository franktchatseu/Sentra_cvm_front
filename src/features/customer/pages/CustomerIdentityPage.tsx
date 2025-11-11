import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  type CSSProperties,
} from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye } from "lucide-react";
import { tw, color } from "../../../shared/utils/utils";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { customerIdentityService } from "../services/customerIdentityService";
import { CustomerIdentityField } from "../types/customerIdentity";
import { AlertTriangle } from "lucide-react";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";

export default function CustomerIdentityPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState<CustomerIdentityField[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFieldType, setSelectedFieldType] = useState<string>("all");

  const loadFields = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customerIdentityService.getCustomerIdentityFields();
      setFields(data);
    } catch (err) {
      console.error("Failed to load customer identity fields", err);
      const message =
        err instanceof Error ? err.message : "Unable to load fields";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  const availableFieldTypes = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(fields.map((field) => field.field_type).filter(Boolean))
    );
    return uniqueTypes.sort((a, b) => a.localeCompare(b));
  }, [fields]);

  const filteredFields = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return fields.filter((field) => {
      const matchesSearch =
        search.length === 0 ||
        field.field_name.toLowerCase().includes(search) ||
        field.field_value.toLowerCase().includes(search) ||
        (field.description || "").toLowerCase().includes(search) ||
        field.source_table.toLowerCase().includes(search);

      const matchesType =
        selectedFieldType === "all" ||
        field.field_type.toLowerCase() === selectedFieldType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [fields, searchTerm, selectedFieldType]);

  const hasNoFields = useMemo(() => {
    if (isLoading) return false;
    return fields.length === 0;
  }, [fields.length, isLoading]);

  const hasNoFilteredResults = useMemo(() => {
    if (isLoading || hasNoFields) return false;
    return filteredFields.length === 0;
  }, [filteredFields.length, hasNoFields, isLoading]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`${tw.mainHeading} text-gray-900`}>Customer Identity</h1>
        <p className={`${tw.textSecondary} mt-2 text-sm`}>
          Basic customer identification fields
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search fields..."
            className={`w-full pl-10 pr-4 py-3.5 text-sm rounded-lg border border-[${color.border.default}] focus:outline-none focus:ring-2`}
            style={
              {
                "--tw-ring-color": color.primary.accent,
              } as CSSProperties
            }
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <HeadlessSelect
            options={[
              { value: "all", label: "All field types" },
              ...availableFieldTypes.map((type) => ({
                value: type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
              })),
            ]}
            value={selectedFieldType}
            onChange={(value) => setSelectedFieldType(value as string)}
            placeholder="Filter by field type"
            className="sm:min-w-[200px]"
          />
        </div>
      </div>

      <div className="space-y-4">
        {(isLoading || error || hasNoFields || hasNoFilteredResults) && (
          <div
            className={`border rounded-2xl p-6`}
            style={{
              borderColor: color.border.default,
              backgroundColor: color.surface.background,
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner variant="modern" size="lg" color="primary" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <AlertTriangle className="h-10 w-10 text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Unable to load fields
                  </h3>
                  <p className={`${tw.textSecondary} mt-2`}>{error}</p>
                </div>
                <button
                  type="button"
                  onClick={loadFields}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-95 transition-colors"
                  style={{ backgroundColor: color.primary.action }}
                >
                  Retry
                </button>
              </div>
            ) : hasNoFields ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  No fields available
                </h3>
                <p className={`${tw.textSecondary}`}>
                  Customer identity fields will appear here once configured.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  No matching fields
                </h3>
                <p className={`${tw.textSecondary}`}>
                  Try adjusting your search or filter selections.
                </p>
              </div>
            )}
          </div>
        )}

        {!isLoading && !error && !hasNoFields && !hasNoFilteredResults && (
          <div
            className="overflow-x-auto border rounded-lg"
            style={{ borderColor: color.border.default }}
          >
            <table className="min-w-full bg-white">
              <thead
                className={`border-b ${tw.borderDefault}`}
                style={{ background: color.surface.tableHeader }}
              >
                <tr>
                  {[
                    "ID",
                    "Field Name",
                    "Field Type",
                    "Source Table",
                    "Description",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider"
                      style={{ color: color.surface.tableHeaderText }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className={`bg-white divide-y divide-[${color.border.default}]`}
              >
                {filteredFields.map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50/40">
                    <td className="px-6 py-4 text-sm">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/dashboard/customer-identity/fields/${field.id}`,
                            {
                              state: { field },
                            }
                          )
                        }
                        className="font-semibold hover:underline"
                        style={{ color: color.primary.accent }}
                      >
                        {field.id}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {field.field_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {field.field_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {field.source_table}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {field.description || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/dashboard/customer-identity/fields/${field.id}`,
                            {
                              state: { field },
                            }
                          )
                        }
                        className="p-2 rounded-lg text-white transition-colors"
                        style={{ backgroundColor: color.primary.accent }}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
