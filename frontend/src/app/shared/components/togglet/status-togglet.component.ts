// status-toggle.component.ts
import { Component, input, output, computed } from "@angular/core";
import { StatusPageEnum } from "../../../features/financial-pages/fin-page/interface/financial-page.model";

@Component({
  selector: 'app-status-toggle',
  standalone: true,
  template: `
    <div class="flex items-center gap-2">
      <button
        type="button"
        (click)="toggle.emit()"
        [class.bg-green-500]="isActive()"
        [class.bg-gray-300]="!isActive()"
        class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-600/20"
      >
        <span
          [class.translate-x-6]="isActive()"
          [class.translate-x-1]="!isActive()"
          class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200"
        ></span>
      </button>

      <span
        class="text-sm font-medium"
        [class.text-green-600]="isActive()"
        [class.text-gray-500]="!isActive()"
      >
        {{ isActive() ? 'Activa' : 'Cerrada' }}
      </span>
    </div>
  `
})
export class StatusToggleComponent {
  status = input.required<StatusPageEnum>();
  toggle = output<void>(); 

  isActive = computed(() => this.status() === 'ACTIVE');
}