import { Component } from '@angular/core';
import { SidebarFooterComponent } from './sidebar-footer/sidebar-footer.component';
import { SidebarNavComponent } from './sidebar-nav/sidebar-nav.component';
import { SidebarUserComponent } from './sidebar-user/sidebar-user.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SidebarFooterComponent, SidebarNavComponent, SidebarUserComponent],
  template: `
    <aside class="flex h-full flex-col overflow-y-auto bg-black-russian-950/60 backdrop-blur-xl border-r border-white/10 px-4 py-6 text-black-russian-100 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
      <div class="flex items-center justify-center pt-4">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 ring-1 ring-indigo-400/50 shadow-inner">
            <svg class="h-8 w-8" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M364.61 390.213C304.625 450.196 207.37 450.196 147.386 390.213C117.394 360.22 102.398 320.911 102.398 281.6C102.398 242.291 117.394 202.981 147.386 172.989C147.386 230.4 153.6 281.6 230.4 307.2C230.4 256 256 102.4 294.4 76.7999C320 128 334.618 142.997 364.608 172.989C394.601 202.981 409.597 242.291 409.597 281.6C409.597 320.911 394.601 360.22 364.61 390.213Z" fill="#4C51BF" stroke="#4C51BF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M201.694 387.105C231.686 417.098 280.312 417.098 310.305 387.105C325.301 372.109 332.8 352.456 332.8 332.8C332.8 313.144 325.301 293.491 310.305 278.495C295.309 263.498 288 256 275.2 230.4C256 243.2 243.201 320 243.201 345.6C201.694 345.6 179.2 332.8 179.2 332.8C179.2 352.456 186.698 372.109 201.694 387.105Z" fill="white" />
            </svg>
          </div>
          <span class="text-2xl font-semibold tracking-wide text-white">Mi Bolsillo</span>
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