import { Component } from '@angular/core';
import { SidebarNavItemComponent } from './sidebar-nav-item.component';

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [SidebarNavItemComponent],
  template: `
    <nav class="space-y-2">
        <app-sidebar-nav-item/>
    </nav>
  `,
})
export class SidebarNavComponent {
}