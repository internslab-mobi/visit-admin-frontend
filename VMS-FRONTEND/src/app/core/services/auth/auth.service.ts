
/* =========================================================
   1. IMPORTS
   Angular HTTP, dependency injection, signals and RxJS.
   ========================================================= */

import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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


/* =========================================================
   2. API BASE URLS
   Keep the authentication and VMS servers separate.
   ========================================================= */

const AUTH_URL = 'http://localhost:8093/api/auth';
const VMS_URL = 'http://localhost:8092';


/* =========================================================
   3. LOGIN TYPES
   Request and response contracts for authentication.
   ========================================================= */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  role: string;
  mustChangePassword: boolean;
  message: string;
}


/* =========================================================
   4. PASSWORD RESET TYPES
   Match the request and response DTOs from your backend.
   ========================================================= */

export interface ForgotPasswordRequest {
  email: string;
}

export interface PasswordResetMessageResponse {
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  resetToken: string;
  message: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmNewPassword: string;
}


/* =========================================================
   5. AUTHENTICATION SERVICE
   Shared authentication state and API operations.
   ========================================================= */

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly currentUserSignal =
    signal<LoginResponse | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();

  private restoration$: Observable<boolean> | null = null;

  private refreshInFlight$: Observable<LoginResponse> | null = null;


  /* =======================================================
     6. CSRF INITIALIZATION
     Initialize security tokens before protected requests.
     ======================================================= */

  initializeCsrf(): Observable<void> {
    return this.http.get<void>(`${AUTH_URL}/csrf`, {
      withCredentials: true,
    });
  }

  initializeVmsCsrf(): Observable<void> {
    return this.http.get<void>(`${VMS_URL}/api/csrf`, {
      withCredentials: true,
    });
  }

  initializeSecurityTokens(): Observable<void> {
    return this.initializeCsrf().pipe(
      switchMap(() => this.initializeVmsCsrf()),
    );
  }


  /* =======================================================
     7. LOGIN
     Preserve the existing authentication behavior.
     ======================================================= */

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.initializeSecurityTokens().pipe(
      switchMap(() =>
        this.http.post<LoginResponse>(
          `${AUTH_URL}/login`,
          request,
          {
            withCredentials: true,
          },
        ),
      ),

      tap((response) => {
        if (
          !response.mustChangePassword &&
          this.hasAllowedRole(response)
        ) {
          this.currentUserSignal.set(response);
        } else {
          this.currentUserSignal.set(null);
        }
      }),
    );
  }


  /* =======================================================
     8. REQUEST PASSWORD RESET CODE
     Ask the backend to email an OTP to the supplied address.
     ======================================================= */

  requestPasswordReset(
    request: ForgotPasswordRequest,
  ): Observable<PasswordResetMessageResponse> {
    return this.initializeCsrf().pipe(
      switchMap(() =>
        this.http.post<PasswordResetMessageResponse>(
          `${AUTH_URL}/forgot-password`,
          request,
          {
            withCredentials: true,
          },
        ),
      ),
    );
  }


  /* =======================================================
     9. VERIFY PASSWORD RESET OTP
     The backend returns a reset token after OTP verification.
     ======================================================= */

  verifyResetOtp(
    request: VerifyOtpRequest,
  ): Observable<VerifyOtpResponse> {
    return this.initializeCsrf().pipe(
      switchMap(() =>
        this.http.post<VerifyOtpResponse>(
          `${AUTH_URL}/verify-reset-otp`,
          request,
          {
            withCredentials: true,
          },
        ),
      ),
    );
  }


  /* =======================================================
     10. SUBMIT NEW PASSWORD
     Send the verified reset token and both password fields.
     ======================================================= */

  resetPassword(
    request: ResetPasswordRequest,
  ): Observable<PasswordResetMessageResponse> {
    return this.initializeCsrf().pipe(
      switchMap(() =>
        this.http.post<PasswordResetMessageResponse>(
          `${AUTH_URL}/reset-password`,
          request,
          {
            withCredentials: true,
          },
        ),
      ),
    );
  }


  /* =======================================================
     11. RESTORE SESSION
     Preserve the existing cookie-based session restoration.
     ======================================================= */

  restoreSession(): Observable<boolean> {
    if (this.currentUserSignal()) {
      return of(true);
    }

    if (!this.restoration$) {
      this.restoration$ = this.initializeSecurityTokens().pipe(
        switchMap(() =>
          this.http.post<LoginResponse>(
            `${AUTH_URL}/refresh`,
            {},
            {
              withCredentials: true,
            },
          ),
        ),

        map((response) => {
          const allowed =
            !response.mustChangePassword &&
            this.hasAllowedRole(response);

          this.currentUserSignal.set(allowed ? response : null);

          return allowed;
        }),

        catchError(() => of(false)),

        shareReplay(1),
      );
    }

    return this.restoration$;
  }


  /* =======================================================
     12. REFRESH SESSION
     Preserve the existing single-flight refresh behavior.
     ======================================================= */

  refreshSession(): Observable<LoginResponse> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refresh$ = this.initializeSecurityTokens().pipe(
      switchMap(() =>
        this.http.post<LoginResponse>(
          `${AUTH_URL}/refresh`,
          {},
          {
            withCredentials: true,
          },
        ),
      ),

      tap((response) => {
        const allowed =
          !response.mustChangePassword &&
          this.hasAllowedRole(response);

        this.currentUserSignal.set(allowed ? response : null);

        if (!allowed) {
          throw new Error(
            'The refreshed session is not authorized.',
          );
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


  /* =======================================================
     13. CLEAR SESSION
     Remove in-memory user state and cached restoration.
     ======================================================= */

  clearSession(): void {
    this.currentUserSignal.set(null);
    this.restoration$ = null;
  }


  /* =======================================================
     14. ROLE VALIDATION
     Only authorized application roles are accepted.
     ======================================================= */

  private hasAllowedRole(response: LoginResponse): boolean {
    return (
      response.role === 'ADMIN' ||
      response.role === 'FRONT_DESK'
    );
  }
}