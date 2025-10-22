import { useState, useRef } from 'react';
import { Upload, FileText, X, Search, Plus, List } from 'lucide-react';
import { color, tw } from '../../../shared/utils/utils';

interface ExistingList {
  list_id: number;
  name: string;
  description: string;
  subscriber_count: number;
  created_on: string;
  list_type: 'seed' | 'and' | 'standard';
}

interface ListUploadProps {
  onListDataChange: (listData: {
    list_id?: number;
    list_description?: string;
    list_type?: 'seed' | 'and' | 'standard';
    subscriber_id_col_name?: string;
    file_delimiter?: string;
    file_text?: string;
    list_label?: string;
    list_headers?: string;
    mode?: 'existing' | 'new';
  }) => void;
  listData?: {
    list_id?: number;
    list_description?: string;
    list_type?: 'seed' | 'and' | 'standard';
    subscriber_id_col_name?: string;
    file_delimiter?: string;
    file_text?: string;
    list_label?: string;
    list_headers?: string;
    mode?: 'existing' | 'new';
  };
  hideExistingLists?: boolean;
  showCreateButton?: boolean;
}

export default function ListUpload({ onListDataChange, listData, hideExistingLists = false, showCreateButton = false }: ListUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'existing' | 'new'>(listData?.mode || 'existing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedList, setSelectedList] = useState<ExistingList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock existing lists - in real app, this would come from API
  const existingLists: ExistingList[] = [
    {
      list_id: 1,
      name: 'High Value Customers',
      description: 'Customers with lifetime value > $1000',
      subscriber_count: 2543,
      created_on: '2024-01-15',
      list_type: 'standard'
    },
    {
      list_id: 2,
      name: 'Email Subscribers',
      description: 'All active email subscribers',
      subscriber_count: 15678,
      created_on: '2024-02-01',
      list_type: 'standard'
    },
    {
      list_id: 3,
      name: 'VIP Members',
      description: 'Premium tier customers',
      subscriber_count: 892,
      created_on: '2024-01-20',
      list_type: 'seed'
    },
    {
      list_id: 4,
      name: 'Recent Purchasers',
      description: 'Customers who purchased in last 30 days',
      subscriber_count: 3421,
      created_on: '2024-02-10',
      list_type: 'standard'
    }
  ];

  const filteredLists = existingLists.filter(list =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    list.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleModeChange = (newMode: 'existing' | 'new') => {
    setMode(newMode);
    onListDataChange({
      ...listData,
      mode: newMode,
      // Clear data when switching modes
      list_id: undefined,
      list_description: '',
      list_label: '',
      file_text: '',
      list_headers: ''
    });
    setSelectedList(null);
    setUploadedFile(null);
  };

  const handleListSelection = (list: ExistingList) => {
    setSelectedList(list);
    onListDataChange({
      ...listData,
      mode: 'existing',
      list_id: list.list_id,
      list_description: list.description,
      list_label: list.name,
      list_type: list.list_type
    });
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-gray-200" style={{ backgroundColor: `${color.primary.accent}10` }}>
      <h4 className={`font-medium ${tw.textPrimary}`}>List Configuration</h4>

      {/* Mode Selection */}
      {!hideExistingLists && (
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => handleModeChange('existing')}
            className="flex items-center px-4 py-2 rounded-lg font-medium transition-colors text-white"
            style={{
              backgroundColor: mode === 'existing' ? color.primary.action : 'transparent',
              color: mode === 'existing' ? 'white' : color.primary.action,
              border: `2px solid ${color.primary.action}`
            }}
            onMouseEnter={(e) => {
              if (mode !== 'existing') {
                (e.target as HTMLButtonElement).style.backgroundColor = `${color.primary.action}10`;
              }
            }}
            onMouseLeave={(e) => {
              if (mode !== 'existing') {
                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            <List className="w-4 h-4 mr-2" />
            Select Existing List
          </button>
          <button
            onClick={() => handleModeChange('new')}
            className="flex items-center px-4 py-2 rounded-lg font-medium transition-colors text-white"
            style={{
              backgroundColor: mode === 'new' ? color.primary.action : 'transparent',
              color: mode === 'new' ? 'white' : color.primary.action,
              border: `2px solid ${color.primary.action}`
            }}
            onMouseEnter={(e) => {
              if (mode !== 'new') {
                (e.target as HTMLButtonElement).style.backgroundColor = `${color.primary.action}10`;
              }
            }}
            onMouseLeave={(e) => {
              if (mode !== 'new') {
                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New List
          </button>
        </div>
      )}

      {mode === 'existing' && !hideExistingLists ? (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lists by name or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          {/* List Results */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredLists.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchQuery ? 'No lists found matching your search' : 'No lists available'}
              </div>
            ) : (
              filteredLists.map((list) => (
                <div
                  key={list.list_id}
                  onClick={() => handleListSelection(list)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedList?.list_id === list.list_id
                    ? 'bg-white'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  style={{
                    borderColor: selectedList?.list_id === list.list_id ? color.primary.action : tw.borderDefault
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{list.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{list.subscriber_count.toLocaleString()} subscribers</span>
                        <span className="capitalize">{list.list_type}</span>
                        <span>Created {new Date(list.created_on).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedList && (
            <div className="p-3 rounded-lg border" style={{ backgroundColor: `${color.status.success}/10`, borderColor: color.status.success }}>
              <p className="text-sm" style={{ color: color.status.success }}>
                <strong>Selected:</strong> {selectedList.name} ({selectedList.subscriber_count.toLocaleString()} subscribers)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none resize-none"
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
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors"
                style={{
                  borderColor: tw.borderDefault
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLDivElement).style.borderColor = color.primary.action;
                  (e.target as HTMLDivElement).style.backgroundColor = `${color.primary.action}05`;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLDivElement).style.borderColor = tw.borderDefault;
                  (e.target as HTMLDivElement).style.backgroundColor = 'transparent';
                }}
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
                  <FileText className="w-5 h-5" style={{ color: color.primary.action }} />
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

          {/* Create List Button - Only show when showCreateButton is true */}
          {showCreateButton && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => onListDataChange(listData || {})}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: color.primary.action }}
              >
                Create List
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
