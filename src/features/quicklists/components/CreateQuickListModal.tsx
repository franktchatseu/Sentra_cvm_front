import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';
import { UploadType } from '../types/quicklist';

interface CreateQuickListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, uploadType: string, name: string, description?: string) => Promise<void>;
  uploadTypes: UploadType[];
}

export default function CreateQuickListModal({
  isOpen,
  onClose,
  onSubmit,
  uploadTypes,
}: CreateQuickListModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        setFile(null);
        return;
      }

      // Validate file size (get max from selected upload type)
      const selectedUploadType = uploadTypes.find((t) => t.upload_type === uploadType);
      const maxSizeMB = selectedUploadType?.max_file_size_mb || 10;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (selectedFile.size > maxSizeBytes) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        setFile(null);
        return;
      }

      setFile(selectedFile);
      if (!name) {
        // Auto-fill name from filename
        const filename = selectedFile.name.replace(/\.[^/.]+$/, '');
        setName(filename);
      }
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!uploadType) {
      setError('Please select an upload type');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(file, uploadType, name.trim(), description.trim() || undefined);
      handleClose();
    } catch (err) {
      console.error('Failed to create quicklist:', err);
      setError(err instanceof Error ? err.message : 'Failed to create QuickList');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploadType('');
    setName('');
    setDescription('');
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className={`${tw.subHeading} text-gray-900`}>Upload QuickList</h2>
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
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Upload Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Type *
              </label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting}
              >
                <option value="">Select upload type</option>
                {uploadTypes.map((type) => (
                  <option key={type.upload_type} value={type.upload_type}>
                    {type.upload_type}
                    {type.description && ` - ${type.description}`}
                  </option>
                ))}
              </select>
              {uploadType && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Expected columns:</strong>{' '}
                    {uploadTypes
                      .find((t) => t.upload_type === uploadType)
                      ?.expected_columns.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excel File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting || !uploadType}
                />
                {file ? (
                  <div className="space-y-3">
                    <FileText className="w-12 h-12 mx-auto text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      disabled={isSubmitting}
                    >
                      Change file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        disabled={isSubmitting || !uploadType}
                      >
                        Click to upload
                      </button>
                      <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Excel files (.xlsx, .xls) up to{' '}
                      {uploadTypes.find((t) => t.upload_type === uploadType)?.max_file_size_mb || 10}MB
                    </p>
                  </div>
                )}
              </div>
              {!uploadType && (
                <p className="text-xs text-gray-500 mt-2">Please select an upload type first</p>
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
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  (e.target as HTMLButtonElement).style.backgroundColor = color.interactive.hover;
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = color.primary.action;
              }}
            >
              {isSubmitting ? 'Uploading...' : 'Upload QuickList'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
