import { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface ListUploadProps {
  onListDataChange: (listData: {
    list_description?: string;
    list_type?: 'seed' | 'and' | 'standard';
    subscriber_id_col_name?: string;
    file_delimiter?: string;
    file_text?: string;
    list_label?: string;
    list_headers?: string;
  }) => void;
  listData?: {
    list_description?: string;
    list_type?: 'seed' | 'and' | 'standard';
    subscriber_id_col_name?: string;
    file_delimiter?: string;
    file_text?: string;
    list_label?: string;
    list_headers?: string;
  };
}

export default function ListUpload({ onListDataChange, listData }: ListUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const headers = lines[0];

        onListDataChange({
          ...listData,
          file_text: content,
          list_headers: headers,
          list_label: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        });
      };
      reader.readAsText(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onListDataChange({
      ...listData,
      file_text: '',
      list_headers: '',
      list_label: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    onListDataChange({
      ...listData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-medium text-blue-900">List Configuration</h4>

      {/* List Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          List Type
        </label>
        <select
          value={listData?.list_type || 'standard'}
          onChange={(e) => handleInputChange('list_type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
        >
          <option value="seed">Seed</option>
          <option value="and">And</option>
          <option value="standard">Standard</option>
        </select>
      </div>

      {/* List Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={listData?.list_description || ''}
          onChange={(e) => handleInputChange('list_description', e.target.value)}
          placeholder="Enter list description"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
        />
      </div>

      {/* Subscriber ID Column Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subscriber ID Column Name
        </label>
        <input
          type="text"
          value={listData?.subscriber_id_col_name || ''}
          onChange={(e) => handleInputChange('subscriber_id_col_name', e.target.value)}
          placeholder="e.g., email, user_id, phone"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
        />
      </div>

      {/* File Delimiter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          File Delimiter
        </label>
        <select
          value={listData?.file_delimiter || ','}
          onChange={(e) => handleInputChange('file_delimiter', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
        >
          <option value=",">Comma (,)</option>
          <option value=";">Semicolon (;)</option>
          <option value="\t">Tab</option>
          <option value="|">Pipe (|)</option>
        </select>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload List File
        </label>

        {!uploadedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Click to upload CSV, TXT, or Excel file
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: .csv, .txt, .xlsx
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">
                {uploadedFile.name}
              </span>
              <span className="text-xs text-gray-500">
                ({(uploadedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              onClick={removeFile}
              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt,.xlsx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* List Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          List Label
        </label>
        <input
          type="text"
          value={listData?.list_label || ''}
          onChange={(e) => handleInputChange('list_label', e.target.value)}
          placeholder="Enter a label for this list"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
        />
      </div>

      {/* Headers Preview */}
      {listData?.list_headers && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File Headers
          </label>
          <div className="p-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-700">
            {listData.list_headers}
          </div>
        </div>
      )}
    </div>
  );
}
