import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FinancialPageService } from '../../../../features/financial-pages/fin-page/financial-pages.service';
import { LastPageResponseIdInterfaces } from '../../../../features/financial-pages/fin-page/interface/financial-page.model';

@Component({
  selector: 'app-sidebar-nav-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="space-y-2">
      <a
        routerLink="/sessions"
        routerLinkActive="border-blue-400 bg-blue-500/15 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]"
        [routerLinkActiveOptions]="{ exact: false }"
        class="flex items-center rounded-r-xl border-l-4 border-transparent px-6 py-2.5 text-sm font-medium text-black-russian-300 transition-all duration-300 hover:border-blue-400/60 hover:bg-blue-500/10 hover:text-white"
      >
        <svg class="h-5 w-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12h18M12 3v18" />
        </svg>
        <span class="mx-4">Sessions</span>
      </a>

      <a
        routerLink="/setting"
        routerLinkActive="border-blue-400 bg-blue-500/15 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]"
        [routerLinkActiveOptions]="{ exact: false }"
        class="flex items-center rounded-r-xl border-l-4 border-transparent px-6 py-2.5 text-sm font-medium text-black-russian-300 transition-all duration-300 hover:border-blue-400/60 hover:bg-blue-500/10 hover:text-white"
      >
        <svg class="h-5 w-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.208.042 2.573-1.066z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span class="mx-4">Settings</span>
      </a>

      <button
        type="button"
        (click)="goToLastPage()"
        class="flex w-full items-center rounded-r-xl border-l-4 border-transparent px-6 py-2.5 text-left text-sm font-medium text-black-russian-300 transition-all duration-300 hover:border-blue-400/60 hover:bg-blue-500/10 hover:text-white"
      >
        <svg class="h-5 w-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3M3 10h18M5 5h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
        </svg>
        <span class="mx-4">Last page</span>
      </button>
    </div>
  `,
})
export class SidebarNavItemComponent {
  private router = inject(Router);
  private financialPageService = inject(FinancialPageService);

  goToLastPage(): void {
    this.financialPageService.getLastPage().subscribe({
      next: (pageId: LastPageResponseIdInterfaces) => {
        this.router.navigate(['/financial-pages', pageId.id]);
      },
      error: () => {
        this.router.navigate(['/financial-pages']);
      },
    });
  }
}