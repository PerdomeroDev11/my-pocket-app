import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { CreateFinancialPageInterface, financialPageResponseInterface } from "./interface/financial-page.model";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class FinancialPageService {
    private http = inject(HttpClient)
    private baseUrl = `${environment.apiUrl}/financial-pages`

    createPage(data: CreateFinancialPageInterface): Observable<financialPageResponseInterface>{
        return this.http.post<financialPageResponseInterface>(`${this.baseUrl}/new-page` , data , {withCredentials: true})
    }
    getFiancianPages(id: string):Observable<financialPageResponseInterface>{
        return this.http.get<financialPageResponseInterface>(`${this.baseUrl}/${id}` , {withCredentials: true})
    }
}