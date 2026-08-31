import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { CreateFinancialPageInterface, financialPageResponseInterface, LastPageResponseIdInterfaces, StatusPagesInerface } from "./fin-page/interface/financial-page.model";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class FinancialPageService {
    private http = inject(HttpClient)
    private baseUrl = `${environment.apiUrl}`

    createPage(data: CreateFinancialPageInterface): Observable<financialPageResponseInterface>{
        return this.http.post<financialPageResponseInterface>(`${this.baseUrl}/financial-pages/new-page` , data , {withCredentials: true})
    }
    getFiancianPages():Observable<financialPageResponseInterface[]>{
        return this.http.get<financialPageResponseInterface[]>(`${this.baseUrl}/financial-pages/list` , {withCredentials: true})
    }
    getLastPage(): Observable<LastPageResponseIdInterfaces> {
        return this.http.get<LastPageResponseIdInterfaces>(`${this.baseUrl}/financial-pages/last`, { withCredentials: true })
    }
    //mientras creao el feature de movements y categories no lo voy a tipar
    pageFInancialDate(id: string){
        return this.http.get(`${this.baseUrl}/categories/page/${id}` , {withCredentials:true})
    }
    changeStatusPage(id:string):Observable<StatusPagesInerface>{
        return this.http.patch<StatusPagesInerface>(`${this.baseUrl}/financial-pages/change-status-page/${id}` , {} , {withCredentials: true})
    }
}