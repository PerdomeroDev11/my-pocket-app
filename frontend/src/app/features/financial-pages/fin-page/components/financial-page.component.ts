import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { FinancialPageService } from "../financial-pages.service";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";
import { ListFinancialPageComponent } from "./list-financial-page.component";
import { StatusPagesInterface , StatusPageEnum, financialPageResponseInterface } from "../interface/financial-page.model";
import { StatusToggleComponent } from "../../../../shared/components/togglet/status-togglet.component";
import { Subscription } from "rxjs/internal/Subscription";
import { ButtonNewCategoryComponent } from "../../categorires/components/create/button-new-category.component";
import { CategoriesComponent } from "../../categorires/components/categories.component";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    standalone: true,
    selector: 'app-financial-page-component',
    imports: [
        CommonModule,
        ListFinancialPageComponent,
        StatusToggleComponent,
        ButtonNewCategoryComponent,
        CategoriesComponent
    ],
    templateUrl: 'financial-page.component.html',
    styleUrl: 'financial-page.style.css'
})
export class FinancialPageComponent implements OnInit , OnDestroy {
    private financialPageService = inject(FinancialPageService)
    private route = inject(ActivatedRoute)
    private toastr = inject(ToastrService)
    private sub$ = new Subscription()

    isLoading = signal<boolean>(false)
    dateFinancialPage = signal<financialPageResponseInterface[] | null>(null)
    statusPage = signal<StatusPagesInterface>({status: StatusPageEnum.ACTIVE})
    
    readonly pageId = signal<string>('')
    


    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id') || ''
            this.pageId.set(id)
            this.isLoading.set(Boolean(id))

            if (id) {
                this.loadCurrentPageStatus()
            }
        })
    }
    ngOnDestroy(): void {
        this.sub$.unsubscribe()
    }
    changeToggletStatus(){
        const financialPageId : string= this.pageId()
        this.financialPageService.changeStatusPage(financialPageId).subscribe({
            next: (response : StatusPagesInterface) =>{
                this.handleSuccess(response)
            },
            error:(err:HttpErrorResponse) => {
                this.handleError(err)
            }
        })
    }

    private loadCurrentPageStatus() {
        const financialPageId = this.pageId()
        if (!financialPageId) {
            this.isLoading.set(false)
            return
        }

        this.isLoading.set(true)
        this.financialPageService.getFiancianPages().subscribe({
            next: (pages: financialPageResponseInterface[]) => {
                this.dateFinancialPage.set(pages)

                const currentPage = pages.find((page) => page.id === financialPageId)
                if (currentPage?.status) {
                    this.statusPage.set({ status: currentPage.status as StatusPageEnum })
                }

                this.isLoading.set(false)
            },
            error: (err: HttpErrorResponse) => {
                this.handleError(err)
            }
        })
    }
    private handleSuccess(response: StatusPagesInterface) {
        this.isLoading.set(false)
        this.statusPage.set({status: response.status as StatusPageEnum})
        this.loadCurrentPageStatus()
    }
    private handleError(err: HttpErrorResponse) {
        this.isLoading.set(false)
        this.toastr.error('Could not change the status')
        console.log('Error changing status:', err)
    }

    
}