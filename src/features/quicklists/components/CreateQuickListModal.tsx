import { useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Upload, FileText, AlertCircle, Download, Edit3 } from "lucide-react";
import * as XLSX from "xlsx";
import { color } from "../../../shared/utils/utils";
import { UploadType } from "../types/quicklist";
import HeadlessSelect from "../../../shared/components/ui/HeadlessSelect";

type InputMode = "file" | "manual";

interface CreateQuickListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: {
    file: File;
    upload_type: string;
    name: string;
    description?: string | null;
    created_by?: string | null;
    isManualEntry?: boolean;
  }) => Promise<void>;
  uploadTypes: UploadType[];
}

export default function CreateQuickListModal({
  isOpen,
  onClose,
  onSubmit,
  uploadTypes,
}: CreateQuickListModalProps) {
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [manualInput, setManualInput] = useState("");
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

    // Validation based on input mode
    if (inputMode === "file") {
      if (!file) {
        setError("Please select a file");
        return;
      }
    } else {
      // Manual mode validation
      if (!manualInput.trim()) {
        setError("Please enter at least one email or phone number");
        return;
      }
      if (manualInputValidation.validCount === 0) {
        setError("No valid emails or phone numbers found");
        return;
      }
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

      // Create file from manual input if in manual mode
      const fileToSubmit =
        inputMode === "manual" ? createFileFromManualInput() : file!;

      await onSubmit({
        file: fileToSubmit,
        upload_type: uploadType,
        name: name.trim(),
        description: description.trim() || null,
        created_by: null, // Will be set by backend based on auth
        isManualEntry: inputMode === "manual",
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
    setInputMode("file");
    setFile(null);
    setUploadType("");
    setName("");
    setDescription("");
    setManualInput("");
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

  // Validate manual input and count valid/invalid contacts
  const manualInputValidation = useMemo(() => {
    if (!manualInput.trim()) {
      return { valid: [], invalid: [], validCount: 0, invalidCount: 0 };
    }

    const lines = manualInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[0-9\s()-]{8,}$/;

    const valid: string[] = [];
    const invalid: string[] = [];

    lines.forEach((line) => {
      if (emailRegex.test(line) || phoneRegex.test(line)) {
        valid.push(line);
      } else {
        invalid.push(line);
      }
    });

    return {
      valid,
      invalid,
      validCount: valid.length,
      invalidCount: invalid.length,
    };
  }, [manualInput]);

  // Convert manual input to Excel file
  const createFileFromManualInput = (): File => {
    const selectedType = uploadTypes.find((t) => t.upload_type === uploadType);
    if (!selectedType) {
      throw new Error("Upload type not selected");
    }

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
      throw new Error("No expected columns defined for this upload type");
    }

    // Create worksheet data - start with header row
    const worksheetData: any[][] = [columns];

    // Find the appropriate column index for email and phone
    const emailColumnIndex = columns.findIndex((col) =>
      col.toLowerCase().includes("email")
    );
    const phoneColumnIndex = columns.findIndex((col) =>
      col.toLowerCase().includes("phone") || col.toLowerCase().includes("mobile")
    );

    // Add data rows - place contact in the appropriate column
    manualInputValidation.valid.forEach((contact) => {
      const row = new Array(columns.length).fill("");
      const isEmail = contact.includes("@");
      
      if (isEmail && emailColumnIndex !== -1) {
        // Place email in the email column
        row[emailColumnIndex] = contact;
      } else if (!isEmail && phoneColumnIndex !== -1) {
        // Place phone in the phone column (remove spaces)
        row[phoneColumnIndex] = contact.replace(/\s/g, "");
      } else {
        // Fallback: place in first column if no matching column found
        row[0] = isEmail ? contact : contact.replace(/\s/g, "");
      }
      
      worksheetData.push(row);
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

    // Generate Excel file as binary string
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Create a File object from the buffer
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    return new File([blob], `manual_input_${Date.now()}.xlsx`, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
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
        className="bg-white rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
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
                    <div className="mt-2 p-3 bg-blue-50 rounded-md">
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

            {/* Input Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Input Method *
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setInputMode("file")}
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 transition-all ${
                    inputMode === "file"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Upload className="w-5 h-5" />
                  <span className="font-medium">Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("manual")}
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 transition-all ${
                    inputMode === "manual"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Edit3 className="w-5 h-5" />
                  <span className="font-medium">Manual Entry</span>
                </button>
              </div>
            </div>

            {/* File Upload - Only show when file mode is selected */}
            {inputMode === "file" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excel File *
                </label>
                {uploadType ? (
                <label
                  htmlFor="quicklist-file-upload"
                  className={`block border-2 border-dashed border-gray-300 rounded-md p-6 text-center transition-colors ${
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
                      if (droppedFile && fileInputRef.current) {
                        // Create a DataTransfer object to properly simulate the file input change
                        const dt = new DataTransfer();
                        dt.items.add(droppedFile);
                        fileInputRef.current.files = dt.files;
                        // Trigger change event
                        const event = new Event('change', { bubbles: true });
                        fileInputRef.current.dispatchEvent(event);
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
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center opacity-50 cursor-not-allowed">
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
            )}

            {/* Manual Entry - Only show when manual mode is selected */}
            {inputMode === "manual" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Contacts Manually *
                </label>
                <textarea
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Enter emails or phone numbers (one per line)&#10;&#10;Example:&#10;john@example.com&#10;jane@example.com&#10;+33612345678&#10;+1234567890"
                  rows={10}
                  disabled={isSubmitting}
                />
                
                {/* Validation Summary */}
                {manualInput.trim() && (
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-green-700 font-medium">
                        {manualInputValidation.validCount} valid contact{manualInputValidation.validCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {manualInputValidation.invalidCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-red-700 font-medium">
                          {manualInputValidation.invalidCount} invalid
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Helper Text */}
                <p className="mt-2 text-xs text-gray-500">
                  Enter one email address or phone number per line. Valid formats: email@domain.com or +1234567890
                </p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QuickList Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a description for this QuickList"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !uploadType ||
                !name.trim() ||
                (inputMode === "file" && !file) ||
                (inputMode === "manual" && manualInputValidation.validCount === 0)
              }
              className="px-4 py-2 text-white rounded-md transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: color.primary.action }}
            >
              {isSubmitting
                ? inputMode === "file"
                  ? "Uploading..."
                  : "Creating..."
                : inputMode === "file"
                ? "Upload QuickList"
                : "Create QuickList"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
