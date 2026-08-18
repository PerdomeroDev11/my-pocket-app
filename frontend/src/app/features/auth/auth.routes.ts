// features/auth/auth.routes.ts
import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./pages/sign-up/signup.component').then(m => m.SignupComponent) 
  },
  { 
    path: 'verify-email', 
    loadComponent: () => import('./pages/verify-email/verify-email.component').then(m => m.VerifyEmailComponent) 
  },
];