import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { FinancialInstitutionsService } from "../../financial-institutions.service";
import { ToastrService } from "ngx-toastr";
import {  FinancialInstitutionsResponse, typeInstitutionEnum, UpdateFinancialInstitutionInterface } from "../../interfaces/financial-institutions";
import { MODAL_REF, ModalRef } from "../../../../shared/services/modal.service";
import { HttpErrorResponse } from "@angular/common/http";
import { MODAL_DATA } from "../../../../shared/tokens/modal-data.token";
import { UpdateStatusInstitutionFinancialComponent } from "../status/status-institution.component";

@Component({
    selector: 'app-create-insitution-financial',
    standalone: true,
    imports:[ReactiveFormsModule , UpdateStatusInstitutionFinancialComponent],
    template: `
        <div class="w-[min(32rem,92vw)] rounded-2xl bg-white p-6 shadow-xl">
            <div class="mb-5 flex items-center justify-between gap-3">
                <h2 class="text-xl font-semibold text-slate-900">Create financial institution</h2>
                <button type="button" class="text-sm text-slate-500 hover:text-slate-800" (click)="this.modalRef.close(false)">
                    Close
                </button>
            </div>

            @if (isMessage()) {
                <p class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {{ isMessage() }}
                </p>
            }

            <form [formGroup]="formInstitution" (ngSubmit)="onSubmit()" class="space-y-4">
                <div>
                    <label for="name" class="mb-1 block text-sm font-medium text-slate-700">Name</label>
                    <input
                        id="name"
                        type="text"
                        formControlName="name"
                        class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        placeholder="e.g. Bank of Chile, safe, Crypto wallet, loans"
                    />
                </div>

                <div>
                    <label for="type" class="mb-1 block text-sm font-medium text-slate-700">Type</label>
                    <select
                        id="type"
                        formControlName="type"
                        class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    >
                        @for (type of typesInstitucion; track type) {
                            <option [value]="type">{{ type }}</option>
                        }
                    </select>
                </div>

                <div>
                    <label for="balanceNow" class="mb-1 block text-sm font-medium text-slate-700">Balance</label>
                    <input
                        id="balanceNow"
                        type="number"
                        min="0"
                        step="0.01"
                        formControlName="balanceNow"
                        class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    />
                </div>
                <div>
                    <label for="status" lass="mb-1 block text-sm font-medium text-slate-700">Status</label>
                    <app-status-institution-financial
                    [idInstitutionFinancial]="idInstitutionFinancial()"
                    [statusInput]="financialIntitutionsInput().status"
                    />
                </div>

                <div class="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        (click)="this.modalRef.close(false)"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        [disabled]="isLoading() || formInstitution.invalid"
                        class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    >
                        {{ isLoading() ? 'Updating...' : 'Update' }}
                    </button>
                </div>
            </form>
        </div>
    `
})
export class UpdateInstitutionFinancialComponent  implements OnInit{
    private intitutionFinancialService = inject(FinancialInstitutionsService)
    private toastr = inject(ToastrService)
    private fb = inject(FormBuilder)
    private modalData = inject(MODAL_DATA) as {
        institution: FinancialInstitutionsResponse;
        idInstitution: string;
    }
    
    isLoading = signal<boolean>(false)
    isMessage = signal<string | null>(null)
    modalRef = inject(MODAL_REF) as ModalRef
    typesInstitucion = Object.values(typeInstitutionEnum);

    readonly financialIntitutionsInput = computed(() => this.modalData.institution)
    readonly idInstitutionFinancial = computed(() => this.modalData.idInstitution)

    formInstitution = this.fb.nonNullable.group({
        name: [this.financialIntitutionsInput().name],
        type: [this.financialIntitutionsInput().type],
        balanceNow: [Number(this.financialIntitutionsInput().balanceNow)]
    })
    
    ngOnInit(): void {
        this.financialIntitutionsInput();
    }
    onSubmit(){
        this.upadate()
    }
    private upadate(): void{
        if(!this.formInstitution.valid) return
        this.isLoading.set(true)
        this.isMessage.set(null)
        const dto = this.formInstitution.getRawValue()
        const payload: UpdateFinancialInstitutionInterface = {
            name: dto.name,
            type: dto.type,
            balanceNow: Number(dto.balanceNow),
            status: this.financialIntitutionsInput().status
        }
        this.intitutionFinancialService.updateIntitutionFinancial(this.idInstitutionFinancial(), payload).subscribe({
            next: () => this.handleSuccess(),
            error: (err: HttpErrorResponse) => this.handleError(err)
        })
    }
    private handleSuccess (){
        this.isLoading.set(false)
        this.modalRef.close(true)
        this.toastr.success('financial institutions updated successlly')
    }
    private handleError (err: HttpErrorResponse){
        this.isLoading.set(false)
        this.modalRef.close(false)
        this.isMessage.set(err.error?.message || 'Error updating the financial institution')
        this.toastr.error('Error, cannot update this financial institutions')
        console.error('there is an Error to update a financial Institutions: ' , err)
    }

}