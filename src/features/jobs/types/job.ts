export interface Job {
  id: number;
  name: string;
  type?: string;
  status: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JobType {
  id: number;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
}

export interface JobTypeListResponse {
  data: JobType[];
  count?: number;
  success?: boolean;
}

export interface JobTypeSearchResponse {
  success: boolean;
  data: JobType[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  source?: "cache" | "database" | "database-forced";
}

export interface CreateJobTypePayload {
  name: string;
  code: string;
  description?: string | null;
}

export interface UpdateJobTypePayload {
  name?: string;
  code?: string;
  description?: string | null;
}
