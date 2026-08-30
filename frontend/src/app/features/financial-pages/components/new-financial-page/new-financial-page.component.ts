import { ToastrService } from "ngx-toastr";
import { FinancialPageService} from "../../financial-pages.service";
import { Component, inject, signal } from "@angular/core";
import { financialPageResponseInterface } from "../../interface/financial-page.model";
import { Router } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MODAL_REF, ModalRef, ModalService } from "../../../../shared/services/modal.service";

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
        this.isLoading.set(true)
        const namePage : string = this.formName.controls.name.value
        this.financialPageService.createPage({name: namePage}).subscribe({
            next: (response: financialPageResponseInterface) => {
                this.isLoading.set(false)
                this.router.navigate([`/financial-pages/${response.id}`])
                
            },
            error: (err) => {
                this.isLoading.set(false)
                this.toastr.error('error')
            }
        })
    }
    
}