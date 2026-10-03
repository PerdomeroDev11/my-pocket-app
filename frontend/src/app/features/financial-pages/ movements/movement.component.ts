import { Component, computed, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TogglePayMovementComponent } from './components/update/pay-movement.component';
import { ButtonUpdateMovementComponent } from './components/update/button-update-movement.component';
import { ButtonDeleteMovementComponent } from './components/delete/button-delete-movement.component';
import { CategoriesJoinResponseInterface } from '../categorires/interface/categorie.interface';

@Component({
    selector: 'app-movement',
    standalone: true,
    imports: [
        TogglePayMovementComponent,
        ButtonUpdateMovementComponent,
        ButtonDeleteMovementComponent,
        DatePipe,
        CurrencyPipe,
    ],
    template: `
        <div>
            @if (currentMovements().length > 0) {
              <ul class="max-h-87.5 overflow-y-auto px-4 py-2 space-y-2">
                @for (movement of currentMovements(); track movement.id) {
                  <li class="flex justify-between items-start px-3 py-2.5 rounded-xl border border-white/5 bg-black-russian-900/30 backdrop-blur-md hover:bg-black-russian-900/60 hover:border-white/15 transition-all duration-300 text-black-russian-100 text-sm">
                    <app-toggle-pay-movement
                      [movement]="movement"
                      [categoryId]="categoryId()"
                      [pageId]="pageId()"
                      [categoryDate]="categoryDate()"
                    />
                    <span class="font-medium text-black-russian-50">{{ movement.name || movement.description || 'No name' }}</span>
                    <span class="text-black-russian-400 text-xs">{{ movement.date | date:'dd/MM/yyyy' }}</span>
                    <span class="font-semibold text-emerald-400">{{ movement.amount | currency:'$ ' }}</span>
                    <app-button-Update-movement
                      [movement]="movement"
                      [categoryId]="categoryId()"
                      [id]="movement.id"
                      [pageId]="pageId()"
                    />
                    <app-button-delete-movement
                    [categoryId]="categoryId()"
                    [movementId]="movement.id"
                    [pageId]="pageId()"
                    [isPay]="movement.isPay"
                    [typeMovement]="movement.typeMovement"
                    />
                  </li>
                }
              </ul>
            } @else {
              <p class="no-movements p-6 text-center text-black-russian-400 text-sm">No movements on this page.</p>
            }
        </div>
    `
})
export class MovementComponent {
    readonly pageId = input<string>('');
    readonly categoryId = input<string>('');
    readonly categoryDate = input<CategoriesJoinResponseInterface[] | null>(null);

    readonly currentMovements = computed(() => {
        const categoryId = this.categoryId();
        const categories = this.categoryDate() ?? [];
        const selectedCategory = categories.find((category) => category.id === categoryId);
        return selectedCategory?.movements ?? [];
    });
}