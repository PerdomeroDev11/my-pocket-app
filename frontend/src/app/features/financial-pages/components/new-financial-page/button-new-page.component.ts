import { Component, inject } from "@angular/core";
import { ModalService } from "../../../../shared/services/modal.service";
import { FinancialPageComponent} from "./new-financial-page.component";

@Component({
  selector: 'app-button-create-financial-page',
  standalone: true,
  template: `<button (click)="abrirModal()">Nueva página</button>`
})
export class ButtonNewPageComponent {
  private modalService = inject(ModalService);

  abrirModal() {
    this.modalService.open(FinancialPageComponent);
  }
}