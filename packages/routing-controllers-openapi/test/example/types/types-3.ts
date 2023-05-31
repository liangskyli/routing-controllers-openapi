import type { postBody1 } from './types';

export interface CustomizeExportByFilterRequest {
  a: Omit<postBody1, 'tow'>;
}
