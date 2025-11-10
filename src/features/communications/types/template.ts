import { CommunicationChannel } from './communication';

export interface MessageTemplate {
  id: string;
  name: string;
  description?: string;
  channel: CommunicationChannel;
  subject?: string; // For EMAIL only
  body: string; // HTML content with formatting
  isRichText: boolean; // If true, body contains HTML
  variables: string[]; // Variables used in the template
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  templates: MessageTemplate[];
}
