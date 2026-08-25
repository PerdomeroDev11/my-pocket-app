import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { UserResponse } from '../../interfaces/user.model';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-session-close',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './close-session.component.html'
})
export class CloseSessionComponent  {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  
  userService = inject(UserService)
  user = signal<UserResponse | null>(null)

  isModalOpen = signal<boolean>(false);
  passwordInput: string  = '';

  @Input() sessionId: string = ''
  @Output() closeModalEvent = new EventEmitter<void>()
  @Output() sessionClosedEvent = new EventEmitter<void>();


    get isGoogleUser(): boolean {
    const user = this.userService.currentUser();
    return !!user?.withGoogle; 
  }

  openModal(id:string) {
    this.sessionId = id
    this.passwordInput = ''; 
    this.isModalOpen.set(true);
  }


  closeModal() {
    this.closeModalEvent.emit()
  }

  confirm() {
    const passwordToSend = this.isGoogleUser ? undefined : this.passwordInput

    this.authService.logoutRemote(this.sessionId,passwordToSend).subscribe({
      next: (res) => {
        console.log('Sesión cerrada con éxito', res);
        this.sessionClosedEvent.emit();
        this.closeModal()
      },
      error: (error : Error) => {
        console.error('Error al cerrar la sesión:', error);
      }
    });
  }
}