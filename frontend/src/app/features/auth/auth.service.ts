import { inject, Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { LoginDto, SignUpDto, VerifyEmailDto, AuthResponse, User, GoogleLoginDto, RefreshTokenDto } from './interfaces/auth.models';
import { tap } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({providedIn: 'root'})
export class AuthService {
    private http = inject(HttpClient)
    private baseUrl = `${environment.apiUrl}/auth`

    currentUser = signal<User | null>(null)
    isAuthenticated = signal<boolean>(false)

    login(dto: LoginDto){
        return this.http.post<AuthResponse>(`${this.baseUrl}/sign-in` , dto , {withCredentials: true}).pipe(
            tap(() => this.isAuthenticated.set(true))
        );
    }

    signUp(dto: SignUpDto){
        return this.http.post(`${this.baseUrl}/sign-up` ,  dto)
    }
    verifyEmail(dto:VerifyEmailDto){
        return this.http.post<AuthResponse>(`${this.baseUrl}/verify-email` ,dto).pipe(
            tap(() => this.isAuthenticated.set(true))
        );
    }
    google(dto: GoogleLoginDto ){
        return this.http.post<AuthResponse>(`${this.baseUrl}/google` , dto).pipe(
            tap(() => this.isAuthenticated.set(true))
        )
    }
    refresh(dto: RefreshTokenDto ){
        return this.http.post(`${this.baseUrl}/refresh` , dto, {withCredentials: true}).pipe(
            tap(() => this.isAuthenticated.set(true))
        )
    }
    logout(userId: string){
        return this.http.post(`${this.baseUrl}/logout` , userId , {withCredentials: true}).pipe(
            tap(() => this.isAuthenticated.set(false))
        )
    }

    
}