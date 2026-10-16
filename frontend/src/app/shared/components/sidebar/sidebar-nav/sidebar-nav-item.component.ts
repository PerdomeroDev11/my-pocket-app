import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FinancialPageService } from '../../../../features/financial-pages/fin-page/financial-pages.service';
import { LastPageResponseIdInterfaces } from '../../../../features/financial-pages/fin-page/interface/financial-page.model';
import { ListFinancialPageComponent } from '../../../../features/financial-pages/fin-page/components/list-financial-page.component';

@Component({
  selector: 'app-sidebar-nav-item',
  standalone: true,
  imports: [
    RouterLink, 
    RouterLinkActive , 
    ListFinancialPageComponent,
  ],
  template: `
    <div class="space-y-2">
      <a
        routerLink="/financial-institutions"
        routerLinkActive="border-l-2 border-l-blue-400/80 bg-white/[0.02] text-white"
        [routerLinkActiveOptions]="{ exact: false }"
        class="flex items-center gap-3 rounded-xl border border-transparent border-l-2 border-l-transparent px-3.5 py-2.75 text-[14px] text-slate-300 transition-all duration-200 hover:border-l-blue-400/80 hover:bg-white/[0.02] hover:text-white"
      >
        <svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12h18M12 3v18" />
        </svg>
        <span>Financial institutions</span>
      </a>

      <a
        routerLink="/setting"
        routerLinkActive="border-l-2 border-l-blue-400/80 bg-white/[0.02] text-white"
        [routerLinkActiveOptions]="{ exact: false }"
        class="flex items-center gap-3 rounded-xl border border-transparent border-l-2 border-l-transparent px-3.5 py-2.75 text-[14px] text-slate-300 transition-all duration-200 hover:border-l-blue-400/80 hover:bg-white/[0.02] hover:text-white"
      >
        <svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.208.042 2.573-1.066z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span>Settings</span>
      </a>

      <div class="px-1 pt-1">
        <app-list-financial-page />
      </div>
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