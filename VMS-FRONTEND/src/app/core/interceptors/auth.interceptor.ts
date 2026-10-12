import {
  HttpContextToken,
  HttpInterceptorFn,
} from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import {
  catchError,
  switchMap,
  throwError,
} from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

const AUTH_URL = 'http://localhost:8093';
const VMS_URL = 'http://localhost:8092';

export const RETRIED_AFTER_REFRESH =
  new HttpContextToken<boolean>(() => false);

function readCookie(
  cookieName: string,
  cookieString: string,
): string | null {
  const prefix = `${cookieName}=`;

  const cookie = cookieString
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.substring(prefix.length));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const document = inject(DOCUMENT);

  const isAuthRequest = req.url.startsWith(AUTH_URL);
  const isVmsRequest = req.url.startsWith(VMS_URL);

  if (!isAuthRequest && !isVmsRequest) {
    return next(req);
  }

  let request = req.clone({
    withCredentials: true,
  });

  const isUnsafeMethod = ['POST', 'PUT', 'PATCH', 'DELETE']
    .includes(request.method.toUpperCase());

  if (isUnsafeMethod) {
    const cookieName = isAuthRequest
      ? 'XSRF-TOKEN'
      : 'VMS-XSRF-TOKEN';

    const headerName = isAuthRequest
      ? 'X-XSRF-TOKEN'
      : 'X-VMS-XSRF-TOKEN';

    const csrfToken = readCookie(
      cookieName,
      document.cookie,
    );

    if (csrfToken) {
      request = request.clone({
        setHeaders: {
          [headerName]: csrfToken,
        },
      });
    }
  }

  return next(request).pipe(
    catchError((error) => {
      const shouldRefresh =
        isVmsRequest &&
        error.status === 401 &&
        !request.context.get(RETRIED_AFTER_REFRESH);

      if (!shouldRefresh) {
        return throwError(() => error);
      }

      return authService.refreshSession().pipe(
        catchError((refreshError) => {
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
            catchError((retryError) => {
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