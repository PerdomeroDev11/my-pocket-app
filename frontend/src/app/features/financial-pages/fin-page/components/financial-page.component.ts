import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { FinancialPageService } from "../financial-pages.service";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";
import { ListFinancialPageComponent } from "./list-financial-page.component";
import { StatusPagesInerface , StatusPageEnum } from "../interface/financial-page.model";
import { StatusToggleComponent } from "../../../../shared/components/togglet/status-togglet.component";
import { Subscription } from "rxjs/internal/Subscription";
import { tap } from "rxjs/internal/operators/tap";
import { ButtonNewCategoryComponent } from "../../categorires/components/create/button-new-category.component";
import { ButtonUpdateCategoryComponent } from "../../categorires/components/update/ button-update-category.component";
import { ButtonDeleteCategoryComponent } from "../../categorires/components/soft-delete/button-category.component";
import { ButtonNewMovementComponent } from "../../ movements/components/create/button-new-movement.component";
import { ButtonUpdateMovementComponent } from "../../ movements/components/update/button-update-movement.component";
import { MovementResponseInterface, UpdateMovementInterface } from "../../ movements/interfaces/movements.interface";
import { MovementsService } from "../../ movements/movemets.service";
import { ButtonDeleteMovementComponent } from "../../ movements/components/delete/button-delete-movement.component";

@Component({
    standalone: true,
    selector: 'app-financial-page-component',
    imports: [
    CommonModule,
    ListFinancialPageComponent,
    StatusToggleComponent,
    ButtonNewCategoryComponent,
    ButtonUpdateCategoryComponent,
    ButtonDeleteCategoryComponent,
    ButtonNewMovementComponent,
    ButtonUpdateMovementComponent,
    ButtonNewMovementComponent,
    ButtonDeleteMovementComponent
],
    templateUrl: 'financial-page.component.html',
    styleUrl: 'financial-page.style.css'
})
export class FinancialPageComponent implements OnInit , OnDestroy {
    private financialPageService = inject(FinancialPageService)
    private movementsService = inject(MovementsService)
    private route = inject(ActivatedRoute)
    private toastr = inject(ToastrService)

    isLoading = signal<boolean>(false)
    dateFinancialPage = signal<any | null>(null)
    private sub$ = new Subscription()
    pageId = signal<string>('')
    statusPage = signal<StatusPagesInerface>({status: StatusPageEnum.ACTIVE})


  ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            this.pageId.set(params.get('id') || '')
            this.loadDatePage()
            this.sub$ = this.financialPageService.pageFinancialDate$.pipe(
                tap(() =>{
                    this.loadDatePage()
                })
            ).subscribe()
            this.loadCurrentPageStatus()
        })
    }
    findCategoryById(id: string) {
        return this.dateFinancialPage()?.categories?.find((category: any) => category.id === id) || null
    }

    changeToggletStatus(){
        const financialPageId : string= this.pageId()
        this.financialPageService.changeStatusPage(financialPageId).subscribe({
            next: (response : StatusPagesInerface) =>{
                this.statusPage.set({status: response.status as StatusPageEnum})
                this.loadCurrentPageStatus()
                this.toastr.success('Status updated successfully', response.status)
            },
            error:(err) => {
                this.toastr.error('Could not change the status')
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
        console.log('FinancialPageComponent: loading page with id:', financialPageId)
        this.financialPageService.pageFInancialDate(financialPageId).subscribe({
            next: (response : any) => {
                console.log('FinancialPageComponent: pageFInancialDate response:', response)
                this.dateFinancialPage.set(response)
                this.isLoading.set(false)
            },
            error: (err) => {
                console.log('error: ' , err)
                this.toastr.error('Error loading financial page data')
            }
        })
    }

    toggleMovementPaid(categoryId: string, movement: MovementResponseInterface, event: Event): void {
        const checked = (event.target as HTMLInputElement).checked;

        const payload: UpdateMovementInterface = {
            isPay: checked,
            typeMovement: movement.typeMovement,
            ...(movement.name !== undefined && movement.name !== null ? { name: movement.name } : {}),
            ...(movement.description !== undefined && movement.description !== null ? { description: movement.description } : {}),
            ...(movement.amount !== undefined && movement.amount !== null ? { amount: movement.amount } : {}),
            ...(movement.date ? { date: new Date(movement.date).toISOString().slice(0, 10) } : {}),
            ...(movement.institutionFinancial?.id ? { institutionFinancialId: movement.institutionFinancial.id } : {}),
        };

        this.movementsService.updateMovement(payload, this.pageId(), categoryId, movement.id).subscribe({
            next: () => {
                const current = this.dateFinancialPage();
                if (!current) return;

                const updated = current.map((category: any) => ({
                    ...category,
                    movements: category.movements.map((item: MovementResponseInterface) =>
                        item.id === movement.id ? { ...item, isPay: checked } : item,
                    ),
                }));

                this.dateFinancialPage.set(updated);
                this.toastr.success(checked ? 'Movement marked as paid' : 'Movement marked as unpaid');
            },
            error: () => {
                this.toastr.error('Could not update the movement status');
                const input = event.target as HTMLInputElement;
                input.checked = !checked;
            },
        });
    }
    ngOnDestroy(): void {
        this.sub$.unsubscribe()
    }
}