import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Database,
  FileText,
  Settings as SettingsIcon,
  ListChecks,
} from "lucide-react";
import { tw, color } from "../../../shared/utils/utils";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { CustomerIdentityField } from "../types/customerIdentity";
import { customerIdentityService } from "../services/customerIdentityService";

type LocationState = {
  field?: CustomerIdentityField;
};

export default function CustomerIdentityFieldDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const initialField = (location.state as LocationState | undefined)?.field;

  const [field, setField] = useState<CustomerIdentityField | null>(
    initialField ?? null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialField);
  const [error, setError] = useState<string | null>(null);

  const fieldId = useMemo(() => {
    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [id]);

  const loadField = useCallback(async () => {
    if (fieldId == null) {
      setError("Invalid field identifier.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const fields = await customerIdentityService.getCustomerIdentityFields();
      const matchedField = fields.find((candidate) => candidate.id === fieldId);

      if (!matchedField) {
        setError("Field not found.");
        setField(null);
        return;
      }

      setField(matchedField);
    } catch (err) {
      console.error("Failed to load customer identity field", err);
      const message =
        err instanceof Error ? err.message : "Unable to load field details.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [fieldId]);

  useEffect(() => {
    if (!initialField) {
      loadField();
    }
  }, [initialField, loadField]);

  const handleBack = () => {
    navigate("/dashboard/customer-identity");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <div>
          <h1 className={`${tw.mainHeading} text-gray-900`}>
            {field ? field.field_name : "Field Details"}
          </h1>
          <p className={`${tw.textSecondary} mt-1 text-sm`}>
            Unique field identifier{" "}
            <span style={{ color: color.primary.accent }}>
              {field?.id ?? id}
            </span>
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-md p-12 flex items-center justify-center">
          <LoadingSpinner variant="modern" size="lg" color="primary" />
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Unable to load field
          </h3>
          <p className={`${tw.textSecondary}`}>{error}</p>
          <button
            type="button"
            onClick={loadField}
            className="px-4 py-2 text-sm font-semibold text-white rounded-md hover:opacity-95 transition-colors"
            style={{ backgroundColor: color.primary.action }}
          >
            Retry
          </button>
        </div>
      ) : field ? (
        <div className="space-y-6">
          <section className="bg-white border border-gray-200 rounded-md p-6 space-y-4">
            <h2 className={`${tw.cardHeading} text-gray-900`}>
              Field Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard
                icon={<Database className="h-5 w-5 text-white" />}
                title="Core Metadata"
                items={[
                  {
                    label: "Field Name",
                    value: field.field_name,
                  },
                  {
                    label: "Field Value",
                    value: field.field_value,
                  },
                  {
                    label: "Description",
                    value: field.description || "—",
                  },
                ]}
              />
              <InfoCard
                icon={<FileText className="h-5 w-5 text-white" />}
                title="Type Information"
                items={[
                  { label: "Field Type", value: field.field_type },
                  { label: "Postgres Type", value: field.field_pg_type || "—" },
                  {
                    label: "Type Precision",
                    value:
                      field.field_type_precision != null
                        ? String(field.field_type_precision)
                        : "—",
                  },
                ]}
              />
              <InfoCard
                icon={<SettingsIcon className="h-5 w-5 text-white" />}
                title="Source & Validation"
                items={[
                  { label: "Source Table", value: field.source_table },
                  {
                    label: "Validation Strategy",
                    value: field.validation?.strategy || "none",
                  },
                  {
                    label: "Value Length",
                    value:
                      field.validation?.value_length != null
                        ? String(field.validation.value_length)
                        : "—",
                  },
                ]}
              />
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-md"
                style={{ backgroundColor: color.primary.accent }}
              >
                <ListChecks className="h-5 w-5 text-white" />
              </div>
              <h2 className={`${tw.cardHeading} text-gray-900`}>
                Operator Support
              </h2>
            </div>
            {field.operators.length === 0 ? (
              <p className={`${tw.textSecondary} text-sm`}>
                No operators configured for this field.
              </p>
            ) : (
              <div
                className="overflow-x-auto border rounded-md"
                style={{ borderColor: color.border.default }}
              >
                <table className="min-w-full bg-white">
                  <thead
                    className={`border-b ${tw.borderDefault}`}
                    style={{ background: color.surface.tableHeader }}
                  >
                    <tr>
                      {[
                        "Label",
                        "Symbol",
                        "Requires Value",
                        "Requires Two Values",
                        "Applicable Types",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider"
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
                    {field.operators.map((operator) => (
                      <tr key={operator.id} className="hover:bg-gray-50/40">
                        <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                          {operator.label}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-700">
                          {operator.symbol}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-700">
                          {operator.requires_value ? "Yes" : "No"}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-700">
                          {operator.requires_two_values ? "Yes" : "No"}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-700">
                          {operator.applicable_field_types.join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

type InfoCardItem = {
  label: string;
  value: string;
};

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  items: InfoCardItem[];
};

function InfoCard({ icon, title, items }: InfoCardProps) {
  return (
    <div className="border border-gray-200 rounded-md p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-md"
          style={{ backgroundColor: color.primary.accent }}
        >
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <dl className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {item.label}
            </dt>
            <dd className="text-sm text-gray-900 mt-1">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
