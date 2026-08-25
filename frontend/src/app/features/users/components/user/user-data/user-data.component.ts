import { Component, inject, OnInit, signal } from "@angular/core";
import { ModalService } from "../../../../../shared/services/modal.service";
import { CountryEnum, CountryLabels, LanguageEnum, LanguageLabels, TimezoneEnum, TypePeriodEnum, UserResponse } from "../../../interfaces/user.model";
import { UserService } from "../../../user.service";
import { EditUserModal } from "./edit/edit-user-modal.component";
import { enumToOptions } from "../../../../../shared/utils/selects-enums-user.util";


@Component({
    selector: 'app-user-data',
    standalone: true,
    imports: [],
    templateUrl: './user-data.component.html'
})
export class InfoUseComponent implements OnInit{
    private userService =  inject(UserService)
    private modalService = inject(ModalService)

    isLading = signal<boolean>(false)
    userData = signal<UserResponse | null>(null)
    countryOptions = enumToOptions(CountryEnum, CountryLabels);
    timezoneOptions = enumToOptions(TimezoneEnum);
    languageOptions = enumToOptions(LanguageEnum, LanguageLabels);
    periodOptions = enumToOptions(TypePeriodEnum);

    ngOnInit() {
        this.loadUserData();
    }

    loadUserData () {
        this.isLading.set(true)

        this.userService.infoUser().subscribe({
            next: (data) => {
                this.userData.set(data)
                this.isLading.set(false)
            },
            error: (err) =>{
                this.isLading.set(false)
            }
        })
    }
    openEditModal(fieldName: string, fieldType: 'text' | 'select' | 'file', initialValue: any, options: any[] = []) {
  this.modalService.open(EditUserModal, {
    fieldName,
    fieldType,
    initialValue,
    options
  }).afterClosed().then(result => {
    if (result) {
      this.loadUserData();
    }
  });
}
}