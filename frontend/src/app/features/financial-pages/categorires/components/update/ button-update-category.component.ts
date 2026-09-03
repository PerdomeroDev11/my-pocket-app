import {Component,inject, input} from '@angular/core';
import { ModalService } from "../../../../../shared/services/modal.service";
import { UpdateCategoryComponent } from "./update-category.component";
import { FinancialPageService } from '../../../fin-page/financial-pages.service';
import { CategoriesResponse } from '../../interface/categorie.interface';


@Component({
    selector: 'app-button-update-category',
    standalone: true,
    template: `
        <button (click)="openModal()" class="p-4 bg-blue-500 text-white hover:bg-blue-600">Update Category</button>
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