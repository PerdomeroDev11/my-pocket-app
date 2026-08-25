import { inject, Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { LoginDto, SignUpDto, VerifyEmailDto, AuthResponse,GoogleLoginDto } from './interfaces/auth.models';
import { catchError, tap, throwError } from "rxjs";
import { environment } from "../../../environments/environment";
import { UserResponse } from "../users/interfaces/user.model";

@Injectable({providedIn: 'root'})
export class AuthService {
    private http = inject(HttpClient)
    private baseUrl = `${environment.apiUrl}`

    currentUser = signal<UserResponse | null>(null)
    isAuthenticated = signal<boolean>(false)

    login(dto: LoginDto){
        return this.http.post<AuthResponse>(`${this.baseUrl}/auth/sign-in` , dto , {withCredentials: true}).pipe(
            tap(() => this.isAuthenticated.set(true))
        );
    }

    signUp(dto: SignUpDto){
        return this.http.post(`${this.baseUrl}/auth/sign-up` ,  dto)
    }
    verifyEmail(dto:VerifyEmailDto){
        return this.http.post<AuthResponse>(`${this.baseUrl}/auth/verify-email` ,dto).pipe(
            tap(() => this.isAuthenticated.set(true))
        );
    }
    google(dto: GoogleLoginDto ){
        return this.http.post<UserResponse>(`${this.baseUrl}/auth/google`  , dto ).pipe(
            tap((response) => {
                this.isAuthenticated.set(true);
                this.currentUser.set(response);
            } 
            ))
    }
    refresh( ){
        return this.http.post(`${this.baseUrl}/auth/refresh` ,{}, {withCredentials: true}).pipe(
            tap(() => this.isAuthenticated.set(true))
        )
    }
    logout(){
        return this.http.post(`${this.baseUrl}/auth/logout` ,{},  {withCredentials: true}).pipe(
            tap(() => this.isAuthenticated.set(false))
        )
    }
    logoutRemote(sessionId: string,password?: string){
        return this.http.patch(`${this.baseUrl}/auth/sessions-close/${sessionId}` , {password}, {withCredentials: true})
    }
    checkAuth(){
        return this.http.get<UserResponse>(`${this.baseUrl}/users/me` , {withCredentials: true}).pipe(
            tap((user: UserResponse) => {
                this.currentUser.set(user)
                this.isAuthenticated.set(true)
            }),
            catchError(() => {
                this.isAuthenticated.set(false)
                this.currentUser.set(null)
                return throwError(() => {new Error('no session')})
            })
        )
    }

    sentEmailPassword(email: string){
        return this.http.post(`${this.baseUrl}/auth/sent-code-password`, {email})
    }
    resetPassword(email:string,code: string , passwordNew:string){
        return this.http.patch(`${this.baseUrl}/auth/reset-forgot-password`,{email,code,passwordNew})
    }
    resendCodePassword(email:string){
        return this.http.post(`${this.baseUrl}/auth/resend-code-password` , {email})
    }
    resendCodeEmailVerify(email:string){
        return this.http.post(`${this.baseUrl}/auth/resend-code-email` , {email})
    }
}