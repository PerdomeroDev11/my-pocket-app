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
        <div class="w-[min(32rem,92vw)] rounded-2xl bg-white p-6 ">
            <div class="mb-5 flex items-center justify-between gap-3">
                <h2 class="text-xl font-semibold text-slate-900">Edit category</h2>
                <button type="button" class="text-sm text-slate-500 hover:text-slate-800" (click)="modaleRef.close(false)">
                    Close
                </button>
            </div>

            @if(messageError()){
                <p class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {{messageError()}}
                </p>
            }

            <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="space-y-4">
                <div>
                    <label for="name" class="mb-1 block text-sm font-medium text-slate-700">Category name</label>
                    <input
                        type="text"
                        id="name"
                        formControlName="name"
                        class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="e.g. Food"
                    >
                </div>

                <label for="isRecurrent" class="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                        id="isRecurrent"
                        formControlName="isRecurrent"
                        class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    >
                    Is recurrent
                </label>

                <div class="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        (click)="modaleRef.close(false)"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        [disabled]="categoryForm.invalid || isLoading()"
                        class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                        {{isLoading() ? 'Updating...' : 'Save changes'}}
                    </button>
                </div>
            </form>
        </div>
    `   
})
export class UpdateCategoryComponent implements OnInit{
    private fb = inject(FormBuilder)
    private categoryService = inject(CategoriesService)
    modaleRef = inject(MODAL_REF) as ModalRef<boolean>
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