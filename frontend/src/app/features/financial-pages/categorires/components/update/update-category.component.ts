import {Component, inject , signal, OnInit} from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import {CategoriesService} from "../../categories.service";
import { MODAL_REF, ModalRef } from "../../../../../shared/services/modal.service";
import { MODAL_DATA } from "../../../../../shared/tokens/modal-data.token";
import { CategoriesResponse, UpdateCategoryInterface } from "../../interface/categorie.interface";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    selector: 'app-update-category',
    imports: [ReactiveFormsModule],
    standalone: true,
    template: `
        <div>
            @if(messageError()){
                <p class="text-red-500">{{messageError()}}</p>
            }
            <h3>Update Category</h3>
            <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
                <div class="form-group">
                    <label for="name">Category Name</label>
                    <input type="text" id="name" formControlName="name" class="form-control">
                </div>
                <div class="form-check">
                    <input type="checkbox" id="isRecurrent" formControlName="isRecurrent" class="form-check-input">
                    <label for="isRecurrent" class="form-check-label">Is Recurrent</label>
                </div>
                <button type="submit" [disabled]="categoryForm.invalid" class="btn btn-primary">{{isLoading() ? 'Updating...' : 'Update Category'}}</button>
            </form>
        </div>
    `   
})
export class UpdateCategoryComponent implements OnInit{
    private fb = inject(FormBuilder)
    private categoryService = inject(CategoriesService)
    private modaleRef = inject(MODAL_REF) as ModalRef<boolean>
    private modaData = inject(MODAL_DATA ) as {category?: CategoriesResponse} 

    isLoading = signal<boolean>(false)
    messageError = signal<string | null>(null)

    categoryForm = this.fb.group({
        name: [this.modaData?.category?.name ?? ''],
        isRecurrent: [this.modaData?.category?.isRecurrent ?? false]
    })

    ngOnInit(): void {
        console.log('UpdateCategoryComponent modaData:', this.modaData)
        if (this.modaData?.category) {
            this.categoryForm.patchValue({
                name: this.modaData.category.name ?? '',
                isRecurrent: this.modaData.category.isRecurrent ?? false
            })
        }
    }

    onSubmit(){
        if(this.categoryForm.invalid) return

        this.isLoading.set(true)
        const form: UpdateCategoryInterface = this.categoryForm.value as UpdateCategoryInterface
        console.log('form', form)
        const categoryId: string = this.getCategoryId()
        console.log('categoryId', categoryId)
        if (!categoryId) {
            this.isLoading.set(false)
            this.messageError.set('Category data is missing')
            return
        }
        this.categoryService.updateCategory(form, categoryId).subscribe({
            next: (response: UpdateCategoryInterface) =>{
                this.handleSuccess(response)
            },
            error: (err: HttpErrorResponse   ) =>{
                this.handleError(err)
            }
        })
    }
    private getCategoryId():string{
        return this.modaData?.category?.id ?? ''
    }

    private handleSuccess(response: UpdateCategoryInterface){
        this.isLoading.set(false)
        console.log('UpdateCategoryComponent: update response:', response)
        this.modaleRef.close(true)
    }

    private handleError(err: HttpErrorResponse){
        this.isLoading.set(false)
        console.log('UpdateCategoryComponent: update error:', err)
        this.messageError.set(err.error?.message ?? 'Error updating category')
    }
}