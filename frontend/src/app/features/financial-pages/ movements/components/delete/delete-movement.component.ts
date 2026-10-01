import { Component, computed, inject, signal } from "@angular/core";
import { MovementsService } from "../../movemets.service";
import { ToastrService } from "ngx-toastr";
import { HttpErrorResponse } from "@angular/common/http";
import { MODAL_REF, ModalRef } from "../../../../../shared/services/modal.service";
import { MODAL_DATA } from "../../../../../shared/tokens/modal-data.token";
import { DeleteMovementInterface, ModalMovementData } from "../../interfaces/movements.interface";


@Component({
    selector: 'app-delete-component',
    standalone: true,
    template: `
    <div class="w-[min(32rem,92vw)] rounded-2xl bg-white p-6 shadow-xl">
            <div class="mb-5 flex items-center justify-between gap-3">
                <h2 class="text-xl font-semibold text-slate-900">Delete Movement</h2>
                <button type="button" class="text-sm text-slate-500 hover:text-slate-800" (click)="modalRef.close(false)">
                    Close
                </button>
            </div>

            <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Are you sure you want to delete this movements? This action cannot be undone.
            </div>

            <div class="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    (click)="modalRef.close(false)"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                    (click)="onSubmit()"
                >
                    Delete
                </button>
            </div>
        </div>
    `
})
export class DeleteMovementComponent {
    private movementService = inject(MovementsService)
    private toastr = inject(ToastrService)
    
    private modalData = inject(MODAL_DATA) as ModalMovementData
    
    isLoading = signal<boolean>(false)
    isMessageError = signal<string | null>(null)
    modalRef = inject(MODAL_REF) as ModalRef<boolean>

    readonly pageId = computed(() => this.modalData?.pageId ?? '')
    readonly categoryId = computed(() => this.modalData?.categoryId ?? '')
    readonly movementId = computed(() => this.modalData?.id ?? '')
    readonly typeMovement = computed (() => {
        if(!this.modalData.movement?.typeMovement) throw new Error('the type movement must not  be null or undifined')
        return this.modalData.movement.typeMovement
    })
    readonly isPay = computed (() => {
        if(this.modalData.movement?.isPay == undefined) throw new Error('pay must not  be null or undifined')
        return this.modalData.movement.isPay
    })

    private handlerSuccess(){
        this.isLoading.set(false)
        this.modalRef.close(true)
        this.toastr.success('Movemet detele successlly')
    }
    private hanlderError(err: HttpErrorResponse){
        this.isLoading.set(false)
        this.modalRef.close(true)
        this.toastr.error('Oops!. there is something error')
        console.log('the error in detele movement id: ' , err)
    }
    private petitionService(
        id: string,
        pageId:string,
        categoryId: string,
    ){
        
        this.isLoading.set(true)
        console.log('isPay: ' , this.isPay())
        console.log('typeMovement: ' , this.typeMovement())
        const payload: DeleteMovementInterface = {
            isPay: this.isPay(),
            typeMovement: this.typeMovement()
        }
        this.movementService.deleteMovement(id,pageId,categoryId,payload).subscribe({
            next: () => this.handlerSuccess(),
            error: (err: HttpErrorResponse) => this.hanlderError(err)
        })
    }

    onSubmit(){
        this.petitionService(this.movementId() , this.pageId() , this.categoryId())
    }
}