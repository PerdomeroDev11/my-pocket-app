import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { Component, inject } from "@angular/core";
import { FinancialPageService } from "../../../../features/financial-pages/fin-page/financial-pages.service";
import { LastPageResponseIdInterfaces } from "../../../../features/financial-pages/fin-page/interface/financial-page.model";

@Component({
    selector: 'app-sidebar-nav-item',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    template: `
        <a
          routerLink="/setting"
          routerLinkActive="bg-sky-500/15 text-sky-100 ring-1 ring-sky-500/30"
          class="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md dark:bg-gray-800 dark:text-gray-200"
        >
           <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                      />
            </svg>
          <span class="mx-4 font-medium">settings</span>
        </a>
        <button
          type="button"
          (click)="goToLastPage()"
          routerLinkActive="bg-sky-500/15 text-sky-100 ring-1 ring-sky-500/30"
          class="flex items-center w-full px-4 py-2 text-left text-gray-700 bg-gray-100 rounded-md dark:bg-gray-800 dark:text-gray-200"
        >
           <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                      />
            </svg>
          <span class="mx-4 font-medium">Última página</span>
        </button>
    `
})
export class SidebarNavItemComponent {
  private router = inject(Router);
  private financialPageService = inject(FinancialPageService);

  goToLastPage(): void {
    this.financialPageService.getLastPage().subscribe({
      next: (pageId: LastPageResponseIdInterfaces) => {
          console.log('id obtenido de la cunsulta al endpoint lasPages: ' , pageId.id)
          this.router.navigate(['/financial-pages', pageId.id]);
      },
      error: (err) => {
        console.error('error al hacer la consulta lastPage: ' , err)
        this.router.navigate(['/financial-pages']);
      }
    });
  }
}