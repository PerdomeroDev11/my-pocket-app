import { Component, ElementRef, inject, signal, viewChild } from "@angular/core";
import { AuthService } from "../../auth.service";
import { Router, RouterLink } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { environment } from "../../../../../environments/environment";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

declare var google: any

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule , RouterLink],
    templateUrl: './login.component.html'
})
export class LoginComponent {
    private fb = inject(FormBuilder)
    private authService = inject(AuthService)
    private router = inject(Router)
    private toastr = inject(ToastrService)

    errorMessage = signal<string | null>(null)
    isLoading = signal<boolean>(false)
    passwordValue = ('')

    googleBtnRef = viewChild<ElementRef>('googleBtn')
    private  clientId = environment.googleClientId;

    form = this.fb.group({
        email: ['' , [Validators.required , Validators.email]],
        password: ['', [Validators.required]]
    })
    ngAfterViewInit(): void {
        this.initGoogleSign();
    }

    initGoogleSign() {
        console.log(this.clientId)
        if(typeof google !== 'undefined'){
            google.accounts.id.initialize({
                client_id: this.clientId,
                callback: (response: any) => this.handleGoogleResponse(response)
            })
            const container = this.googleBtnRef()?.nativeElement
            if(container){
                google.accounts.id.renderButton(container,{
                    theme: 'outline',
                    size: 'large',
                    width: '400px'
                })
            }
        }
    }
    handleGoogleResponse(response: any){
        const idToken = response.credential;
        this.isLoading.set(true)

        this.authService.google({idToken: idToken}).subscribe({
            next: (res) => [
                this.toastr.success('login successlly'),
                this.router.navigate(['/sessions'])
            ],
            error:(err) => {
                this.isLoading.set(false)
                const msg = err.error?.message || 'cannot login';
                this.errorMessage.set(msg)
                this.toastr.error(msg , 'Error')
            }
        })
    }

    onSubmit(){
        console.log(this.form.valid)
        console.log(this.form.value)
        if(this.form.invalid) return

        this.isLoading.set(true)
        const dto ={
            ...this.form.value
        }
        this.authService.login(dto as any).subscribe({
            next: () => {
                this.router.navigate(['/sessions'])
                this.toastr.success('login successlly')
            },
            error: (err) => {
                this.isLoading.set(false)
                const msg = err.error?.message || 'cannot login'
                this.errorMessage.set(msg)
                this.toastr.error('error')
            }
        })
    }
}