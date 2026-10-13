import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import {
  authInterceptor,
  RETRIED_AFTER_REFRESH,
} from './auth.interceptor';
import {
  AuthService,
  LoginResponse,
} from '../services/auth/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;

  let authService: {
    refreshSession: ReturnType<typeof vi.fn>;
    clearSession: ReturnType<typeof vi.fn>;
  };

  const refreshResponse: LoginResponse = {
    userId: 'user-1',
    role: 'ADMIN',
    mustChangePassword: false,
    message: 'Session refreshed',
  };

  beforeEach(() => {
    authService = {
      refreshSession: vi.fn(),
      clearSession: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();

    document.cookie =
      'VMS-XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie =
      'AUTH-XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('should add credentials and send a VMS POST without a CSRF header', () => {
    let response: unknown;

    http.post('http://localhost:8092/api/visits', {}).subscribe((result) => {
      response = result;
    });

    const request = httpTestingController.expectOne(
      'http://localhost:8092/api/visits',
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.has('X-VMS-CSRF')).toBe(false);

    request.flush({ id: 1 });

    expect(response).toEqual({ id: 1 });
    expect(authService.refreshSession).not.toHaveBeenCalled();
  });

  it('should not make a VMS CSRF bootstrap request before a POST', () => {
    http.post('http://localhost:8092/api/visits', {}).subscribe();

    httpTestingController.expectOne(
      'http://localhost:8092/api/visits',
    );

    httpTestingController.expectNone(
      'http://localhost:8092/api/csrf',
    );
  });

  it('should refresh the session and retry a VMS request after a 401', () => {
    authService.refreshSession.mockReturnValue(of(refreshResponse));

    let response: unknown;

    http.get('http://localhost:8092/api/visits').subscribe((result) => {
      response = result;
    });

    const originalRequest = httpTestingController.expectOne(
      'http://localhost:8092/api/visits',
    );

    originalRequest.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    const retriedRequest = httpTestingController.expectOne(
      'http://localhost:8092/api/visits',
    );

    expect(authService.refreshSession).toHaveBeenCalledTimes(1);
    expect(
      retriedRequest.request.context.get(RETRIED_AFTER_REFRESH),
    ).toBe(true);
    expect(retriedRequest.request.withCredentials).toBe(true);

    retriedRequest.flush([{ id: 1 }]);

    expect(response).toEqual([{ id: 1 }]);
    expect(authService.clearSession).not.toHaveBeenCalled();
  });

  it('should clear the session when refreshing fails', () => {
    const refreshError = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
    });

    authService.refreshSession.mockReturnValue(
      throwError(() => refreshError),
    );

    let receivedError: unknown;

    http.get('http://localhost:8092/api/visits').subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    httpTestingController
      .expectOne('http://localhost:8092/api/visits')
      .flush(
        { message: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(authService.refreshSession).toHaveBeenCalledTimes(1);
    expect(authService.clearSession).toHaveBeenCalledTimes(1);
    expect(receivedError).toBe(refreshError);
  });

  it('should clear the session if the retried VMS request also returns 401', () => {
    authService.refreshSession.mockReturnValue(of(refreshResponse));

    let receivedError: unknown;

    http.get('http://localhost:8092/api/visits').subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    httpTestingController
      .expectOne('http://localhost:8092/api/visits')
      .flush(
        { message: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' },
      );

    httpTestingController
      .expectOne('http://localhost:8092/api/visits')
      .flush(
        { message: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(authService.refreshSession).toHaveBeenCalledTimes(1);
    expect(authService.clearSession).toHaveBeenCalledTimes(1);
    expect(receivedError).toBeInstanceOf(HttpErrorResponse);
  });

  it('should not modify unrelated external requests', () => {
    http.get('https://example.com/data').subscribe();

    const request = httpTestingController.expectOne(
      'https://example.com/data',
    );

    expect(request.request.withCredentials).toBe(false);
    expect(authService.refreshSession).not.toHaveBeenCalled();

    request.flush({ ok: true });
  });
});