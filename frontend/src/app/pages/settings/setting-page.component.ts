import { Component, inject } from "@angular/core";
import { SessionComponent } from "../../features/users/components/session/session.component";
import { ModalService } from "../../shared/services/modal.service";
import { ChangePasswordComponent } from "../../features/users/components/user/change-password/change-password.component";
import { InfoUseComponent } from "../../features/users/components/user/user-data/user-data.component";
import { ToastrService } from "ngx-toastr";



@Component({
    selector: 'app-setting-pages',
    imports: [SessionComponent,InfoUseComponent],
    templateUrl: './setting-page.component.html'
})
export class SettingComponent {
    private modalService = inject(ModalService)
    private toastr = inject(ToastrService)

    async openChangePasswordModal(){
        const modalRef = this.modalService.open<ChangePasswordComponent, undefined, boolean>(ChangePasswordComponent);
        
        const wasChanges = await modalRef; 

        if (wasChanges) {
            this.toastr.success('successly change password')
        }
    }
}