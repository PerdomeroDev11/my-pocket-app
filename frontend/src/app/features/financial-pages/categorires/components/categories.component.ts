import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CategoriesJoinResponseInterface } from '../interface/categorie.interface';
import { MovementComponent } from '../../ movements/movement.component';
import { ButtonNewMovementComponent } from '../../ movements/components/create/button-new-movement.component';
import { CategoriesService } from '../categories.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/internal/Subscription';
import { HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs/internal/operators/tap';

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [
        MovementComponent,
        ButtonNewMovementComponent,
    ],
    templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
    private categoriesService = inject(CategoriesService)
    private toastr = inject(ToastrService)
    private sub$ = new Subscription()

    isLoading = signal<boolean>(false)
    categoriesDate = signal<CategoriesJoinResponseInterface[] | null>(null)
    
    readonly pageId = input<string>('')
    

    ngOnInit(): void {
      this.loadDateCategories()

      this.sub$ = this.categoriesService.categoryDate$.pipe(
        tap(() => {
            this.loadDateCategories()
        })
      ).subscribe()
    }
    loadDateCategories() {
        this.getCategories()
    }

    findCategoryById(id: string) {
        return this.categoriesDate()?.find((category) => category.id === id) || null
    }

    ngOnDestroy(): void {
        this.sub$.unsubscribe()
    }

    private getCategories(){
        this.isLoading.set(true)
        const pageId = this.pageId()
        if (!pageId) {
            this.isLoading.set(false)
            this.toastr.error('Page ID is not provided.', 'Error')
            return
        }
        this.categoriesService.getCategories(pageId).subscribe({
            next: (response: CategoriesJoinResponseInterface[] | null) => {
                this.handleSuccess(response)
            },
            error: (err: HttpErrorResponse) => {
                this.handleError(err)
            }
        })
    }
    private handleError(err: HttpErrorResponse) {
        this.isLoading.set(false)
        this.toastr.error(err.error.message || 'can not get the dates', 'Error')
    }
    private handleSuccess(response: CategoriesJoinResponseInterface[] | null) {
        this.isLoading.set(false)
        this.toastr.success('Data loaded successfully.', 'Success')
        this.categoriesDate.set(response)
    }
}