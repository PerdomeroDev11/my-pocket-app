import { Component,inject, input } from "@angular/core";
import { CategoriesService } from '../categories.service'
import { ToastrService } from "ngx-toastr";
import { HttpErrorResponse } from "@angular/common/http";
import { MODAL_REF, ModalRef } from "../../../../shared/services/modal.service";
import { MODAL_DATA } from "../../../../shared/tokens/modal-data.token";

@Component({
    selector: 'app-delete-category',
    standalone: true,
    template: `
        <div>
            <h3>Delete Category</h3>
            <p>Are you sure you want to delete this category?</p>
            <button (click)="onDelete()" class="btn btn-danger">Delete</button>
        </div>
    `
})
export class DeleteCategoryComponent {
   private categoryService = inject(CategoriesService)
   private toastr = inject(ToastrService)
   private modalRef = inject(MODAL_REF) as ModalRef<boolean>
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
