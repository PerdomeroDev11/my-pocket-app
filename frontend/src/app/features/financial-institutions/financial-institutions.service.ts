import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateFinancialInstitutionInterface, FinancialInstitutionsResponse, UpdateFinancialInstitutionInterface } from './interfaces/financial-institutions';

@Injectable({ providedIn: 'root' })
export class FinancialInstitutionsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/financial-institutions`;

  getInstitutions(): Observable<FinancialInstitutionsResponse[]> {
    return this.http.get<FinancialInstitutionsResponse[]>(this.baseUrl, { withCredentials: true });
  }
  createInsitutionFinancial(date: CreateFinancialInstitutionInterface): Observable<FinancialInstitutionsResponse>{
    return this.http.post<FinancialInstitutionsResponse>(`${this.baseUrl}/create`, date , {withCredentials: true})
  }
  updateIntitutionFinancial(id: string,date: UpdateFinancialInstitutionInterface): Observable<FinancialInstitutionsResponse>{
    return this.http.put<FinancialInstitutionsResponse>(`${this.baseUrl}/${id}` , date , {withCredentials: true})
  }
  desactiveInstitutionFinancial(id: string): Observable<FinancialInstitutionsResponse>{
    return this.http.patch<FinancialInstitutionsResponse>(`${this.baseUrl}/desative/${id}` , {} , {withCredentials:true})
  }
  activeInstitutionFinancial(id: string): Observable<FinancialInstitutionsResponse>{
  return this.http.patch<FinancialInstitutionsResponse>(`${this.baseUrl}/active/${id}` , {} , {withCredentials: true})
  }
  getInstitutionOptions():Observable<FinancialInstitutionsResponse[]>{
    return this.http.get<FinancialInstitutionsResponse[]>(`${this.baseUrl}/options`, { withCredentials: true });
  }
}
