import { API_CONFIG, getAuthHeaders } from '../../../shared/services/api';
import { Program, CreateProgramRequest, UpdateProgramRequest, ProgramResponse } from '../types/program';

const BASE_URL = `${API_CONFIG.BASE_URL}/programs`;

class ProgramService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${BASE_URL}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                body: errorBody,
                url,
            });
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
        }

        return response.json();
    }

    async getAllPrograms(params?: {
        search?: string;
        page?: number;
        pageSize?: number;
        sortBy?: 'id' | 'name' | 'description' | 'created_at';
        sortDirection?: 'ASC' | 'DESC';
        skipCache?: boolean;
    }): Promise<ProgramResponse> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, String(value));
                }
            });
        }
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return this.request<ProgramResponse>(`/all${query}`);
    }

    async getProgramById(id: number | string, skipCache?: boolean): Promise<Program> {
        const query = skipCache ? '?skipCache=true' : '';
        return this.request<Program>(`/${id}?searchBy=id${query}`);
    }

    async getProgramByName(name: string, skipCache?: boolean): Promise<Program> {
        const query = skipCache ? '&skipCache=true' : '';
        return this.request<Program>(`/${encodeURIComponent(name)}?searchBy=name${query}`);
    }

    async createProgram(request: CreateProgramRequest): Promise<Program> {
        return this.request<Program>('/create', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async updateProgram(id: number, request: UpdateProgramRequest): Promise<Program> {
        return this.request<Program>(`/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(request),
        });
    }

    async deleteProgram(id: number): Promise<void> {
        return this.request<void>(`/delete/${id}`, {
            method: 'DELETE',
        });
    }
}

export const programService = new ProgramService();
export default programService;

