import { Component, computed, input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TogglePayMovementComponent } from './components/update/pay-movement.component';
import { ButtonUpdateMovementComponent } from './components/update/button-update-movement.component';
import { ButtonDeleteMovementComponent } from './components/delete/button-delete-movement.component';
import { CategoriesJoinResponseInterface } from '../categorires/interface/categorie.interface';
import { TypeMovementEnum } from './interfaces/movements.interface';

@Component({
    selector: 'app-movement',
    standalone: true,
    imports: [
        CommonModule,
        TogglePayMovementComponent,
        ButtonUpdateMovementComponent,
        ButtonDeleteMovementComponent,
        DatePipe,
        CurrencyPipe,
    ],
    template: `
        <div>
  @if (currentMovements().length > 0) {
    <ul class="max-h-87.5 overflow-y-auto px-1 py-1 space-y-2.5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
      @for (movement of currentMovements(); track movement.id) {
        <li class="group/item relative flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all duration-200 hover:bg-white/6 hover:border-white/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          
          <!-- Zona Izquierda: Toggle Pay + Nombre + Subtítulo (Fecha e Institución) -->
          <div class="flex items-center gap-3 min-w-0">
            <app-toggle-pay-movement
              [movement]="movement"
              [categoryId]="categoryId()"
              [pageId]="pageId()"
              [categoryDate]="categoryDate()"
            />
            
            <div class="min-w-0 flex flex-col">
              <span class="font-medium text-sm text-white/95 truncate group-hover/item:text-cyan-300 transition-colors">
                {{ movement.name }}
              </span>
              <div class="flex items-center gap-2 text-xs text-white/50">
                <span class="font-mono text-white/50">{{ movement.date | date:'dd/MM/yyyy' }}</span>
                @if (movement.institutionFinancial?.name) {
                  <span aria-hidden="true" class="text-white/30">·</span>
                  <span class="truncate text-amber-200/90 font-normal">
                    {{ movement.institutionFinancial?.name }}
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- Zona Derecha: Monto Tabular + Botones de Acción (Update & Delete) -->
          <div class="flex items-center gap-3 shrink-0">
            <span
              class="font-mono text-sm sm:text-base font-bold tabular-nums drop-shadow-sm"
              [ngClass]="getMovementColorClass(movement.typeMovement)"
            >
              {{ movement.amount | currency:'$ ' }}
            </span>

            <div class="flex items-center gap-1 opacity-80 group-hover/item:opacity-100 transition-opacity">
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
            </div>
          </div>
        </li>
      }
    </ul>
  } @else {
    <!-- Estado Vacío con Micro-Glass -->
    <div class="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl border border-white/5 bg-white/2 backdrop-blur-md">
      <p class="no-movements text-sm font-medium text-white/50">No movements on this page.</p>
    </div>
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

    getMovementColorClass(type: TypeMovementEnum): string {
      switch (type) {
        case TypeMovementEnum.EXPENSE:
          return 'text-red-500';
        case TypeMovementEnum.INVESTMENT:
          return 'text-yellow-400';
        case TypeMovementEnum.SAVING:
          return 'text-blue-500';
        case TypeMovementEnum.INCOME:
          return 'text-emerald-400';
        default:
          return 'text-slate-300';
      }
    }
}