import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, FileText, AlertCircle, Download } from "lucide-react";
import { color, tw } from "../../../shared/utils/utils";
import { UploadType } from "../types/quicklist";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";

interface CreateQuickListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: {
    file: File;
    upload_type: string;
    name: string;
    description?: string | null;
    created_by?: string | null;
  }) => Promise<void>;
  uploadTypes: UploadType[];
}

export default function CreateQuickListModal({
  isOpen,
  onClose,
  onSubmit,
  uploadTypes,
}: CreateQuickListModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Please select a valid Excel file (.xlsx or .xls)");
        setFile(null);
        return;
      }

      // Validate file size (get max from selected upload type)
      const selectedUploadType = uploadTypes.find(
        (t) => t.upload_type === uploadType
      );
      if (!selectedUploadType) {
        setError("Please select an upload type first");
        setFile(null);
        return;
      }

      const maxSizeMB = selectedUploadType.max_file_size_mb || 10;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (selectedFile.size > maxSizeBytes) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        setFile(null);
        return;
      }

      setFile(selectedFile);
      if (!name) {
        // Auto-fill name from filename
        const filename = selectedFile.name.replace(/\.[^/.]+$/, "");
        setName(filename);
      }
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!uploadType) {
      setError("Please select an upload type");
      return;
    }

    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onSubmit({
        file,
        upload_type: uploadType,
        name: name.trim(),
        description: description.trim() || null,
        created_by: null, // Will be set by backend based on auth
      });
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create QuickList"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploadType("");
    setName("");
    setDescription("");
    setError("");
    setIsSubmitting(false);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const downloadTemplate = () => {
    if (!uploadType) return;

    const selectedType = uploadTypes.find((t) => t.upload_type === uploadType);
    if (!selectedType) return;

    // Get expected columns
    let columns: string[] = [];
    if (Array.isArray(selectedType.expected_columns)) {
      columns = selectedType.expected_columns;
    } else if (
      typeof selectedType.expected_columns === "object" &&
      selectedType.expected_columns !== null
    ) {
      columns = Object.keys(selectedType.expected_columns);
    }

    if (columns.length === 0) {
      return;
    }

    // Helper function to escape CSV values (handle commas, quotes, newlines)
    const escapeCsvValue = (value: string): string => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Create CSV content with BOM for Excel compatibility
    const BOM = "\uFEFF";
    const headerRow = columns.map(escapeCsvValue).join(",");
    // Add one empty example row
    const exampleRow = columns.map(() => "").join(",");
    const fullContent = BOM + headerRow + "\n" + exampleRow + "\n";

    // Create blob with UTF-8 encoding
    const blob = new Blob([fullContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${uploadType}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Upload QuickList
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload an Excel file to create a new customer list
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-6">
            {/* Upload Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Type *
              </label>
              <HeadlessSelect
                options={[
                  { value: "", label: "Select upload type" },
                  ...uploadTypes.map((type) => ({
                    value: type.upload_type,
                    label: type.description
                      ? `${type.upload_type} - ${type.description}`
                      : type.upload_type,
                  })),
                ]}
                value={uploadType}
                onChange={(value) => setUploadType(value as string)}
                placeholder="Select upload type"
                disabled={isSubmitting}
              />
              {uploadType &&
                (() => {
                  const selectedType = uploadTypes.find(
                    (t) => t.upload_type === uploadType
                  );
                  const expectedColumns = selectedType?.expected_columns;
                  const columnsDisplay = Array.isArray(expectedColumns)
                    ? expectedColumns.join(", ")
                    : typeof expectedColumns === "object" &&
                      expectedColumns !== null
                    ? Object.keys(expectedColumns).join(", ")
                    : "N/A";

                  return (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-blue-800 mb-2">
                            <strong>Expected columns:</strong> {columnsDisplay}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={downloadTemplate}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download Template
                        </button>
                      </div>
                    </div>
                  );
                })()}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excel File *
              </label>
              {uploadType ? (
                <label
                  htmlFor="quicklist-file-upload"
                  className={`block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors ${
                    isSubmitting
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:border-gray-400"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isSubmitting) {
                      e.currentTarget.classList.add("border-gray-400");
                    }
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove("border-gray-400");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove("border-gray-400");
                    if (!isSubmitting) {
                      const droppedFile = e.dataTransfer.files[0];
                      if (droppedFile) {
                        handleFileChange({
                          target: { files: [droppedFile] },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }
                    }
                  }}
                >
                  <input
                    id="quicklist-file-upload"
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  {file ? (
                    <div className="space-y-3">
                      <FileText className="w-12 h-12 mx-auto text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                      >
                        Change file
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 mx-auto text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Click to upload
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          or drag and drop
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Excel files (.xlsx, .xls) up to{" "}
                        {uploadTypes.find((t) => t.upload_type === uploadType)
                          ?.max_file_size_mb || 10}
                        MB
                      </p>
                    </div>
                  )}
                </label>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center opacity-50 cursor-not-allowed">
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <div className="space-y-3 mt-3">
                    <p className="text-sm font-medium text-gray-900">
                      Click to upload
                    </p>
                    <p className="text-xs text-gray-500">
                      Please select an upload type first
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QuickList Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a descriptive name"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a description for this QuickList"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !file || !uploadType || !name.trim()}
              className="px-4 py-2 text-white rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: color.primary.action }}
            >
              {isSubmitting ? "Uploading..." : "Upload QuickList"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
