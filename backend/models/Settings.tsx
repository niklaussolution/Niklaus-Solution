export interface ISettings {
  id?: string;
  key: string;
  value: any;
  description?: string;
  updatedAt: number;
}

export const SETTINGS_COLLECTION = 'settings';

