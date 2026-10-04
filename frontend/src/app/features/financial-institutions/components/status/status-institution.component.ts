import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FinancialInstitutionsService } from '../../financial-institutions.service';
import { statusInstitutionEnum } from '../../interfaces/financial-institutions';

@Component({
  selector: 'app-status-institution-financial',
  standalone: true,
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="isEnabled()"
      [disabled]="isLoading()"
      (click)="toggleStatus()"
      class="relative inline-flex h-4 w-8 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      [ngClass]="isEnabled() ? 'bg-emerald-500' : 'bg-slate-300'"
    >
      <span
        class="inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-200"
        [ngClass]="isEnabled() ? 'translate-x-4' : 'translate-x-0.5'"
      ></span>
    </button>
  `,
  imports: [CommonModule],
})
export class UpdateStatusInstitutionFinancialComponent implements OnInit {
  private institutionFinancialService = inject(FinancialInstitutionsService);
  private toastr = inject(ToastrService);

  readonly statusInput = input.required<statusInstitutionEnum>();
  readonly idInstitutionFinancial = input.required<string>();

  isLoading = signal(false);
  isMessage = signal<string | null>(null);
  isEnabled = signal(false);

  ngOnInit(): void {
    this.isEnabled.set(this.statusInput() === statusInstitutionEnum.ACTIVE);
  }

  toggleStatus(): void {
    const nextStatus = this.isEnabled() ? statusInstitutionEnum.DESACTIVE : statusInstitutionEnum.ACTIVE;
    this.updateStatus(nextStatus);
  }

  private updateStatus(nextStatus: statusInstitutionEnum): void {
    this.isLoading.set(true);
    this.isMessage.set(null);

    const request$ =
      nextStatus === statusInstitutionEnum.ACTIVE
        ? this.institutionFinancialService.activeInstitutionFinancial(this.idInstitutionFinancial())
        : this.institutionFinancialService.desactiveInstitutionFinancial(this.idInstitutionFinancial());

    request$.subscribe({
      next: () => {
        this.isEnabled.set(nextStatus === statusInstitutionEnum.ACTIVE);
        this.isLoading.set(false);
        this.toastr.success('Financial institution status updated successfully');
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.isMessage.set(err.error?.message || 'Error updating the financial institution');
        this.toastr.error('Error, cannot update this financial institutions');
        console.error('There is an error to update a financial institution:', err);
      },
    });
  }
}