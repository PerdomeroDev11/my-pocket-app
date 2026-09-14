import { Component, inject, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../auth.service";
import { ToastrService, Toast } from "ngx-toastr";

@Component({
    selector: 'app-email-forgot-password',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './sent-email.component.html' 
})
export class SentEmailForgotPasswordComponent{
    private fb = inject(FormBuilder)
    private router = inject(Router)
    private authService = inject(AuthService)
    private toastr = inject(ToastrService)

    isLoading = signal<boolean>(false)
    errMessage = signal<string | null>(null)

    form = this.fb.group({
        email: ['' , [Validators.required , Validators.email]]
    })
    onSubmit(){
        if(this.form.invalid) return;

        this.isLoading.set(true)
        const email= this.form.value.email!

        this.authService.sentEmailPassword(email).subscribe({
            next: () => {
                this.isLoading.set(false)
                this.router.navigate(['/reset-password'],{
                    queryParams: {email}
                })
                this.toastr.success('Code sent successfully')

            },
            error: (err) => {
                this.isLoading.set(false)
                this.errMessage.set(err.error.message ?? 'Error')
                this.toastr.error('Error')
            },
        })
    }
}