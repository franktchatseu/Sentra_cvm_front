export interface Settings {
  country: string;
  country_code: string;
  language: string;
  timezone: string;
  date_format: string;
  currency: string;
  number_formatting: string;
}

export type GetSettingsResponse = {
  success: boolean;
  data: Settings;
  message?: string;
};

export type UpdateSettingsRequest = {
  country?: string;
  country_code?: string;
  language?: string;
  timezone?: string;
  date_format?: string;
  currency?: string;
  number_formatting?: string;
};

export type UpdateSettingsResponse = {
  success: boolean;
  data: Settings;
  message?: string;
};
