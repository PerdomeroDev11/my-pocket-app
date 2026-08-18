import { HttpErrorResponse, HttpEvent, HttpInterceptorFn  } from "@angular/common/http";
import { AuthService } from "../../features/auth/auth.service";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { Inject } from "@angular/core";

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const authService = Inject(AuthService);

  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse): Observable<HttpEvent<unknown>> => {
      if (error.status === 401 && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/login')) {
        if (!isRefreshing) {
          isRefreshing = true;

          return (authService.refreshToken() as Observable<unknown>).pipe(
            switchMap((): Observable<HttpEvent<unknown>> => {
              isRefreshing = false;
              return next(clonedReq);
            }),
            catchError((refreshError): Observable<HttpEvent<unknown>> => {
              isRefreshing = false;
              authService.logoutLocal();
              return throwError(() => refreshError);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};