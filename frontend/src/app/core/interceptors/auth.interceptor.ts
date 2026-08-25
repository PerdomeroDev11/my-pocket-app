import { HttpErrorResponse, HttpEvent, HttpInterceptorFn } from "@angular/common/http";
import { AuthService } from "../../features/auth/auth.service";
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from "rxjs";
import { inject } from "@angular/core";

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<boolean>(false);

export const authInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse): Observable<HttpEvent<unknown>> => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        
        if (!isRefreshing) {
          isRefreshing = true;
          refreshSubject.next(false); 

          return (authService.refresh() as Observable<unknown>).pipe(
            switchMap((): Observable<HttpEvent<unknown>> => {
              isRefreshing = false;
              refreshSubject.next(true);
              
              return next(clonedReq);
            }),
            catchError((refreshError): Observable<HttpEvent<unknown>> => {
              isRefreshing = false;
              refreshSubject.next(false);
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        } else {
          return refreshSubject.pipe(
            filter(isRefreshed => isRefreshed === true),
            take(1),
            switchMap(() => next(clonedReq))
          );
        }
      }

      return throwError(() => error);
    })
  );
};