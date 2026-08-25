import { Component } from "@angular/core";
import { SidebarFooterComponent } from "./sidebar-footer/sidebar-footer.component";
import { SidebarNavComponent } from "./sidebar-nav/sidebar-nav.component";
import { SidebarUserComponent } from "./sidebar-user/sidebar-user.component";

@Component({
    selector: 'app-sidebar',
    imports: [SidebarFooterComponent,SidebarNavComponent,SidebarUserComponent],
    template: `
        <aside class="flex flex-col w-64 h-screen px-4 py-8 overflow-y-auto bg-white border-r rtl:border-r-0 rtl:border-l dark:bg-gray-900 dark:border-gray-700">
            <a href="#">
        <img class="w-auto h-6 sm:h-7" src="https://merakiui.com/images/logo.svg" alt="">
    </a>
            <div class="flex flex-col justify-between flex-1 mt-6">
                <app-sidebar-nav/>
                <app-sidebar-user/>
                <app-sidebar-footer/>
            </div>
        </aside>
    `
})
export class SidebarComponent{}