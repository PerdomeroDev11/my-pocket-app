// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'signup', pathMatch: 'full' },
  { 
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes) 
  },
];