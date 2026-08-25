import { Component, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder,  ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { UserService } from "../../../user.service";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";
import { MODAL_REF, ModalRef } from "../../../../../shared/services/modal.service";

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [ReactiveFormsModule , CommonModule],
    templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent {
    private userService = inject(UserService)
    private toastr = inject(ToastrService)
    private fb = inject(FormBuilder)

    isLoading = signal<boolean>(false)

    readonly modalRef = inject(MODAL_REF) as ModalRef<boolean>;

    passwordForm = this.fb.nonNullable.group({
        password: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
    }, {
        validators: this.passwordMatchValidator
    });

    private passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
        const newPassword = form.get('newPassword')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        return newPassword === confirmPassword ? null : { mismatch: true };
    }

    onSubmit(): void{
        if(this.passwordForm.invalid){
            this.passwordForm.markAllAsTouched()
            return
        }
        this.isLoading.set(true)
        const {password,newPassword,confirmPassword} = this.passwordForm.getRawValue()
        this.userService.changePassword({password,newPassword,confirmPassword}).subscribe({
            next: () => {
                this.toastr.success('successlly changed password')
                this.passwordForm.reset()
                this.modalRef.close();
                this.isLoading.set(false)
            },
            error: (err) => {
                this.toastr.error(err.error?.message || 'cannot change password')
                this.isLoading.set(false)
            }
        })
    }
    

}