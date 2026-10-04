import { Component, inject, input } from '@angular/core';
import { ModalService } from '../../../../shared/services/modal.service';
import { CreateInstitutionFinancialComponent } from './create-institution.component';
import { FinancialPageService } from '../../../financial-pages/fin-page/financial-pages.service';


@Component({
  selector: 'app-button-create-insitution-financial',
  standalone: true,
  template: `
    <button
      type="button"
      (click)="openModal()"
      class="group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(37,99,235,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-[0_15px_30px_rgba(37,99,235,0.6)] active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
      </svg>
      <span>Add institution</span>
    </button>
  `,
})
export class ButtonCreateInsitutionFinancialComponent {
  private modalService = inject(ModalService);
  private financialPageService = inject(FinancialPageService)



  async openModal() {
    const modal = this.modalService.open(CreateInstitutionFinancialComponent);

    const wasCreated = await modal.afterClosed();
    if (wasCreated) {
      this.financialPageService.emitPageFinancialDate();
    }
  }
}
