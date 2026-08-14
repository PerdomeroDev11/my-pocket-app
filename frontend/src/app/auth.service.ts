import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  // Reemplaza con la URL base de tu backend
  private apiUrl = 'http://localhost:3000/auth'; 

  signUp(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/sign-up`, userData);
  }

  signIn(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signin`, credentials);
  }

  // Método auxiliar para guardar el token
  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }
}