import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../api/api.config';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const base = inject(API_BASE_URL);
  const api = new URL(base + '/', window.location.origin);
  const target = new URL(request.url, window.location.origin);
  if (target.origin !== api.origin || !target.pathname.startsWith(api.pathname)) return next(request);
  const auth = inject(AuthService);
  const router = inject(Router);
  const access = auth.accessToken();
  if (!access) return next(request);
  const send = (token: string) => request.clone({setHeaders: {Authorization: `Bearer ${token}`}});
  return next(send(access)).pipe(catchError(error => {
    if (!(error instanceof HttpErrorResponse) || error.status !== 401) return throwError(() => error);
    return auth.refresh().pipe(
      catchError(refreshError => {
        if (!auth.hasSession()) void router.navigate(['/sesion-vencida']);
        return throwError(() => refreshError);
      }),
      switchMap(token => next(send(token))),
    );
  }));
};
