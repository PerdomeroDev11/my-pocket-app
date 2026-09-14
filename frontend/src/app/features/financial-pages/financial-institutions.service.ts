import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FinancialInstitutionOption {
  id: string;
  name: string;
  status?: string | null;
}

@Injectable({ providedIn: 'root' })
export class FinancialInstitutionsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/financial-institutions`;

  getInstitutions(): Observable<FinancialInstitutionOption[]> {
    return this.http.get<FinancialInstitutionOption[]>(this.baseUrl, { withCredentials: true });
  }
}
