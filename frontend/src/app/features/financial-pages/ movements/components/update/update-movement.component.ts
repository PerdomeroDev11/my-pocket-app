import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { MovementsService } from "../../movemets.service";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { MODAL_REF, ModalRef } from "../../../../../shared/services/modal.service";
import { ModalMovementData, TypeMovementEnum, UpdateMovementInterface } from "../../interfaces/movements.interface";
import { FinancialInstitutionsService } from "../../../../financial-institutions/financial-institutions.service";
import { HttpErrorResponse } from "@angular/common/http";
import { MODAL_DATA } from "../../../../../shared/tokens/modal-data.token";
import { FinancialInstitutionsResponse } from "../../../../financial-institutions/interfaces/financial-institutions";
import { OptionsFinancialInstitutuionComponent } from "../../../../financial-institutions/components/options-institutions.component";

@Component({
    selector: 'app-update-movement',
    imports: [FormsModule,ReactiveFormsModule,OptionsFinancialInstitutuionComponent],
    standalone: true,
    templateUrl: './update-modal.comoponent.html'
})
export class UpdateMovementComponent implements OnInit {
    private movementService = inject(MovementsService)
    private institutionFinancial = inject(FinancialInstitutionsService)
    private toastr = inject(ToastrService)
    private modalRef = inject(MODAL_REF) as ModalRef<boolean>
    private modalData = inject(MODAL_DATA) as ModalMovementData
    private fb = inject(FormBuilder)

    isLoading = signal<boolean>(false)
    messageError = signal<string | null>(null)
    filePut = signal<File | null>(null)

    readonly movement = computed(() => this.modalData.movement ?? null)
    readonly movementId = computed(() => this.modalData.id ?? this.movement()?.id ?? '')
    readonly pageId = computed(() => this.modalData.pageId ?? '')
    readonly categoryId = computed(()=> this.modalData.categoryId ?? '')
    readonly financialInstitutions = signal<FinancialInstitutionsResponse[]>([]);

    readonly typeOptions = [
    { value: TypeMovementEnum.INCOME, label: 'Income' },
    { value: TypeMovementEnum.EXPENSE, label: 'Expense' },
    { value: TypeMovementEnum.SAVING, label: 'Savings' },
    { value: TypeMovementEnum.INVESTMENT, label: 'Investment' },
  ];

    formUpdate = this.fb.group({
        name: [''],
        description: [''],
        date: [new Date().toISOString().slice(0, 10)],
        typeMovement: [TypeMovementEnum.EXPENSE, [Validators.required]],
        institutionFinancialId: [null as string | null],
        amount: [0],
        isPay: [false]
    })

    ngOnInit(): void {
        const movement = this.movement();
        if (movement) {
            this.formUpdate.patchValue({
                name: movement.name ?? '',
                description: movement.description ?? '',
                date: movement.date ? new Date(movement.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
                typeMovement: movement.typeMovement ?? TypeMovementEnum.EXPENSE,
                institutionFinancialId: movement.institutionFinancial?.id ?? null,
                amount: movement.amount ?? 0,
                isPay: movement.isPay ?? false,
            });
        }
    }
    private handleSuccess(): void {
    this.isLoading.set(false);
    this.toastr.success('Movement updated successfully');
    this.modalRef.close(true);
  }

  private handleError(err: HttpErrorResponse): void {
    this.isLoading.set(false);
    this.messageError.set(err.error?.message ?? 'Could not update the movement.');
    this.toastr.error('Could not update the movement');
  }
   onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        this.filePut.set(file);
    }
    onCancel (): void{
        this.modalRef.close(false)
    }


  onSubmit(): void {
    if (this.formUpdate.invalid) return;

    this.isLoading.set(true);

    const rawValue = this.formUpdate.getRawValue();
    const payload: UpdateMovementInterface = {
      ...rawValue,
      typeMovement: rawValue.typeMovement as TypeMovementEnum,
      amount: rawValue.amount ?? null,
      isPay: rawValue.isPay ?? null,
    };

    const file = this.filePut();

    this.movementService.updateMovement(
      payload,
      this.pageId(),
      this.categoryId(),
      this.movementId(),
      file ?? undefined,
    ).subscribe({
      next: () => this.handleSuccess(),
      error: (err: HttpErrorResponse) => this.handleError(err)
    });
  }

}