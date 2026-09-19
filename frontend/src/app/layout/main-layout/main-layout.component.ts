import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <!-- CAMBIO CLAVE: h-screen y overflow-hidden para bloquear el scroll global y fijar la estructura -->
    <div class="flex h-screen w-screen overflow-hidden bg-black-russian-950 text-black-russian-50">
      
      <!-- Backdrop para móviles -->
      <div
        class="fixed inset-0 z-20 bg-black-russian-950/70 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden"
        [class.block]="isSidebarOpen()"
        [class.hidden]="!isSidebarOpen()"
        (click)="closeSidebar()"
      ></div>

      <!-- Sidebar Fijo (Con h-full y shrink-0 para evitar que se deforme o crezca) -->
      <div
        class="fixed inset-y-0 left-0 z-30 w-72 h-full transform border-r border-black-russian-700 bg-black-russian-900 shadow-[0_25px_60px_rgba(20,19,43,0.45)] transition-transform duration-300 ease-out lg:static lg:translate-x-0 shrink-0"
        [class.-translate-x-full]="!isSidebarOpen()"
        [class.translate-x-0]="isSidebarOpen()"
      >
        <app-sidebar />
      </div>

      <!-- Contenido Principal con Scroll Independiente -->
      <main class="flex h-full flex-1 flex-col overflow-y-auto bg-black-russian-950 text-black-russian-50">
        
        <!-- Header móvil -->
        <header class="sticky top-0 z-10 border-b border-black-russian-700 bg-black-russian-950/80 px-4 py-3 backdrop-blur-sm lg:hidden shrink-0">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-black-russian-500 bg-black-russian-900 px-3 py-2 text-sm font-medium text-black-russian-50 shadow-sm shadow-black/5"
            (click)="toggleSidebar()"
            aria-label="Open menu"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
            </svg>
            Menu
          </button>
        </header>

        <!-- Contenedor de las vistas -->
        <div class="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
})
export class MainLayoutComponent {
  isSidebarOpen = signal(false);

  toggleSidebar(): void {
    this.isSidebarOpen.update((value) => !value);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}