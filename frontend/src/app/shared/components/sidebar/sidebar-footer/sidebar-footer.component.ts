import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../features/auth/auth.service';

@Component({
  selector: 'app-sidebar-footer',
  standalone: true,
  template: `
    <button
      type="button"
      (click)="onLogout()"
      class="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d1d0d0]/20 bg-[#d1d0d0]/5 px-4 py-2.5 text-sm font-semibold text-[#f3f2f2] transition duration-200 hover:bg-[#d1d0d0]/10 hover:text-white"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
      </svg>
      Log out
    </button>
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