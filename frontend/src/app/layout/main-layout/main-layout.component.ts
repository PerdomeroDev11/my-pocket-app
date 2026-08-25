import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex min-h-screen bg-slate-100 text-slate-800">
      <div class="w-72 shrink-0 border-r border-slate-200 bg-slate-900 shadow-2xl shadow-slate-900/20">
        <app-sidebar />
      </div>
      <main class="flex-1 overflow-y-auto bg-gray-900 from-slate-100 via-slate-50 to-slate-200">
        <div class="mx-auto max-w-7xl p-6 md:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
})
export class MainLayoutComponent {}