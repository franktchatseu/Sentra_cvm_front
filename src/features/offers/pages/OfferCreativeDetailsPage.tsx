import { useEffect, useState, ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { offerCreativeService } from "../services/offerCreativeService";
import { OfferCreative } from "../types/offerCreative";
import { color, tw } from "../../../shared/utils/utils";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { useToast } from "../../../contexts/ToastContext";

const DetailItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div>
    <p className={`text-sm font-medium ${tw.textMuted} mb-1`}>{label}</p>
    <div className={`text-base ${tw.textPrimary}`}>{value}</div>
  </div>
);

export default function OfferCreativeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const [creative, setCreative] = useState<OfferCreative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Creative ID is missing.");
      setLoading(false);
      return;
    }

    const loadCreative = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await offerCreativeService.getById(Number(id), true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const creativeData = (response as any).data || response;
        setCreative(creativeData);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to load offer creative details.";
        setError(message);
        showError("Failed to load creative", message);
      } finally {
        setLoading(false);
      }
    };

    loadCreative();
  }, [id, showError]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewOffer = () => {
    if (creative?.offer_id) {
      navigate(`/dashboard/offers/${creative.offer_id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="text-sm font-medium hover:underline"
            style={{ color: color.primary.accent }}
          >
            Back
          </button>
          <h1 className={`${tw.cardHeading} mt-2`}>Offer Creative Details</h1>
          <p className={`${tw.textSecondary}`}>
            Review the latest information for this offer creative.
          </p>
        </div>
        {creative?.offer_id && (
          <button
            type="button"
            onClick={handleViewOffer}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: color.primary.action }}
          >
            View Offer
          </button>
        )}
      </div>

      <div
        className={`bg-white rounded-xl border border-[${color.border.default}] p-6`}
      >
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className={`text-sm ${tw.textMuted}`}>{error}</p>
          </div>
        ) : !creative ? (
          <div className="text-center py-12">
            <p className={`text-sm ${tw.textMuted}`}>
              This creative could not be found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Creative ID" value={creative.id ?? "—"} />
              <DetailItem
                label="Offer ID"
                value={
                  creative.offer_id ? (
                    <button
                      type="button"
                      onClick={handleViewOffer}
                      className="font-medium hover:underline"
                      style={{ color: color.primary.accent }}
                    >
                      {creative.offer_id}
                    </button>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailItem label="Channel" value={creative.channel} />
              <DetailItem label="Locale" value={creative.locale || "—"} />
              <DetailItem
                label="Status"
                value={
                  creative.is_active ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                      Inactive
                    </span>
                  )
                }
              />
              <DetailItem
                label="Version"
                value={creative.version ? `v${creative.version}` : "—"}
              />
              <DetailItem
                label="Created"
                value={
                  creative.created_at
                    ? new Date(creative.created_at).toLocaleString()
                    : "—"
                }
              />
              <DetailItem
                label="Last Updated"
                value={
                  creative.updated_at
                    ? new Date(creative.updated_at).toLocaleString()
                    : "—"
                }
              />
            </div>

            <div className="space-y-4">
              <DetailItem
                label="Title"
                value={
                  creative.title || (
                    <span className={`text-sm ${tw.textMuted}`}>
                      No title provided
                    </span>
                  )
                }
              />
              <DetailItem
                label="Text Body"
                value={
                  creative.text_body ? (
                    <p className={`whitespace-pre-line ${tw.textPrimary}`}>
                      {creative.text_body}
                    </p>
                  ) : (
                    <span className={`text-sm ${tw.textMuted}`}>
                      No text content provided
                    </span>
                  )
                }
              />
              {(creative.channel === "Email" || creative.channel === "Web") && (
                <DetailItem
                  label="HTML Body"
                  value={
                    creative.html_body ? (
                      <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto">
                        {creative.html_body}
                      </pre>
                    ) : (
                      <span className={`text-sm ${tw.textMuted}`}>
                        No HTML content provided
                      </span>
                    )
                  }
                />
              )}
              <DetailItem
                label="Variables"
                value={
                  creative.variables &&
                  Object.keys(creative.variables || {}).length > 0 ? (
                    <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto">
                      {JSON.stringify(creative.variables, null, 2)}
                    </pre>
                  ) : (
                    <span className={`text-sm ${tw.textMuted}`}>
                      No variables defined
                    </span>
                  )
                }
              />
              <DetailItem
                label="Default Values"
                value={
                  creative.default_values &&
                  Object.keys(creative.default_values || {}).length > 0 ? (
                    <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto">
                      {JSON.stringify(creative.default_values, null, 2)}
                    </pre>
                  ) : (
                    <span className={`text-sm ${tw.textMuted}`}>
                      No default values defined
                    </span>
                  )
                }
              />
              <DetailItem
                label="Required Variables"
                value={
                  creative.required_variables &&
                  creative.required_variables.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {creative.required_variables.map((variable) => (
                        <li key={variable}>{variable}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className={`text-sm ${tw.textMuted}`}>
                      No required variables
                    </span>
                  )
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
