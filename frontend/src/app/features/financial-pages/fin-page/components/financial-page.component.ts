import { Component, inject, OnInit, signal } from "@angular/core";
import { FinancialPageService } from "../../financial-pages.service";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";
import { ListFinancialPageComponent } from "./list-financial-page.component";
import { StatusPagesInerface , StatusPageEnum } from "../interface/financial-page.model";
import { StatusToggleComponent } from "../../../../shared/components/togglet/status-togglet.component";

@Component({
    standalone: true,
    selector: 'app-financial-page-component',
    imports: [CommonModule,ListFinancialPageComponent,StatusToggleComponent],
    templateUrl: 'financial-page.component.html'
})
export class FinancialPageComponent implements OnInit {
    private financialPageService = inject(FinancialPageService)
    private route = inject(ActivatedRoute)
    private toastr = inject(ToastrService)

    isLoading = signal<boolean>(false)
    dateFinancialPage = signal<any | null>(null)
    pageId = signal<string>('')
    statusPage = signal<StatusPagesInerface>({status: StatusPageEnum.ACTIVE})



    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            this.pageId.set(params.get('id') || '')
            this.loadDatePage()
            this.loadCurrentPageStatus()
        })
    }

    changeToggletStatus(){
        const financialPageId : string= this.pageId()
        this.financialPageService.changeStatusPage(financialPageId).subscribe({
            next: (response : StatusPagesInerface) =>{
                this.statusPage.set({status: response.status as StatusPageEnum})
                this.loadCurrentPageStatus()
                this.toastr.success('Status actualizado', response.status)
            },
            error:(err) => {
                this.toastr.error('No se pudo cambiar el estado')
                console.log(err)
            }
        })
    }

    private loadCurrentPageStatus() {
        const financialPageId = this.pageId()
        if (!financialPageId) {
            return
        }

        this.financialPageService.getFiancianPages().subscribe({
            next: (pages) => {
                const currentPage = pages.find((page) => page.id === financialPageId)
                if (currentPage?.status) {
                    this.statusPage.set({ status: currentPage.status as StatusPageEnum })
                }
            },
            error: (err) => {
                console.log('error al cargar el estado de la página:', err)
            }
        })
    }

    loadDatePage(){
        this.isLoading.set(true)

        const financialPageId : string= this.pageId()
        this.financialPageService.pageFInancialDate(financialPageId).subscribe({
            next: (response : any) => {
                this.dateFinancialPage.set(response)
                this.isLoading.set(false)
            },
            error: (err) => {
                console.log('error: ' , err)
                this.toastr.error('error: ' , err)
            }
        })
    }
}