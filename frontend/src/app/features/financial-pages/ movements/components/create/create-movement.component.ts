import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MODAL_DATA } from '../../../../../shared/tokens/modal-data.token';
import { MODAL_REF, ModalRef } from '../../../../../shared/services/modal.service';
import {  FinancialInstitutionsService } from '../../../../financial-institutions/financial-institutions.service';
import { CreateMovementInterface, ModalMovementData, TypeMovementEnum } from '../../interfaces/movements.interface';
import { MovementsService } from '../../movemets.service';
import {  FinancialInstitutionsResponse } from '../../../../financial-institutions/interfaces/financial-institutions';
import { OptionsFinancialInstitutuionComponent } from '../../../../financial-institutions/components/options-institutions.component';



@Component({
  selector: 'app-create-movement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,OptionsFinancialInstitutuionComponent],
  template: `
    <div class="w-[min(32rem,92vw)] rounded-2xl bg-white p-6 shadow-xl">
      <div class="mb-5 flex items-center justify-between gap-3">
        <h2 class="text-xl font-semibold text-slate-900">Create movement</h2>
        <button type="button" class="text-sm text-slate-500 hover:text-slate-800" (click)="onCancel()">
          Close
        </button>
      </div>

      <form [formGroup]="movementForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            formControlName="name"
            class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="e.g. Salary, transportation, rent payment"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            formControlName="description"
            rows="3"
            class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="e.g. Utilities payment, salary income"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Amount</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              formControlName="amount"
              class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              formControlName="date"
              class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Type</label>
            <select formControlName="typeMovement" class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
              @for (type of typeOptions; track type.value) {
                <option [value]="type.value">{{ type.label }}</option>
              }
            </select>
          </div>

          <app-options-financial-institution/>
        </div>

        <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" formControlName="isPay" class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          Has it been paid yet?
        </label>

        @if (messageError()) {
          <p class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ messageError() }}
          </p>
        }

        <div class="flex justify-end gap-3 pt-2">
          <button type="button" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" (click)="onCancel()">
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="movementForm.invalid || isLoading()"
            class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {{ isLoading() ? 'Saving...' : 'Create movement' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CreateMovementComponent {
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private movementsService = inject(MovementsService);
  private institutionsService = inject(FinancialInstitutionsService);
  private modalRef = inject(MODAL_REF) as ModalRef<boolean>;
  private modalData = inject(MODAL_DATA) as ModalMovementData;

  readonly isLoading = signal(false);
  readonly messageError = signal<string | null>(null);
  readonly financialInstitutions = signal<FinancialInstitutionsResponse[]>([]);

  readonly typeOptions = [
    { value: TypeMovementEnum.INCOME, label: 'Income' },
    { value: TypeMovementEnum.EXPENSE, label: 'Expense' },
    { value: TypeMovementEnum.SAVING, label: 'Savings' },
    { value: TypeMovementEnum.INVESTMENT, label: 'Investment' },
  ];

  readonly pageId = computed(() => this.modalData.pageId ?? '');
  readonly categoryId = computed(() => this.modalData.categoryId ?? '');

  movementForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString().slice(0, 10), [Validators.required]],
    isPay: [false],
    typeMovement: [TypeMovementEnum.EXPENSE, [Validators.required]],
    institutionFinancialId: [null as string | null],
  });

  onSubmit(): void {
    if (this.movementForm.invalid) {
      this.movementForm.markAllAsTouched();
      return;
    }

    const formValue = this.movementForm.getRawValue();
    const pageId = this.pageId();
    const categoryId = this.categoryId();

    if (!pageId || !categoryId) {
      this.messageError.set('Page or category information is missing.');
      this.toastr.error('Page or category information is missing.');
      return;
    }

    this.isLoading.set(true);
    this.messageError.set(null);

    const payload: CreateMovementInterface = {
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      amount: Number(formValue.amount),
      date: String(formValue.date),
      isPay: Boolean(formValue.isPay),
      typeMovement: formValue.typeMovement as TypeMovementEnum,
      ...(formValue.institutionFinancialId ? { institutionFinancialId: formValue.institutionFinancialId } : {}),
    };

    this.movementsService.createMovement(payload, pageId, categoryId).subscribe({
      next: () => {
        this.handleSuccess();
      },
      error: (err: HttpErrorResponse) => {
        this.handleError(err);
      },
    });
  }

  onCancel(): void {
    this.modalRef.close(false);
  }



  private handleSuccess(): void {
    this.isLoading.set(false);
    this.toastr.success('Movement created successfully');
    this.modalRef.close(true);
  }

  private handleError(err: HttpErrorResponse): void {
    this.isLoading.set(false);
    this.messageError.set(err.error?.message ?? 'Could not create the movement.');
    this.toastr.error('Could not create the movement');
  }
}
