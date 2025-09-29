export interface UpdateCampaignRequest {
  name?: string; // optional, 1-128 chars
  description?: string | null; // optional, max 1000 chars, can be null
  objective?: string | null; // optional, max 256 chars, can be null
  category_id?: number | null; // optional, positive integer, can be null
  program_id?: number | null; // optional, positive integer, can be null
  status?: 'draft' | 'approved' | 'active' | 'paused' | 'archived'; // optional
  approval_status?: 'pending' | 'approved' | 'rejected'; // optional
  start_date?: string | null; // optional, ISO date format, can be null
  end_date?: string | null; // optional, ISO date format, can be null
  owner_team?: string | null; // optional, max 64 chars, can be null
}

export interface UpdateCampaignResponse {
  id: number;
  name: string;
  description?: string | null;
  objective?: string | null;
  category_id?: number | null;
  program_id?: number | null;
  status: 'draft' | 'approved' | 'active' | 'paused' | 'archived';
  approval_status: 'pending' | 'approved' | 'rejected';
  start_date?: string | null;
  end_date?: string | null;
  owner_team?: string | null;
  created_at: string;
  updated_at: string;
}
