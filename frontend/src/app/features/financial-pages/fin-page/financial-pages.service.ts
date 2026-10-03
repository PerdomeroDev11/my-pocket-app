import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { 
    CreateFinancialPageInterface, 
    financialPageResponseInterface, 
    LastPageResponseIdInterfaces, 
    StatusPagesInterface,
} from "./interface/financial-page.model";
import { Observable, Subject } from "rxjs";

@Injectable({providedIn: 'root'})
export class FinancialPageService {
    private http = inject(HttpClient)
    private baseUrl = `${environment.apiUrl}/financial-pages`

    private pageFinancialDate = new Subject<void>()
    pageFinancialDate$ = this.pageFinancialDate.asObservable()

    emitPageFinancialDate(){
        this.pageFinancialDate.next()
    }

    createPage(data: CreateFinancialPageInterface): Observable<financialPageResponseInterface>{
        return this.http.post<financialPageResponseInterface>(`${this.baseUrl}/new-page` , data , {withCredentials: true})
    }
    getFiancianPages():Observable<financialPageResponseInterface[]>{
        return this.http.get<financialPageResponseInterface[]>(`${this.baseUrl}/list` , {withCredentials: true})
    }
    getLastPage(): Observable<LastPageResponseIdInterfaces> {
        return this.http.get<LastPageResponseIdInterfaces>(`${this.baseUrl}/last`, { withCredentials: true })
    }
    changeStatusPage(id:string):Observable<StatusPagesInterface>{
        return this.http.patch<StatusPagesInterface>(`${this.baseUrl}/change-status-page/${id}` , {} , {withCredentials: true})
    }
}