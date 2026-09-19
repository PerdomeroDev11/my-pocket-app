import { Component, inject } from '@angular/core';
import { ModalService } from '../../../../../shared/services/modal.service';
import { FinancialPageComponent } from './new-financial-page.component';

@Component({
  selector: 'app-button-create-financial-page',
  standalone: true,
  template: `
    <button
      type="button"
      (click)="abrirModal()"
      class="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(37,99,235,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-[0_15px_30px_rgba(37,99,235,0.6)] active:translate-y-0"
    >
      <svg class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
      </svg>
      <span>New page</span>
    </button>
  `,
})
export class ButtonNewPageComponent {
  private modalService = inject(ModalService);

  abrirModal() {
    this.modalService.open(FinancialPageComponent);
  }
}