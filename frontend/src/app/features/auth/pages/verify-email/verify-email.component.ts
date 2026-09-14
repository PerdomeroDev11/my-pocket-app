import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { ToastrService } from 'ngx-toastr';
import { VerifyCodeComponent } from '../../../../shared/components/verify-code/verify-code.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [ReactiveFormsModule,VerifyCodeComponent],
  templateUrl: './verify-email.component.html',

})
export class VerifyEmailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService)

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  ngOnInit() {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.form.patchValue({ email });
    }
  }
   onCodeChange(code: string) {
    this.form.patchValue({ code });
  }

  onResendEmail(){
    const email = this.form.get('email')?.value;
    
    if (!email) {
      this.toastr.error('Email is required to resend the code');
      return;
    }
    this.authService.resendCodeEmailVerify(this.form.value.email as any).subscribe({
      next: () => {
        this.toastr.success('Code resent successfully')
      },
      error: (err) =>{
        this.toastr.error(err.error?.message ?? 'Invalid code')
      }
    })
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);

    this.authService.verifyEmail(this.form.value as any).subscribe({
      next: () => {
        this.toastr.success('Account successfully registered; welcome!')
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Invalid code');
        this.isLoading.set(false);
      },
    });
  }
}