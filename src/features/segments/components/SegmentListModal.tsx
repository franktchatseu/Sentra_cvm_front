import { useEffect, useRef, useState } from "react";
import { X, Upload, FileText, AlertCircle } from "lucide-react";
import { button as buttonTokens } from "../../../shared/utils/utils";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";

export type SegmentListFormValues = {
  list_id?: number;
  list_label: string;
  list_description: string;
  list_type: "seed" | "and" | "standard";
  subscriber_id_col_name: string;
  file_delimiter: string;
  file_text?: string;
  list_headers?: string;
  file_name?: string;
  file_size?: number;
};

interface SegmentListModalProps {
  isOpen: boolean;
  mode?: "create" | "edit";
  initialData?: Partial<SegmentListFormValues>;
  onClose: () => void;
  onSubmit: (values: SegmentListFormValues) => void;
  submitLabel?: string;
}

const defaultForm: SegmentListFormValues = {
  list_label: "",
  list_description: "",
  list_type: "standard",
  subscriber_id_col_name: "",
  file_delimiter: ",",
  list_headers: "",
  file_text: "",
};

const listTypeOptions: Array<{
  value: SegmentListFormValues["list_type"];
  label: string;
  description: string;
}> = [
  {
    value: "standard",
    label: "Standard",
    description: "General purpose lists for most campaigns",
  },
  {
    value: "seed",
    label: "Seed",
    description: "Internal QA or preview audiences",
  },
  {
    value: "and",
    label: "AND",
    description: "Intersect with existing segment logic",
  },
];

export default function SegmentListModal({
  isOpen,
  mode = "create",
  initialData,
  onClose,
  onSubmit,
  submitLabel,
}: SegmentListModalProps) {
  const [form, setForm] = useState<SegmentListFormValues>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCreateMode = mode === "create";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm({
      ...defaultForm,
      ...initialData,
      list_label: initialData?.list_label || "",
      list_description: initialData?.list_description || "",
      list_type: initialData?.list_type || "standard",
      subscriber_id_col_name: initialData?.subscriber_id_col_name || "",
      file_delimiter: initialData?.file_delimiter || ",",
      list_headers: initialData?.list_headers || "",
      file_text: initialData?.file_text || "",
      file_name: initialData?.file_name,
      file_size: initialData?.file_size,
    });
    setErrors({});
    setUploadedFile(null);

    // Reset the file input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [initialData, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleInputChange = (
    field: keyof SegmentListFormValues,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || "";
      const [headersLine] = content.split(/\r?\n/);

      // Extract filename without extension for list label
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

      setForm((prev) => ({
        ...prev,
        file_text: content,
        list_headers: headersLine || "",
        file_name: file.name,
        file_size: file.size,
        list_label: prev.list_label || fileNameWithoutExt,
      }));

      setErrors((prev) => ({ ...prev, file_text: "" }));
    };

    reader.readAsText(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setForm((prev) => ({
      ...prev,
      file_text: "",
      list_headers: "",
      file_name: "",
      file_size: undefined,
    }));
  };

  const validateForm = () => {
    const validationErrors: Record<string, string> = {};

    if (!form.list_label.trim()) {
      validationErrors.list_label = "List name is required.";
    }
    if (!form.list_description.trim()) {
      validationErrors.list_description = "Please provide a brief description.";
    }
    if (!form.subscriber_id_col_name.trim()) {
      validationErrors.subscriber_id_col_name =
        "Subscriber identifier column is required.";
    }
    if (!form.file_delimiter) {
      validationErrors.file_delimiter = "Select a delimiter.";
    }
    if (isCreateMode && !form.file_text) {
      validationErrors.file_text = "Upload a CSV, TXT, or XLSX file.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      ...form,
      list_label: form.list_label.trim(),
      list_description: form.list_description.trim(),
      subscriber_id_col_name: form.subscriber_id_col_name.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6"
      onClick={(e) => {
        if (e.currentTarget === e.target) {
          handleClose();
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-md bg-white shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              {isCreateMode ? "Create New List" : "Edit List"}
            </p>
            <h2 className="text-xl font-semibold text-gray-900">
              {isCreateMode ? "Build Your Segment List" : "Update Segment List"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isCreateMode
                ? "Upload a file or paste customer data to create a reusable list for campaigns."
                : "Make adjustments to your list details or upload an updated file."}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
        >
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-black mb-1 block">
                List Type
              </label>
              <HeadlessSelect
                options={listTypeOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                value={form.list_type}
                onChange={(value) =>
                  handleInputChange(
                    "list_type",
                    value as SegmentListFormValues["list_type"]
                  )
                }
                placeholder="Select list type..."
                error={!!errors.list_type}
              />
              {errors.list_type && (
                <p className="mt-1 text-xs text-red-500">{errors.list_type}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-black mb-1 block">
                Description
              </label>
              <textarea
                value={form.list_description}
                onChange={(e) =>
                  handleInputChange("list_description", e.target.value)
                }
                rows={4}
                placeholder="Describe who belongs in this list and how you'll use it."
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.list_description
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-[var(--primary-color,#5EC6B1)]"
                }`}
              />
              {errors.list_description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.list_description}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-black mb-1 block">
                Subscriber ID Column
              </label>
              <input
                type="text"
                value={form.subscriber_id_col_name}
                onChange={(e) =>
                  handleInputChange("subscriber_id_col_name", e.target.value)
                }
                placeholder="e.g., msisdn, email, customer_id"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.subscriber_id_col_name
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-[var(--primary-color,#5EC6B1)]"
                }`}
              />
              {errors.subscriber_id_col_name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.subscriber_id_col_name}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-black mb-1 block">
                File Delimiter
              </label>
              <select
                value={form.file_delimiter}
                onChange={(e) =>
                  handleInputChange("file_delimiter", e.target.value)
                }
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.file_delimiter
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-[var(--primary-color,#5EC6B1)]"
                }`}
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
              {errors.file_delimiter && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.file_delimiter}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-black mb-1 block">
                {isCreateMode ? "Upload Your File" : "Upload Replacement File"}
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Supported formats: CSV, TSV, TXT, or XLSX up to 10MB.
              </p>
              {!form.file_text && errors.file_text && (
                <div className="flex items-center text-sm text-red-500 mb-3">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  {errors.file_text}
                </div>
              )}

              {!form.file_text ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-md border border-gray-200 bg-gray-50 py-10 text-center cursor-pointer transition"
                >
                  <div className="rounded-full bg-white p-3 shadow-sm mb-3">
                    <Upload className="h-6 w-6 text-[var(--primary-color,#5EC6B1)]" />
                  </div>
                  <p className="font-semibold text-gray-900">
                    Drag & drop or choose a file
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-md border border-gray-200 bg-white p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-[var(--primary-color,#5EC6B1)]/10 p-2">
                        <FileText className="h-6 w-6 text-[var(--primary-color,#5EC6B1)]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {form.file_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {uploadedFile
                            ? `${(uploadedFile.size / 1024).toFixed(1)} KB`
                            : form.file_size
                            ? `${(form.file_size / 1024).toFixed(1)} KB`
                            : null}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-sm font-medium text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  {form.list_headers && (
                    <div>
                      <label className="text-sm font-medium text-black mb-1 block">
                        File Headers
                      </label>
                      <textarea
                        readOnly
                        value={form.list_headers}
                        rows={3}
                        className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 font-mono"
                      />
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.tsv,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-black mb-1 block">
                List Name
              </label>
              <input
                type="text"
                value={form.list_label}
                onChange={(e) =>
                  handleInputChange("list_label", e.target.value)
                }
                placeholder="e.g., High Value Customers"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.list_label
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-[var(--primary-color,#5EC6B1)]"
                }`}
              />
              {errors.list_label && (
                <p className="mt-1 text-xs text-red-500">{errors.list_label}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-sm font-semibold shadow-sm"
                style={{
                  backgroundColor: buttonTokens.action.background,
                  color: buttonTokens.action.color,
                  borderRadius: buttonTokens.action.borderRadius,
                  padding: `${buttonTokens.action.paddingY} ${buttonTokens.action.paddingX}`,
                }}
              >
                {submitLabel || (isCreateMode ? "Create List" : "Save Changes")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
