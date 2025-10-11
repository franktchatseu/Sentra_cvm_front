export interface Program {
    id: string | number;
    name: string;
    description?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface CreateProgramRequest {
    name: string;
    description?: string | null;
}

export interface UpdateProgramRequest {
    name?: string;
    description?: string | null;
}

export interface ProgramResponse {
    success: boolean;
    message: string;
    data: Program[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
        sortBy?: string;
        sortDirection?: string;
        isCachedResponse?: boolean;
        cacheDurationSec?: number;
    };
}

