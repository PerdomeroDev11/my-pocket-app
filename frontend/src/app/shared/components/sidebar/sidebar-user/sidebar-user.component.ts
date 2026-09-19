import { Component, inject } from '@angular/core';
import { UserService } from '../../../../features/users/user.service';

@Component({
  selector: 'app-sidebar-user',
  standalone: true,
  template: `
    @if (userService.currentUser(); as user) {
      <div class="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-800/60 p-3 shadow-sm shadow-slate-950/20">
        <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-700 ring-2 ring-slate-600">
          @if (user.profilePicture) {
            <img
              [src]="user.profilePicture"
              [alt]="user.name + ' avatar'"
              class="h-full w-full object-cover"
              referrerpolicy="no-referrer"
            />
          } @else {
            <svg class="h-5 w-5 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        </div>

        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-white">{{ user.name }}</p>
          <p class="text-xs text-slate-400">Active user</p>
        </div>
      </div>
    }
  `,
})
export class SidebarUserComponent {
  userService = inject(UserService);

  ngOnInit() {
    this.userService.infoUser().subscribe({
      error: (err) => console.error('Error cargando usuario en el sidebar:', err),
    });
  }
}