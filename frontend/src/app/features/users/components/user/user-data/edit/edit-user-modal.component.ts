import { Component, inject, InjectionToken, input, OnInit, signal } from "@angular/core";
import { AbstractControl, FormBuilder, ReactiveFormsModule,  Validators } from "@angular/forms";
import { MODAL_REF, ModalRef } from "../../../../../../shared/services/modal.service";
import { UserService } from "../../../../user.service";
import { ToastrService } from "ngx-toastr";
import { UpdateUser } from "../../../../interfaces/user.model";
import { MODAL_DATA } from "../../../../../../shared/tokens/modal-data.token";

export interface SelectOption {
  label: string;
  value: string | number;
}
interface ModalDataConfig {
  fieldName: string;
  fieldType: 'text' | 'select' | 'file';
  initialValue: any;
  options: SelectOption[];
}

@Component({
    selector: 'app-modal-edit-user',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: 'edit-user-modal-component.html'
})
export class EditUserModal implements OnInit {
    private userService = inject(UserService)
    private  fb = inject(FormBuilder)
    private toastr = inject(ToastrService)
    readonly modalRef = inject(MODAL_REF) as ModalRef<boolean>;
    isLoading = signal<boolean>(false)
    selectedFile: File | null = null;
    previewImage: string | null = null;
    private modalData = inject(MODAL_DATA) as { data: ModalDataConfig };
    
    config: ModalDataConfig = this.modalData?.data || this.modalData;

    form = this.fb.group({})
    ngOnInit() {
    const initialVal = this.config.fieldType === 'file' ? null : this.config.initialValue;
      
      this.form.addControl(
        this.config.fieldName, 
        this.fb.control(initialVal, [Validators.required])
      );
    }
    onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.form.get(this.config.fieldName)?.setValue(file);

        const reader = new FileReader();
        reader.onload = () => {
          this.previewImage = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }

    ladingEditDate () {
        if(this.form.invalid) return 
        this.isLoading.set(true)
        
        if (this.config.fieldType === 'file' && this.selectedFile) {
            const formData = new FormData();
            formData.append('file', this.selectedFile); 

            this.userService.editProdilePicture(formData).subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.modalRef.close(true);
                },
                error: () => {
                    this.isLoading.set(false);
                }
            });
            return
        }

        const editUser: UpdateUser = this.form.getRawValue()
        this.userService.editUser(editUser).subscribe({
            next: () => {
                this.isLoading.set(false)
                this.modalRef.close()
                this.toastr.success('Data successfully edited.')
            },
            error: () => {
                this.isLoading.set(false)
                this.toastr.error('Oops!. There was an error editing this piece of data.')
            }
        })
    }
}