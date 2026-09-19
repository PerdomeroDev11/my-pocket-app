import { Component,inject, input } from "@angular/core";
import { CategoriesService } from '../../categories.service'
import { ToastrService } from "ngx-toastr";
import { HttpErrorResponse } from "@angular/common/http";
import { MODAL_REF, ModalRef } from "../../../../../shared/services/modal.service";
import { MODAL_DATA } from "../../../../../shared/tokens/modal-data.token";

@Component({
    selector: 'app-delete-category',
    standalone: true,
    template: `
        <div class="w-[min(32rem,92vw)] rounded-2xl bg-white p-6 shadow-xl">
            <div class="mb-5 flex items-center justify-between gap-3">
                <h2 class="text-xl font-semibold text-slate-900">Delete category</h2>
                <button type="button" class="text-sm text-slate-500 hover:text-slate-800" (click)="modalRef.close(false)">
                    Close
                </button>
            </div>

            <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Are you sure you want to delete this category? This action cannot be undone.
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
                    (click)="onDelete()"
                >
                    Delete
                </button>
            </div>
        </div>
    `
})
export class DeleteCategoryComponent {
   private categoryService = inject(CategoriesService)
   private toastr = inject(ToastrService)
   modalRef = inject(MODAL_REF) as ModalRef<boolean>
   private modalData = inject(MODAL_DATA) as { categoryId?: string }


    onDelete(){
        const categoryId = this.modalData?.categoryId;
        if (!categoryId) {
            this.toastr.error('Category ID is missing');
            this.modalRef.close(false);
            return;
        }
        this.categoryService.solfDeleteCategory(categoryId).subscribe({
            next: () => {
                this.toastr.success('Category deleted successfully');
                this.categoryService.emitCategoryDate()
                this.modalRef.close(true)
            },
            error: (err: HttpErrorResponse) => {
                this.toastr.error('Failed to delete category');
                this.modalRef.close(false)
            }
        })
    }

}
