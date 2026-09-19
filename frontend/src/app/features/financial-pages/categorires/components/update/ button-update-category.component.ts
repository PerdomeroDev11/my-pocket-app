import {Component,inject, input} from '@angular/core';
import { ModalService } from "../../../../../shared/services/modal.service";
import { UpdateCategoryComponent } from "./update-category.component";
import { FinancialPageService } from '../../../fin-page/financial-pages.service';
import { CategoriesResponse } from '../../interface/categorie.interface';


@Component({
    selector: 'app-button-update-category',
    standalone: true,
    template: `
        <button (click)="openModal()" class="p-1 rounded-2xl  text-white hover:bg-blue-900">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
  </svg>
        </button>
    `
})
export class ButtonUpdateCategoryComponent{
    private modalService = inject(ModalService);
    private financialPageService = inject(FinancialPageService);

  category = input.required<CategoriesResponse>();

    async openModal() {
    console.log('ButtonUpdateCategoryComponent category input:', this.category())
    const modal = this.modalService.open(UpdateCategoryComponent, { category: this.category() });
    const isUpdated = await modal.afterClosed();
    if (isUpdated) {
      this.financialPageService.emitPageFinancialDate();
    }
  }
}