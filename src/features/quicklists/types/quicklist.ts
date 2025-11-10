export interface QuickList {
  id: number;
  name: string;
  description?: string | null;
  upload_type: string;
  file_name?: string;
  file_hash?: string;
  file_size?: number;
  row_count?: number;
  column_count?: number;
  columns?: string[];
  created_at: string;
  created_by: string;
  updated_at?: string;
}

export interface UploadType {
  upload_type: string;
  description?: string | null;
  expected_columns: string[];
  allow_extra_columns: boolean;
  require_all_columns: boolean;
  max_file_size_mb: number;
  cache_ttl_seconds: number;
  is_active: boolean;
  created_at?: string;
  created_by?: string;
}

export interface QuickListData {
  id: number;
  quicklist_id: number;
  created_at: string;
  // Dynamic columns - all other fields are column data
  [key: string]: unknown;
}

export interface ImportLog {
  id: number;
  quicklist_id: number;
  row_number: number;
  status: 'success' | 'failed' | 'skipped';
  error_message?: string | null;
  created_at: string;
}

export interface QuickListResponse {
  success: boolean;
  data: QuickList[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  message?: string;
  source?: string;
}

export interface SingleQuickListResponse {
  success: boolean;
  data: QuickList;
  message?: string;
  source?: string;
}

export interface QuickListDataResponse {
  success: boolean;
  data: QuickListData[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  message?: string;
  source?: string;
}

export interface ImportLogsResponse {
  success: boolean;
  data: ImportLog[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  message?: string;
  source?: string;
}

export interface UploadTypesResponse {
  success: boolean;
  data: UploadType[];
  message?: string;
  source?: string;
}

export interface CreateQuickListRequest {
  file: File;
  upload_type: string;
  name: string;
  description?: string;
  created_by: string;
}

export interface UpdateQuickListRequest {
  name?: string;
  description?: string | null;
}

export interface QuickListStats {
  total_quicklists: number;
  total_rows: number;
  total_size_bytes: number;
  by_upload_type: {
    upload_type: string;
    count: number;
    total_rows: number;
  }[];
  by_created_by: {
    created_by: string;
    count: number;
  }[];
}

export interface QuickListStatsResponse {
  success: boolean;
  data: QuickListStats;
  message?: string;
  source?: string;
}
