import { Component } from '@angular/core';
import { SidebarNavItemComponent } from './sidebar-nav-item.component';
import { ButtonNewPageComponent} from "../../../../features/financial-pages/components/new-financial-page/button-new-page.component";

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [SidebarNavItemComponent, ButtonNewPageComponent],
  template: `
    <nav class="space-y-2">
        <app-sidebar-nav-item/>
        <app-button-create-financial-page/>
    </nav>
  `,
})
export class SidebarNavComponent {
}