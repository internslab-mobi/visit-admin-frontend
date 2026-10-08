import {
  HttpContextToken,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  switchMap,
  throwError,
} from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

const AUTH_URL = 'http://localhost:8097';
const VMS_URL = 'http://localhost:8092';

export const RETRIED_AFTER_REFRESH =
  new HttpContextToken<boolean>(() => false);

function getCookie(name: string): string | null {
  const prefix = `${name}=`;

  const cookie = document.cookie
    .split('; ')
    .find(value => value.startsWith(prefix));

  return cookie
    ? decodeURIComponent(cookie.substring(prefix.length))
    : null;
}

function requiresCsrf(method: string): boolean {
  return !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(
    method.toUpperCase(),
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const isAuthRequest = req.url.startsWith(AUTH_URL);
  const isVmsRequest = req.url.startsWith(VMS_URL);

  if (!isAuthRequest && !isVmsRequest) {
    return next(req);
  }

  const request = req.clone({
    withCredentials: true,
  });

  const methodNeedsCsrf =
    isAuthRequest && requiresCsrf(request.method);

  const sendRequest = () => {
    const csrfToken = methodNeedsCsrf
      ? getCookie('AUTH-XSRF-TOKEN')
      : null;

    if (methodNeedsCsrf && !csrfToken) {
      return throwError(
        () =>
          new Error(
            `Missing AUTH-XSRF-TOKEN. Unable to send ${request.method} ${request.url}.`,
          ),
      );
    }

    const securedRequest =
      methodNeedsCsrf && csrfToken
        ? request.clone({
            setHeaders: {
              'X-AUTH-CSRF': csrfToken,
            },
          })
        : request;

    return next(securedRequest).pipe(
      catchError(error => {
        const shouldRefresh =
          isVmsRequest &&
          error.status === 401 &&
          !securedRequest.context.get(RETRIED_AFTER_REFRESH);

        if (!shouldRefresh) {
          return throwError(() => error);
        }

        return authService.refreshSession().pipe(
          catchError(refreshError => {
            authService.clearSession();
            return throwError(() => refreshError);
          }),
          switchMap(() => {
            const retriedRequest = request.clone({
              context: request.context.set(
                RETRIED_AFTER_REFRESH,
                true,
              ),
            });

            return next(retriedRequest).pipe(
              catchError(retryError => {
                if (retryError.status === 401) {
                  authService.clearSession();
                }

                return throwError(() => retryError);
              }),
            );
          }),
        );
      }),
    );
  };

  return sendRequest();
};