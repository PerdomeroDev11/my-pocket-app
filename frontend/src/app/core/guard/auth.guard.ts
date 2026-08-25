import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService)
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return  (authService.checkAuth()).pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['/login'])
      return of(false)
    })
  )
};