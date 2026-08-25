import { Component , computed, ElementRef, inject , signal, viewChild } from "@angular/core";
import {Validators , FormBuilder, ReactiveFormsModule} from '@angular/forms'
import { Router , RouterLink } from "@angular/router";
import { AuthService } from "../../auth.service";
import { PasswordStrength , checkPasswordStrong } from "../../../../shared/utils/password-strength.util";
import { ToastrService } from "ngx-toastr";
import { environment } from "../../../../../environments/environment";

declare var google: any;

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [ReactiveFormsModule , RouterLink],
    templateUrl: './signup.component.html'
})
export class SignupComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router)
    private toastr =  inject(ToastrService)


    errorMessage = signal<string | null>(null)
    isLoading = signal(false)
    passwordValue = signal('')

    passwordStrength = computed<PasswordStrength>(() => checkPasswordStrong(this.passwordValue()));
    googleBtnRef = viewChild<ElementRef>('googleBtn');
    private clientId = environment.googleClientId;

    form = this.fb.group({
        name: ['' , [Validators.required]],
        email: ['' , [Validators.required, Validators.email]],
        password: ['' , [Validators.required , Validators.minLength(8)]],
        currency: ['' , [Validators.required]],
        typePeriod: ['', [Validators.required]]
    })
    constructor(){
        this.form.get('password')?.valueChanges.subscribe((value) => {
            this.passwordValue.set(value ?? '')
        });
    }
    ngAfterViewInit(): void {
        this.initGoogleSign();
    }
    initGoogleSign() {
        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                client_id: this.clientId,
                callback: (response: any) => this.handleGoogleResponse(response),
            });

            const container = this.googleBtnRef()?.nativeElement;
            if (container) {
                google.accounts.id.renderButton(container, {
                    theme: 'outline',
                    size: 'large',
                    width: '100%',
                    text: 'continue_with',
                });
            }
        }
    }
    handleGoogleResponse(response: any) {
        const idToken = response.credential;
        this.isLoading.set(true);
        
        this.authService.google({ idToken: idToken }).subscribe({
            next: (res) => {
                this.toastr.success('¡Bienvenido con Google!');
                this.router.navigate(['/sessions']);
            },
            error: (err) => {
                this.isLoading.set(false);
                const msg = err.error?.message || 'Error al autenticar con Google';
                this.errorMessage.set(msg);
                this.toastr.error(msg, 'Error');
            },
        });
    }

    onSubmit() {
        if(this.form.invalid) return;

        this.isLoading.set(true)
        const dto= {
            ...this.form.value,
            lenguage: navigator.language.split('')[0],
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }

        this.authService.signUp(dto as any).subscribe({
            next: () => {
                this.router.navigate(['/verify-email'] , {
                    queryParams: {email: this.form.value.email},
                });
            },
            error: (err) => {
                this.errorMessage.set(err.error?.message ?? 'Error during registration');
                this.toastr.error('Oops')
                this.isLoading.set(false)
            }
        })
    }
}