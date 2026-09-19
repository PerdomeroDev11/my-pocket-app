
import { Routes } from '@angular/router';
import { SentEmailForgotPasswordComponent } from './pages/forgot-password/sent-email.component';
import { ResetPasswordComponent } from './pages/forgot-password/reset-password.component';
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
  {
    path: 'sent-email',
    component: SentEmailForgotPasswordComponent
  },
  {
    path: 'forgot-password',
    component: SentEmailForgotPasswordComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  }
];