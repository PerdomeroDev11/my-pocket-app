import { Component, inject, input } from '@angular/core';
import { ModalService } from '../../../../../shared/services/modal.service';
import { FinancialPageService } from '../../../fin-page/financial-pages.service';
import { MovementResponseInterface } from '../../interfaces/movements.interface';
import { UpdateMovementComponent } from './update-movement.component';

@Component({
  selector: 'app-button-Update-movement',
  standalone: true,
  template: `
    <button
      type="button"
      class="rounded-lg  px-1 py-1 p-0 m-0 text-sm font-semibold text-white transition hover:bg-blue-700- focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
      (click)="openModal()"
    >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
  </svg>
    </button>
  `,
})
export class ButtonUpdateMovementComponent {
  private modalService = inject(ModalService);
  private financialPageService = inject(FinancialPageService);

  movement = input.required<MovementResponseInterface>();
  categoryId = input.required<string>();
  id = input.required<string>();
  pageId = input.required<string>();

  async openModal() {
    const modal = this.modalService.open(UpdateMovementComponent, {
      movement: this.movement(),
      categoryId: this.categoryId(),
      id: this.id(),
      pageId: this.pageId(),
    });

    const wasCreated = await modal.afterClosed();
    if (wasCreated) {
      this.financialPageService.emitPageFinancialDate();
    }
  }
}
