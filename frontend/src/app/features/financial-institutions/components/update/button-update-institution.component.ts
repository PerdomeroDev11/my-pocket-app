import { Component, inject, input } from '@angular/core';
import { ModalService } from '../../../../shared/services/modal.service';
import { FinancialPageService } from '../../../financial-pages/fin-page/financial-pages.service';
import { UpdateInstitutionFinancialComponent } from './update-institution.component';
import {
  FinancialInstitutionsResponse,
  typeInstitutionEnum,
  UpdateFinancialInstitutionInterface,
} from '../../interfaces/financial-institutions';

@Component({
  selector: 'app-button-update-insitution-financial',
  standalone: true,
  template: `
    <button
      type="button"
      class="rounded-lg  px-1 py-1 p-0 m-0 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
      (click)="openModal()"
    >
     <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
  </svg>
    </button>
  `,
})
export class ButtonUpdateInsitutionFinancialComponent {
  private modalService = inject(ModalService);
  private financialPageService = inject(FinancialPageService)

  financialIntitution = input.required<FinancialInstitutionsResponse>()
  idInstitutionFinancial = input.required<string>()

  async openModal() {
    const modal = this.modalService.open(UpdateInstitutionFinancialComponent, {
      institution: this.financialIntitution(),
      idInstitution: this.idInstitutionFinancial(),
    });

    const wasCreated = await modal.afterClosed();
    if (wasCreated) {
      this.financialPageService.emitPageFinancialDate();
    }
  }
}
