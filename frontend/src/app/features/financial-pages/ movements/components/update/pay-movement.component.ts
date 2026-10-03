import { Component, inject, input, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MovementResponseInterface } from '../../interfaces/movements.interface';
import { CategoriesJoinResponseInterface } from '../../../categorires/interface/categorie.interface';
import { MovementToggleService } from './movement-toggle.service';

@Component({
  selector: 'app-toggle-pay-movement',
  standalone: true,
  template: `
    <label class="switch">
      <input
        type="checkbox"
        [checked]="movement()?.isPay"
        (change)="toggleMovementPaid($event)"
      />
      <span class="slider round"></span>
    </label>
  `,
})
export class TogglePayMovementComponent {
  private toastr = inject(ToastrService);
  private movementToggleService = inject(MovementToggleService);

  isLoading = input<boolean>(false);
  readonly movement = input<MovementResponseInterface | null>(null);
  readonly pageId = input<string>('');
  readonly categoryId = input<string>('');
  readonly categoryDate = input<CategoriesJoinResponseInterface[] | null>(null);

  toggleMovementPaid(event: Event): void {
    const movement = this.movement();
    if (!movement) return;

    const checked = (event.target as HTMLInputElement).checked;

    this.movementToggleService.togglePaid(movement, checked, this.pageId(), this.categoryId()).subscribe({
      next: () => {
        const updatedCategories = this.movementToggleService.applyPaidToggleToCategory(
          this.categoryDate(),
          movement.id,
          checked,
        );

        console.log('updated categories', updatedCategories);
        this.toastr.success(checked ? 'Movement marked as paid' : 'Movement marked as unpaid');
      },
      error: () => {
        this.toastr.error('Could not update the movement status');
        (event.target as HTMLInputElement).checked = !checked;
      },
    });
  }
}