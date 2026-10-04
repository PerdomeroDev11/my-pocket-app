import { Component, inject, OnInit, signal } from "@angular/core";
import { FinancialInstitutionsService } from "../financial-institutions.service";
import { FinancialInstitutionsResponse } from "../interfaces/financial-institutions";
import { HttpErrorResponse } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { FinancialPageService } from "../../financial-pages/fin-page/financial-pages.service";
import { ButtonCreateInsitutionFinancialComponent } from "./create/button-create-institution.component";
import { ButtonUpdateInsitutionFinancialComponent } from "./update/button-update-institution.component";
import { UpdateStatusInstitutionFinancialComponent } from "./status/status-institution.component";

@Component ({
    selector: 'app-financial-institution',
    standalone: true,
    imports: [
        ButtonCreateInsitutionFinancialComponent, 
        ButtonUpdateInsitutionFinancialComponent,
        UpdateStatusInstitutionFinancialComponent
    ],
    template: `
        <section class="relative mt-2 overflow-hidden rounded-[28px] border border-white/10 border-t-white/20 bg-black-russian-950/40 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-3xl sm:p-6">
            <div class="pointer-events-none absolute -top-16 right-0 h-20 w-60 rounded-full bg-blue-500/10 blur-2xl"></div>

            <div class="relative z-10 space-y-4">
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-black-russian-400">Financial institutions</p>
                        <h3 class="mt-1 text-xl font-bold tracking-tight text-black-russian-50">Accounts</h3>
                    </div>

                    <app-button-create-insitution-financial />
                </div>

                @if(isLoading()){
                    <div class="rounded-xl border border-white/10 bg-black-russian-900/40 px-3 py-2 text-sm text-black-russian-300">
                        Loading...
                    </div>
                }

                <div class="space-y-3">
                    @for (institution of financialIntitutions(); track institution.id) {
                        <article class="group rounded-2xl border border-white/10 bg-black-russian-900/30 p-4 transition-all duration-300 hover:border-white/20 hover:bg-black-russian-900/50">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <label class="block text-base font-semibold text-black-russian-50">{{ institution.name }}</label>
                                    <p class="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-black-russian-400">{{ institution.type }}</p>
                                </div>

                                <div class="text-right">
                                    <span class="block text-[10px] font-medium uppercase tracking-[0.18em] text-black-russian-500">Balance</span>
                                    <p class="mt-1 text-base font-semibold text-black-russian-50 text-emerald-600">{{ institution.balanceNow }}</p>
                                </div>
                            </div>

                            <div class="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                                <p class="text-xs text-black-russian-400">{{ formatDate(institution.createdAt) }}</p>

                                <div class="flex items-center gap-2">
                                    <app-status-institution-financial
                                        class="inline-flex"
                                        [idInstitutionFinancial]="institution.id"
                                        [statusInput]="institution.status"
                                    />

                                    <app-button-update-insitution-financial
                                        class="inline-flex"
                                        [financialIntitution]="institution"
                                        [idInstitutionFinancial]="institution.id"
                                    />
                                </div>
                            </div>
                        </article>
                    }
                </div>
            </div>
        </section>
    `
})
export class FinancialInstitutuionComponent implements OnInit{
    private financialInstitutionService = inject(FinancialInstitutionsService)
    private financialPageService = inject(FinancialPageService)
    private toastr = inject(ToastrService)
    
    readonly financialIntitutions = signal<FinancialInstitutionsResponse[]>([])
    isLoading = signal<boolean>(false)

    ngOnInit(): void {
        this.loadFinancialInstitution()
        this.financialPageService.pageFinancialDate$.subscribe(() => {
            this.loadFinancialInstitution();
        });
    }

    loadFinancialInstitution(){
        this.getFinancialInstitutions()
    }

    private getFinancialInstitutions(){
        console.log('data: ' , this.financialIntitutions())
        this.isLoading.set(true)
        this.financialInstitutionService.getInstitutions().subscribe({
            next:(reponse: FinancialInstitutionsResponse[]) => this.handleSuccess(reponse),
            error: (err: HttpErrorResponse) => this.handleError(err)
        })
    }

    private handleSuccess(response: FinancialInstitutionsResponse[]){
        this.isLoading.set(false)
        this.financialIntitutions.set(response)
    }

    formatDate(value: Date | string): string {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return '—'

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        }).format(date)
    }

    private handleError(err: HttpErrorResponse){
        this.isLoading.set(false)
        this.toastr.error('Error to load the financial intitutions')
        console.error('There is an error in financial insitution component: ', err)
    }
}