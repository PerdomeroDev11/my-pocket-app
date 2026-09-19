import { Component } from '@angular/core';
import { SidebarNavItemComponent } from './sidebar-nav-item.component';
import { ButtonNewPageComponent } from '../../../../features/financial-pages/fin-page/components/new-financial-page/button-new-page.component';

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [SidebarNavItemComponent, ButtonNewPageComponent],
  template: `
    <nav class="space-y-2 px-1">
      <app-sidebar-nav-item />
      <div class="pt-2">
        <app-button-create-financial-page />
      </div>
    </nav>
  `,
})
export class SidebarNavComponent {}