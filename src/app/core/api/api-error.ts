import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'No se pudo completar la solicitud. Inténtalo de nuevo.';
  if (error.status === 0) return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  if (error.status >= 500) return 'El servicio no está disponible temporalmente. Inténtalo de nuevo.';
  const body = error.error;
  const fields = body && typeof body === 'object' ? body.errors : null;
  const details = fields && typeof fields === 'object'
    ? Object.values(fields).flat().filter((value): value is string => typeof value === 'string').join(' ') : '';
  return details || body?.message || body?.detail || (error.status === 401 ? 'La sesión o las credenciales no son válidas.' : 'No se pudo completar la solicitud.');
}
