import { Component, inject, input } from "@angular/core";
import { ModalService } from "../../../../../shared/services/modal.service";
import { FinancialPageService } from "../../../fin-page/financial-pages.service";
import { DeleteMovementComponent } from "./delete-movement.component";
import { TypeMovementEnum } from "../../interfaces/movements.interface";

@Component({
    selector: 'app-button-delete-movement',
    standalone: true,
    template: `
        <button (click)="openModal()" class="p-1 text-white  hover:bg-red-900 rounded-2xl"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg></button>
    `
})
export class ButtonDeleteMovementComponent{
    private financialPageService = inject(FinancialPageService);
    private modalService = inject(ModalService);
    categoryId = input.required<string>(); 
    movementId = input.required<string>();
    pageId = input.required<string>();
    isPay = input.required<boolean>()
    typeMovement = input.required<TypeMovementEnum>()
    async openModal(){
        const modal = this.modalService.open(DeleteMovementComponent, {
            id: this.movementId(),
            pageId: this.pageId(),
            categoryId: this.categoryId(),
            movement: {
                isPay: this.isPay(),
                typeMovement: this.typeMovement()
            }
        });
        const isDeleted$ = await modal.afterClosed();
        if(isDeleted$){
            this.financialPageService.emitPageFinancialDate()
        }
    }   
}