import { Component, inject, input } from "@angular/core";
import { ModalService } from "../../../../../shared/services/modal.service";
import { DeleteCategoryComponent } from "./ delete-category.component";
import { FinancialPageService } from "../../../fin-page/financial-pages.service";

@Component({
    selector: 'app-button-delete-category',
    standalone: true,
    template: `
        <button (click)="openModal()" class="p-4 bg-red-500 text-white hover:bg-red-600">Delete Category</button>
    `
})
export class ButtonDeleteCategoryComponent{
    private financialPageService = inject(FinancialPageService);
    private modalService = inject(ModalService);
    categoryId = input.required<string>(); 
    async openModal(){
        const modal = this.modalService.open(DeleteCategoryComponent, { categoryId: this.categoryId() });
        const isDeleted$ = await modal.afterClosed();
        if(isDeleted$){
            this.financialPageService.emitPageFinancialDate()
        }
    }   
}