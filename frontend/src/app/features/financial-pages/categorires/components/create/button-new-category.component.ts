import {Component, inject} from "@angular/core";
import { CreateCategoryComponent } from "./create-category.component";
import { ModalService } from "../../../../../shared/services/modal.service";
import { filter } from "rxjs/internal/operators/filter";
import { tap } from "rxjs/internal/operators/tap";
import { FinancialPageService } from "../../../fin-page/financial-pages.service";

@Component({
    selector: 'app-button-new-category',
    standalone: true,
    template: `
        <button (click)="openModal()" class="p-4 bg-blue-500 text-white hover:bg-blue-600">New Category</button>
    `
})
export class ButtonNewCategoryComponent{
    private modalRef = inject(ModalService)
    private financialPageService = inject(FinancialPageService)
    async openModal(){
        const modal = this.modalRef.open(CreateCategoryComponent)
        const isCreated$ = await modal.afterClosed()
        if(isCreated$){
            this.financialPageService.emitPageFinancialDate()
        }
    }
}