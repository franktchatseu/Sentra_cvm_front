export type CommunicationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';

export interface MessageTemplate {
  title?: string;
  body: string;
}

export interface ColumnCondition {
  column: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}

export interface CommunicationFilters {
  column_conditions: ColumnCondition[];
  limit?: number;
}

export interface SendCommunicationRequest {
  source_type: 'quicklist';
  source_id: number;
  channels: CommunicationChannel[];
  message_template: MessageTemplate;
  filters?: CommunicationFilters;
  batch_size?: number;
  created_by?: number;
}

export interface ChannelSummary {
  channel: CommunicationChannel;
  messages_sent: number;
  messages_failed: number;
}

export interface CommunicationResult {
  execution_id: string;
  source_type: string;
  source_id: number;
  total_recipients: number;
  total_messages_attempted: number;
  total_messages_sent: number;
  total_messages_failed: number;
  execution_time_ms: number;
  channel_summaries: ChannelSummary[];
}

export interface SendCommunicationResponse {
  success: boolean;
  data: CommunicationResult;
}
