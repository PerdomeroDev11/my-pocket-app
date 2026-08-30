import { Routes } from '@angular/router';
import { SessionComponent } from './features/users/components/session/session.component';
import { authGuard } from './core/guard/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { SettingComponent } from './pages/settings/setting-page.component';
import { FinancialPage } from './pages/financial-pages/financial-page.component';

export const routes: Routes = [
  { path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'sessions',
        component: SessionComponent,
      },
      {
        path: 'setting',
        component: SettingComponent
      },
      {
        path: 'financial-pages/:id',
        component: FinancialPage
      },
    ]
  },
  { 
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes) 
  },
];