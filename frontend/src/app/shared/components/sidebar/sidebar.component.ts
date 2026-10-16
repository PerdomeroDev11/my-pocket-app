import { Component } from '@angular/core';
import { SidebarFooterComponent } from './sidebar-footer/sidebar-footer.component';
import { SidebarNavComponent } from './sidebar-nav/sidebar-nav.component';
import { SidebarUserComponent } from './sidebar-user/sidebar-user.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SidebarFooterComponent, SidebarNavComponent, SidebarUserComponent ],
  template: `
    <aside class="flex h-full flex-col overflow-y-auto bg-black-russian-950/60 backdrop-blur-xl border-r border-white/10 px-4 py-6 text-black-russian-100 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
      <div class="flex items-center justify-center pt-4">
        <div class="flex items-center gap-3">
          <img src="./icon-mi-bolsillo-edit.png" width="50">
          <div>
            <h3 class="text-2xl"><span class="text-blue-600">MI</span> <strong>BOLSILLO</strong></h3>
            <p class="text-[10px] text-center text-blue-600">Tus Cuentas, A tu Manera</p>
          </div>
        </div>
      </div>

      <nav class="mt-10 flex-1">
        <app-sidebar-nav />
      </nav>

      <div class="mt-6 border-t border-white/10 pt-4">
        <app-sidebar-user />
        <div class="mt-4">
          <app-sidebar-footer />
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {}