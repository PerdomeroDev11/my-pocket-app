import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { VerifyCodeComponent } from '../../../../shared/components/verify-code/verify-code.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule , VerifyCodeComponent],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit{
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService)

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  email = signal<string | null>(null)

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  onCodeChange(code: string) {
    this.form.patchValue({ code });
  }
  ngOnInit() {
    const email = this.route.snapshot.queryParamMap.get('email')
    if(email){
        this.email.set(email)
    }else{
        this.router.navigate(['/login'])
    }
  }
  onResendCode(){
    if(!this.email()) return

    this.authService.resendCodePassword(this.email()!).subscribe({
        next: () => {
            this.toastr.success('successly resend code')
        },
        error: (err) => {
            this.toastr.error(err.error?.message || 'Espera un momento para volver a solicitar el código')
        }
    })
  }

  onSubmit() {
    console.log('Estado del formulario:', this.form.value);
     console.log('¿Es inválido?', this.form.invalid);
    if (this.form.invalid) return;

    this.isLoading.set(true);

    this.authService.resetPassword(
      this.email()!,
      this.form.value.code!,
      this.form.value.newPassword!
    ).subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.toastr.success('successly change password')
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Código incorrecto o expirado');
        this.isLoading.set(false);
        this.toastr.error('error: ' , err)
      },
    });
  }
}