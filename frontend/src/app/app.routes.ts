import { Routes } from '@angular/router';
import { SignIn } from './sign-in.component'
import { SignUp } from './sign-up.component';

export const routes: Routes = [
  // Ruta por defecto (redirige al login)
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  
  // Ruta para Iniciar Sesión
  { path: 'signin', component: SignIn },
  
  // Ruta para Registrarse
  { path: 'signup', component: SignUp},

  // (Opcional) Ruta comodín por si escriben mal una URL
  { path: '**', redirectTo: 'signin' }
];