import {
  API_CONFIG,
  buildApiUrl,
  getAuthHeaders,
} from "../../../shared/services/api";
import {
  Settings,
  GetSettingsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
} from "../types/settings";

class SettingsService {
  async getSettings(): Promise<GetSettingsResponse> {
    const url = buildApiUrl("/settings");
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorBody}`
      );
    }

    return response.json();
  }

  async updateSettings(
    settings: UpdateSettingsRequest
  ): Promise<UpdateSettingsResponse> {
    const url = buildApiUrl("/settings");
    const response = await fetch(url, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorBody}`
      );
    }

    return response.json();
  }
}

export const settingsService = new SettingsService();
