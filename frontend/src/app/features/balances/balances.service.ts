import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { BalanceResponse } from "./interface/balance-response";

@Injectable({providedIn: 'root'})
export class BalancesServices {
    private readonly baseUrl = `${environment.apiUrl}/balance`
    private http = inject(HttpClient)
    private readonly balanceRefreshSubject = new Subject<void>();
    readonly balanceRefresh$ = this.balanceRefreshSubject.asObservable();

    refreshBalance(): void {
        this.balanceRefreshSubject.next();
    }

    getAllBalance():Observable<BalanceResponse[]>{
        return this.http.get<BalanceResponse[]>(`${this.baseUrl}` , {withCredentials: true})
    }

}