import { InjectionToken } from '@angular/core';

// Same-origin in production; Angular's development proxy forwards /api locally.
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {providedIn: 'root', factory: () => '/api/v1'});
