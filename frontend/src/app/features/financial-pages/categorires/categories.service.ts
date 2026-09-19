import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { CategoriesResponse, CreateCategoriesInterface, UpdateCategoryInterface } from "./interface/categorie.interface";
import { Observable, Subject } from "rxjs";

@Injectable({providedIn: 'root'})
export class CategoriesService{
    private http = inject(HttpClient)
    private baseUrl = `${environment.apiUrl}/categories`
    private categoryDate = new Subject<void>()
    categoryDate$ = this.categoryDate.asObservable()

    emitCategoryDate(){
        this.categoryDate.next()
    }
    

    createCategory(data: CreateCategoriesInterface):Observable<CategoriesResponse>{
        return this.http.post<CategoriesResponse>(`${this.baseUrl}/create` , data , {withCredentials: true})
    }
    updateCategory(data: UpdateCategoryInterface , id: string):Observable<CategoriesResponse>{
        return this.http.put<CategoriesResponse>(`${this.baseUrl}/${id}`,  data , {withCredentials: true})
    }
    solfDeleteCategory(id:string){
        return this.http.patch(`${this.baseUrl}/delete/${id}` , {},{withCredentials:true})
    }
}