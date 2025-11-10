import { API_CONFIG, getAuthHeaders } from '../../../shared/services/api';
import {
  SendCommunicationRequest,
  SendCommunicationResponse,
} from '../types/communication';

const BASE_URL = `${API_CONFIG.BASE_URL}/communications`;

class CommunicationService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Communication API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url,
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Send a communication to QuickList recipients
   */
  async sendCommunication(
    request: SendCommunicationRequest
  ): Promise<SendCommunicationResponse> {
    console.log('Sending communication:', request);
    return this.request<SendCommunicationResponse>('/send', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const communicationService = new CommunicationService();
