import { Component, inject, OnInit, signal } from "@angular/core";
import { FinancialInstitutionsService } from "../financial-institutions.service";
import { FinancialInstitutionsResponse } from "../interfaces/financial-institutions";
import { HttpErrorResponse } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { FinancialPageService } from "../../financial-pages/fin-page/financial-pages.service";


@Component ({
    selector: 'app-options-financial-institution',
    standalone: true,
    template: `
        <div class="w-full space-y-2">
            @if (isLoading()) {
                <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    Loading...
                </div>
            }

            <label for="financial-institution" class="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                Financial institution
            </label>

            <div class="relative">
                <select
                    id="financial-institution"
                    [attr.aria-label]="'Financial institution'"
                    class="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                >
                    @if (financialIntitutions().length === 0) {
                        <option value="" class="bg-white text-slate-900">No financial institutions</option>
                    }

                    @for (institution of financialIntitutions(); track institution.id) {
                        <option [value]="institution.id" class="bg-white text-slate-900">
                            {{ institution.name }}
                        </option>
                    }
                </select>

                <svg
                    class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                </svg>
            </div>
        </div>
    `
})
export class OptionsFinancialInstitutuionComponent implements OnInit{
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
        this.financialInstitutionService.getInstitutionOptions().subscribe({
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