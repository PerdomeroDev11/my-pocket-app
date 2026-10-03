import {Component, inject} from "@angular/core";
import { CreateCategoryComponent } from "./create-category.component";
import { ModalService } from "../../../../../shared/services/modal.service";
import { FinancialPageService } from "../../../fin-page/financial-pages.service";

@Component({
    selector: 'app-button-new-category',
    standalone: true,
    template: `
        <button
            type="button"
            (click)="openModal()"
            class="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(34,211,238,0.35)] transition-all duration-200 hover:bg-cyan-500 hover:shadow-[0_12px_30px_rgba(34,211,238,0.45)] focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
        >
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1Z"/>
            </svg>
            New Category
        </button>
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