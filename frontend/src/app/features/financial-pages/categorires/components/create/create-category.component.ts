import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { CategoriesService } from "../../categories.service";
import { ToastrService } from "ngx-toastr";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { CategoriesResponse, CreateCategoriesInterface } from "../../interface/categorie.interface";
import { MODAL_REF, ModalRef } from "../../../../../shared/services/modal.service";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    selector: 'app-create-categoy-component',
    standalone: true,
    imports: [CommonModule,ReactiveFormsModule],
    templateUrl: './create-category.component.html',
})
export class CreateCategoryComponent{
    private categoriesService = inject(CategoriesService)
    private toastr = inject(ToastrService)
    private fb = inject(FormBuilder)
    readonly modalRef = inject(MODAL_REF) as ModalRef<boolean>

    isLoading = signal<boolean>(false)
    errMesagge = signal<string | null>(null)

    categoryForm = this.fb.nonNullable.group({
        name: ['' , [Validators.required]],
        isRecurrent: [false]
    })
    onCancel(){
        this.modalRef.close(false)
    }
    onSubmit(){
        this.createCategory()
    }
    private createCategory(){
        if(this.categoryForm.invalid) return

        this.isLoading.set(true)
        const rawValues = this.categoryForm.getRawValue()

        const form: CreateCategoriesInterface = {
            ...rawValues,
            name: rawValues.name.toUpperCase()
        }
        this.categoriesService.createCategory(form).subscribe({
            next: (response: CategoriesResponse) =>{
                this.handleSuccess(response)
            },
            error: (err: HttpErrorResponse) =>{
                this.handleError(err)
            }
        })
    }
    
    private handleSuccess(response: CategoriesResponse){
        this.isLoading.set(false)
        this.toastr.success('successlly created category')
        this.modalRef.close(true)
    }
    private handleError(err: HttpErrorResponse){
        this.isLoading.set(false)
        this.errMesagge.set(err.error.message)
        console.error('CreateCategoryComponent: error creating category:', err)
        this.toastr.error('Oops!, cannot craate to category')
    }
    
}