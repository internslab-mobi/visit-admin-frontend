import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

const AUTH_URL = 'http://localhost:8093/api/auth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  userId: string;
  employeeId: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  mustChangePassword: boolean;
}

export interface LoginResponse {
  userId: string;
  role: string;
  mustChangePassword: boolean;
  user: UserResponse;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly currentUserSignal = signal<LoginResponse | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();

  private restoration$: Observable<boolean> | null = null;
  private refreshInFlight$: Observable<LoginResponse> | null = null;

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.fetchCsrfToken().pipe(
      switchMap((csrfToken) =>
        this.http.post<LoginResponse>(`${AUTH_URL}/login`, request, {
          withCredentials: true,
          headers: new HttpHeaders({
            'X-AUTH-CSRF': csrfToken,
          }),
        }),
      ),
      tap((response) => {
        if (!response.mustChangePassword && this.hasAllowedRole(response)) {
          this.currentUserSignal.set(response);
        } else {
          this.currentUserSignal.set(null);
        }
      }),
    );
  }

  restoreSession(): Observable<boolean> {
    // Already authenticated in this Angular app session.
    if (this.currentUserSignal()) {
      return of(true);
    }

    // Avoid rotating refresh tokens on every route navigation.
    if (!this.restoration$) {
      this.restoration$ = this.fetchCsrfToken().pipe(
        switchMap((csrfToken) =>
          this.http.post<LoginResponse>(
            `${AUTH_URL}/refresh`,
            {},
            {
              withCredentials: true,
              headers: new HttpHeaders({
                'X-AUTH-CSRF': csrfToken,
              }),
            },
          ),
        ),
        map((response) => {
          const allowed = !response.mustChangePassword && this.hasAllowedRole(response);

          this.currentUserSignal.set(allowed ? response : null);

          return allowed;
        }),
        catchError(() => of(false)),
        shareReplay(1),
      );
    }

    return this.restoration$;
  }
  refreshSession(): Observable<LoginResponse> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refresh$ = this.fetchCsrfToken().pipe(
      switchMap((csrfToken) =>
        this.http.post<LoginResponse>(
          `${AUTH_URL}/refresh`,
          {},
          {
            withCredentials: true,
            headers: new HttpHeaders({
              'X-AUTH-CSRF': csrfToken,
            }),
          },
        ),
      ),
      tap((response) => {
        const allowed = !response.mustChangePassword && this.hasAllowedRole(response);

        this.currentUserSignal.set(allowed ? response : null);

        if (!allowed) {
          throw new Error('The refreshed session is not authorized.');
        }
      }),
      catchError((error) => {
        this.currentUserSignal.set(null);
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshInFlight$ = null;
      }),
      shareReplay(1),
    );

    this.refreshInFlight$ = refresh$;
    return refresh$;
  }

  clearSession(): void {
    this.currentUserSignal.set(null);
    this.restoration$ = null;
  }

  logout(): Observable<void> {
  return this.http.post<void>(
    `${AUTH_URL}/logout`,
    {},
    {
      withCredentials: true,
    },
  ).pipe(
    tap(() => {
      this.clearSession();
    }),
  );
}

  private fetchCsrfToken(): Observable<string> {
    return this.http
      .get<void>(`${AUTH_URL}/csrf`, {
        withCredentials: true,
      })
      .pipe(
        map(() => {
          const token = this.getCookie('AUTH-XSRF-TOKEN');

          if (!token) {
            throw new Error('Unable to obtain the authentication CSRF token.');
          }

          return token;
        }),
      );
  }

  private hasAllowedRole(response: LoginResponse): boolean {
    return response.role === 'ADMIN' || response.role === 'FRONT_DESK';
  }

  private getCookie(name: string): string | null {
    const prefix = `${name}=`;
    const cookie = document.cookie.split('; ').find((value) => value.startsWith(prefix));

    return cookie ? decodeURIComponent(cookie.substring(prefix.length)) : null;
  }
}
