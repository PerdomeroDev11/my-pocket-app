import { Component, inject, OnInit, signal } from "@angular/core";
import { UserService } from "../../user.service";
import { UserSessionsResponse } from "../../interfaces/sessios.model";
import { ToastrService } from "ngx-toastr";
import { CommonModule, DatePipe } from "@angular/common";
import { CloseSessionComponent } from "./close-session.component";
import { getBrowserIcon } from "../../../../shared/utils/session-list.util";

@Component({
    selector: 'app-session',
    standalone: true,
    imports: [CommonModule, DatePipe , CloseSessionComponent],
    templateUrl: './session.component.html'
})
export class SessionComponent implements OnInit{
    private userService = inject(UserService)
    private toastr = inject(ToastrService)

    public sessions = signal<UserSessionsResponse[]>([])
    public isLoading = signal<boolean>(true)

    isModalOpen = signal<boolean>(false);
    selectedSessionId: string = '';
    

    ngOnInit():void{
        this.loadSessionData();
    }
    loadSessionData(){
        this.userService.sessionAll().subscribe({
            next: (data) => {
                const parseSession = data.map((session) => {
                    const rawBroser = session.userAgent
                    const cleanBrowserName = rawBroser ? this.extractBrowserName(rawBroser): 'unknown'
                    console.log(cleanBrowserName)
                    console.log(cleanBrowserName)

                    return{
                        ...session,
                        browserIcon: getBrowserIcon(cleanBrowserName)
                    }
                })
                this.sessions.set(parseSession)
                this.isLoading.set(false)
            },
            error: (err) => {
                this.toastr.error('error')
                console.log('error: ' , err)
                this.isLoading.set(false)
            }
        })
    }

    private extractBrowserName(formattedUserAgent: string): string {
        return formattedUserAgent.split(' ')[0];
    }

    openModalForSession(sessioId: string){
        this.selectedSessionId = sessioId
        this.isModalOpen.set(true)
    }
    closeModal(){
        this.isModalOpen.set(false)
    }
    onSessionClosed(){
        this.loadSessionData()
    }
}