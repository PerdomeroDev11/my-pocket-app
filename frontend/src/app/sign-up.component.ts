import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './sign-in.component.html'
})
export class SignUp {  // <--- Asegúrate de que tenga 'export'
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  signInForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  errorMessage: string = '';

  onSubmit() {
    if (this.signInForm.invalid) return;

    this.authService.signIn(this.signInForm.value).subscribe({
      next: (response) => {
        if (response.token) {
          this.authService.saveToken(response.token);
          alert('¡Inicio de sesión exitoso!');
        }
      },
      error: () => {
        this.errorMessage = 'Credenciales inválidas. Inténtalo de nuevo.';
      }
    });
  }
}