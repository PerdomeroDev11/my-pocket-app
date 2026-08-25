import { Injectable, inject, signal} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { UserResponse , ChangePassword, UpdateUser} from "./interfaces/user.model";
import { UserSessionsResponse } from "./interfaces/sessios.model";
import {  Observable, tap } from "rxjs";
import { environment } from "../../../environments/environment";


@Injectable({providedIn: 'root'})
export class UserService {
    private http = inject(HttpClient)
    private baseUrl = `${environment.apiUrl}/users`

    currentUser = signal<UserResponse| null>(null)

    
    sessionAll():Observable<UserSessionsResponse[]>{
        return this.http.get<UserSessionsResponse[]>(`${this.baseUrl}/sessions`)
    }
    infoUser():Observable<UserResponse>{
        return this.http.get<UserResponse>(`${this.baseUrl}/show-user`,{withCredentials: true}).pipe(
            tap((response) => {
                this.currentUser.set(response)
            })
        )
    }
    changePassword(data: ChangePassword){
        return this.http.patch(`${this.baseUrl}/change-password` , data , {withCredentials: true})
    }
    editUser(data: UpdateUser):Observable<UpdateUser>{
        return this.http.put<UpdateUser>(`${this.baseUrl}/edit-user`, data, {withCredentials: true})
    }
    editProdilePicture(formData: FormData){
        return this.http.patch(`${this.baseUrl}/me/profile-picture`, formData, {withCredentials: true})
    }
}