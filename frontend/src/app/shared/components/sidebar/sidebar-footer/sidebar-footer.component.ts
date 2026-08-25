import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../features/auth/auth.service';

@Component({
  selector: 'app-sidebar-footer',
  standalone: true,
  template: `
    <div class="flex">
      <button
        (click)="onLogout()"
        class="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 hover:text-white"
      >
        Cerrar sesión
      </button>
    </div>
  `,
})
export class SidebarFooterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  onLogout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}