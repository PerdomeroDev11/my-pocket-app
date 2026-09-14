import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CreateMovementInterface } from './interfaces/movements.interface';

@Injectable({
  providedIn: 'root',
})
export class MovementsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/movements`;

  createMovement(
    data: CreateMovementInterface,
    pageId: string,
    categoryId: string,
  ) {
    const payload: CreateMovementInterface = {
      name: data.name?.trim() || undefined,
      description: data.description?.trim() || undefined,
      amount: Number(data.amount),
      date: String(data.date),
      isPay: Boolean(data.isPay),
      typeMovement: data.typeMovement,
      ...(data.institutionFinancialId ? { institutionFinancialId: data.institutionFinancialId } : {}),
    };

    return this.http.post(
      `${this.baseUrl}/create/${pageId}/categories/${categoryId}`,
      payload,
      { withCredentials: true },
    );
  }
}
