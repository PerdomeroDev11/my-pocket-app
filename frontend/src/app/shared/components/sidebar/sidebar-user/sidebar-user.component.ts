import { Component, inject } from '@angular/core';
import { UserService } from '../../../../features/users/user.service';

@Component({
  selector: 'app-sidebar-user',
  standalone: true,
  template: `
    @if (userService.currentUser(); as user) {
      <div class="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-800/70 p-3 shadow-sm shadow-slate-950/20">
        @if(user.profilePicture){
            <img
          [src]="user.profilePicture || '/assets/default-avatar.png'"
          alt="Avatar"
          class="object-cover mx-2 rounded-full h-9 w-9"
          referrerpolicy="no-referrer"
        />
        }@else {
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
        }
        <div class="min-w-0">
          <span class="mx-2 font-medium text-gray-800 dark:text-gray-200">{{ user.name }}</span>
        </div>
      </div>
    }
  `,
})
export class SidebarUserComponent {
  userService = inject(UserService);

  
  ngOnInit() {
    this.userService.infoUser().subscribe({
      error: (err) => console.error('Error cargando usuario en el sidebar:', err)
    });
  }
  constructor() {
    console.log('Usuario actual en la señal:', this.userService.currentUser());
  }
}