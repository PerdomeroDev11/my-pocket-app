import { inject, Injectable } from '@angular/core';
import { MovementResponseInterface, UpdateMovementInterface } from '../../interfaces/movements.interface';
import { MovementsService } from '../../movemets.service';
import { CategoriesJoinResponseInterface } from '../../../categorires/interface/categorie.interface';

@Injectable({
  providedIn: 'root',
})
export class MovementToggleService {
  private movementsService = inject(MovementsService);

  buildPayload(movement: MovementResponseInterface, checked: boolean): UpdateMovementInterface {
    return {
      isPay: checked,
      typeMovement: movement.typeMovement,
      ...(movement.name !== undefined && movement.name !== null ? { name: movement.name } : {}),
      ...(movement.description !== undefined && movement.description !== null ? { description: movement.description } : {}),
      ...(movement.amount !== undefined && movement.amount !== null ? { amount: movement.amount } : {}),
      ...(movement.date ? { date: new Date(movement.date).toISOString().slice(0, 10) } : {}),
      ...(movement.institutionFinancial?.id ? { institutionFinancialId: movement.institutionFinancial.id } : {}),
    };
  }

  togglePaid(
    movement: MovementResponseInterface,
    checked: boolean,
    pageId: string,
    categoryId: string,
  ) {
    const payload = this.buildPayload(movement, checked);
    return this.movementsService.updateMovement(payload, pageId, categoryId, movement.id);
  }

  applyPaidToggleToCategory(
    categories: CategoriesJoinResponseInterface[] | null,
    movementId: string,
    checked: boolean,
  ): CategoriesJoinResponseInterface[] | null {
    if (!categories) {
      return null;
    }

    return categories.map((category) => ({
      ...category,
      movements: category.movements.map((item: MovementResponseInterface) =>
        item.id === movementId ? { ...item, isPay: checked } : item,
      ),
    }));
  }
}
