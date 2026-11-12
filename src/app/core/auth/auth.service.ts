import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { apiErrorMessage } from '../api/api-error';
import { catchError, finalize, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../api/api.config';
import { AccountUser, AuthResponse, RegisterRequest, SessionTokens } from './auth.models';
import { canAccessAdministration } from './account-permissions';

const STORAGE_KEY = 'plus.session.v1';

@Injectable({providedIn: 'root'})
export class AuthService {
  // Auth requests bypass the interceptor to avoid recursive refresh attempts.
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly base = inject(API_BASE_URL);
  private readonly router = inject(Router);
  private readonly tokens = signal<SessionTokens | null>(null);
  private readonly account = signal<AccountUser | null>(null);
  private persistent = false;
  private revision = 0;
  private refreshRequest?: Observable<string>;
  private accountRequest?: Observable<AccountUser>;
  readonly user = this.account.asReadonly();
  readonly canAdmin = computed(() => {
    const user = this.account();
    return !!user && ['administrador', 'representante', 'moderador'].includes(user.primary_role) && canAccessAdministration(user.permissions);
  });
  readonly canCitizen = computed(() => this.account()?.primary_role === 'ciudadano' && !canAccessAdministration(this.account()?.permissions));
  readonly busy = signal(false);
  readonly logoutError = signal('');
  constructor() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
      this.persistent = localStorage.getItem(STORAGE_KEY) !== null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.access === 'string' && typeof parsed.refresh === 'string') this.tokens.set(parsed);
      }
    } catch {this.clear();}
  }
  accessToken() {return this.tokens()?.access ?? null;}
  hasSession() {return !!this.tokens();}
  defaultRoute() {return this.canAdmin() ? '/admin' : this.canCitizen() ? '/ciudadano' : '/acceso-denegado';}
  login(correo: string, password: string, remember: boolean) {
    return this.http.post<AuthResponse>(`${this.base}/auth/login/`, {correo, password}).pipe(tap(response => this.accept(response, remember)));
  }
  register(payload: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.base}/auth/register/`, payload).pipe(tap(response => this.accept(response, false)));
  }
  ensureUser(): Observable<AccountUser | null> {
    if (!this.hasSession()) return of(null);
    if (this.user()) return of(this.user());
    if (this.accountRequest) return this.accountRequest;
    const revision = this.revision;
    this.accountRequest = this.fetchUser().pipe(
      catchError(error => error instanceof HttpErrorResponse && error.status === 401
        ? this.refresh().pipe(switchMap(() => this.fetchUser())) : throwError(() => error)),
      catchError(error => {
        if (revision === this.revision && error instanceof HttpErrorResponse && error.status === 401) this.clear();
        return throwError(() => error);
      }),
      tap(user => {
        if (revision !== this.revision) throw new HttpErrorResponse({status: 401});
        this.account.set(user);
      }),
      finalize(() => {if (revision === this.revision) this.accountRequest = undefined;}), shareReplay({bufferSize: 1, refCount: false}),
    );
    return this.accountRequest;
  }
  private fetchUser() {
    return this.http.get<AccountUser>(`${this.base}/me/`, {headers: {Authorization: `Bearer ${this.accessToken()}`}});
  }
  refresh(): Observable<string> {
    if (this.refreshRequest) return this.refreshRequest;
    const tokens = this.tokens();
    const revision = this.revision;
    if (!tokens) return throwError(() => new HttpErrorResponse({status: 401}));
    this.refreshRequest = this.http.post<SessionTokens>(`${this.base}/auth/refresh/`, {refresh: tokens.refresh}).pipe(
      map(response => {
        if (revision !== this.revision) throw new HttpErrorResponse({status: 401});
        this.store({access: response.access, refresh: response.refresh || tokens.refresh});
        return response.access;
      }),
      catchError(error => {
        if (revision === this.revision && error instanceof HttpErrorResponse && [400, 401, 403].includes(error.status)) this.clear();
        return throwError(() => error);
      }),
      finalize(() => {if (revision === this.revision) this.refreshRequest = undefined;}), shareReplay({bufferSize: 1, refCount: false}),
    );
    return this.refreshRequest;
  }
  logout() {
    if (this.busy()) return;
    this.busy.set(true); this.logoutError.set('');
    this.http.post(`${this.base}/auth/logout/`, {}, {headers: {Authorization: `Bearer ${this.accessToken()}`}}).pipe(
      catchError(error => error instanceof HttpErrorResponse && error.status === 401
        ? this.refresh().pipe(switchMap(access => this.http.post(`${this.base}/auth/logout/`, {}, {headers: {Authorization: `Bearer ${access}`}})))
        : throwError(() => error)),
      finalize(() => this.busy.set(false)),
    ).subscribe({next: () => {this.clear(); void this.router.navigate(['/login']);}, error: error => {
      // Keep the session available for a retry when server revocation could not be confirmed.
      if (!this.hasSession()) void this.router.navigate(['/login']);
      else this.logoutError.set(apiErrorMessage(error));
    }});
  }
  updateUser(user: AccountUser) {this.account.set(user);}
  clear() {
    this.revision++;
    this.tokens.set(null); this.account.set(null);
    this.accountRequest = undefined; this.refreshRequest = undefined;
    try {localStorage.removeItem(STORAGE_KEY); sessionStorage.removeItem(STORAGE_KEY);} catch { /* Memory-only session. */ }
  }
  requestPasswordReset(correo: string) {return this.http.post<{message: string}>(`${this.base}/auth/password-reset/request/`, {correo});}
  validateReset(payload: {uid?: string; token: string}) {return this.http.post<{valid: boolean}>(`${this.base}/auth/password-reset/validate/`, payload);}
  confirmReset(payload: {uid?: string; token: string; new_password: string; new_password_confirm: string}) {
    return this.http.post(`${this.base}/auth/password-reset/confirm/`, payload).pipe(tap(() => this.clear()));
  }
  private accept(response: AuthResponse, persistent: boolean) {
    this.clear(); this.persistent = persistent; this.store(response.tokens); this.account.set(response.user);
  }
  private store(tokens: SessionTokens) {
    this.tokens.set(tokens);
    try {(this.persistent ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify({access: tokens.access, refresh: tokens.refresh}));} catch { /* Memory-only session. */ }
  }
}
