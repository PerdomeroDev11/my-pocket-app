import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CreateMovementInterface, DeleteMovementInterface, UpdateMovementInterface } from './interfaces/movements.interface';

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
  updateMovement(
    data: UpdateMovementInterface,
    pageId: string,
    categoryId: string,
    id: string,
    file?: File | null,
  ) {
    const url = `${this.baseUrl}/update/${pageId}/categories/${categoryId}/movement/${id}`;
    const payload = {
      ...data,
      ...(data.name !== null && data.name !== undefined ? { name: data.name.trim() || undefined } : {}),
      ...(data.description !== null && data.description !== undefined ? { description: data.description.trim() || undefined } : {}),
      ...(data.amount !== null && data.amount !== undefined ? { amount: Number(data.amount) } : {}),
      ...(data.date !== null && data.date !== undefined ? { date: String(data.date) } : {}),
      ...(data.isPay !== null && data.isPay !== undefined ? { isPay: Boolean(data.isPay) } : {}),
      ...(data.institutionFinancialId ? { institutionFinancialId: data.institutionFinancialId } : {}),
    };

    if (file) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });
      formData.append('file', file);

      return this.http.put(url, formData, { withCredentials: true });
    }

    return this.http.put(url, payload, { withCredentials: true });
  }
  deleteMovement(
    id: string,
    pageId: string,
    categoryId: string,
    data: DeleteMovementInterface
  ){
    const url = `${this.baseUrl}/${id}/page/${pageId}/categories/${categoryId}`;
    return this.http.patch(url,data, {withCredentials: true });
  }
}
