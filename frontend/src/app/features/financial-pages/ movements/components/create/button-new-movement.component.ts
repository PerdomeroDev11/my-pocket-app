import { Component, inject, input } from '@angular/core';
import { ModalService } from '../../../../../shared/services/modal.service';
import { FinancialPageService } from '../../../fin-page/financial-pages.service';
import { CreateMovementComponent } from './create-movement.component';

@Component({
  selector: 'app-button-new-movement',
  standalone: true,
  template: `
    <button
      type="button"
      class="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
      (click)="openModal()"
    >
      New movement
    </button>
  `,
})
export class ButtonNewMovementComponent {
  private modalService = inject(ModalService);
  private financialPageService = inject(FinancialPageService);

  pageId = input.required<string>();
  categoryId = input.required<string>();

  async openModal() {
    const modal = this.modalService.open(CreateMovementComponent, {
      pageId: this.pageId(),
      categoryId: this.categoryId(),
    });

    const wasCreated = await modal.afterClosed();
    if (wasCreated) {
      this.financialPageService.emitPageFinancialDate();
    }
  }
}
