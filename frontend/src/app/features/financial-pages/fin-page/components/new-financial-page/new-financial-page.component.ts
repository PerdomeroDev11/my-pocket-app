import { ToastrService } from "ngx-toastr";
import { FinancialPageService} from "../../financial-pages.service";
import { Component, inject, signal } from "@angular/core";
import { financialPageResponseInterface } from "../../interface/financial-page.model";
import { Router } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MODAL_REF, ModalRef } from "../../../../../shared/services/modal.service";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    selector: 'app-new-financial-page',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: 'new-financial-page.component.html'
})
export class FinancialPageComponent {
    private financialPageService = inject(FinancialPageService)
    private toastr = inject(ToastrService)
    private router = inject(Router)
    private fb = inject(FormBuilder)
    readonly modalRef = inject(MODAL_REF) as ModalRef<boolean>;

    isLoading = signal<Boolean>(false)
   

    formatDate(dateStr: string | Date): string {
        const dateNow = new Date(dateStr);
    
        const options: Intl.DateTimeFormatOptions = { 
            day: 'numeric', 
            month: 'long' 
        };
        return new Intl.DateTimeFormat(undefined, options).format(dateNow);
    }

    formName = this.fb.nonNullable.group({
        name: [this.formatDate(new Date()) ,[Validators.required]]
    })
    
    onSubmit(){
        this.createNewPage()
    }
    private createNewPage(){
        this.isLoading.set(true)
        const namePage : string = this.formName.controls.name.value
        this.financialPageService.createPage({name: namePage}).subscribe({
            next: (response: financialPageResponseInterface) => {
                this.handleSuccess(response)
            },
            error: (err:HttpErrorResponse) => {
                this.handleError(err)
            }
        })
    }
    private handleSuccess(response: financialPageResponseInterface){
        this.isLoading.set(false)
        this.router.navigate([`/financial-pages/${response.id}`])
        this.toastr.success('Financial page created successfully', 'Success')
    }
    private handleError(err: HttpErrorResponse){
        this.isLoading.set(false)
        this.toastr.error(err.error.message || 'Cannot create financial page', 'Error')
        console.error('FinancialPageComponent: error creating financial page:', err)
    }
}