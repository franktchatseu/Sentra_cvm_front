import { API_CONFIG, getAuthHeaders } from '../../../shared/services/api';
import { Program, CreateProgramRequest, UpdateProgramRequest, ProgramResponse, SingleProgramResponse } from '../types/program';

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
        limit?: number;
        offset?: number;
        skipCache?: boolean;
    }): Promise<ProgramResponse> {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.limit) queryParams.append('limit', String(params.limit));
            if (params.offset) queryParams.append('offset', String(params.offset));
            if (params.skipCache) queryParams.append('skipCache', 'true');
        }
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return this.request<ProgramResponse>(`${query}`);
    }

    async getProgramById(id: number, skipCache?: boolean): Promise<SingleProgramResponse> {
        const query = skipCache ? '?skipCache=true' : '';
        return this.request<SingleProgramResponse>(`/${id}${query}`);
    }

    async createProgram(request: CreateProgramRequest): Promise<SingleProgramResponse> {
        return this.request<SingleProgramResponse>('', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async updateProgram(id: number, request: UpdateProgramRequest): Promise<SingleProgramResponse> {
        return this.request<SingleProgramResponse>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(request),
        });
    }

    async deleteProgram(id: number): Promise<{ success: boolean; message?: string }> {
        return this.request<{ success: boolean; message?: string }>(`/${id}`, {
            method: 'DELETE',
        });
    }

    async activateProgram(id: number, updatedBy: number): Promise<SingleProgramResponse> {
        return this.request<SingleProgramResponse>(`/${id}/activate`, {
            method: 'PATCH',
            body: JSON.stringify({ updated_by: updatedBy }),
        });
    }

    async deactivateProgram(id: number, updatedBy: number): Promise<SingleProgramResponse> {
        return this.request<SingleProgramResponse>(`/${id}/deactivate`, {
            method: 'PATCH',
            body: JSON.stringify({ updated_by: updatedBy }),
        });
    }
}

export const programService = new ProgramService();
export default programService;

