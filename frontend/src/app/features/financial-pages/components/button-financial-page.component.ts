import { ToastrService } from "ngx-toastr";
import { FinancialPageService} from "../financial-pages.service";
import { Component, inject, signal } from "@angular/core";
import { financialPageResponseInterface } from "../interface/financial-page.model";
import { Router } from "@angular/router";

@Component({
    selector: 'app-button-create-financial-page',
    standalone: true,
    template: `
        <button 
            (click)="onSubmit()"
            [disabled]="isLoading()"
            class=" p-4 , text-amber-50 , border-b-slate-950 bg-blue-400"
        >@if (isLoading()) {
        creating...
    } @else {
        new page
    }</button>
    `
})
export class ButtonCreateFinancialPage {
    private financialPageService = inject(FinancialPageService)
    private toastr = inject(ToastrService)
    private router = inject(Router)

    isLoading = signal<Boolean>(false)

    formatDate(dateStr: string | Date): string {
        const dateNow = new Date(dateStr);
    
        const options: Intl.DateTimeFormatOptions = { 
            day: 'numeric', 
            month: 'long' 
        };
        return new Intl.DateTimeFormat(undefined, options).format(dateNow);
    }
    generateSlug(text: string): string {
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '');
    }


    onSubmit(){
        this.isLoading.set(true)
        const namePage : string = this.formatDate(new Date())
        this.financialPageService.createPage({name: namePage}).subscribe({
            next: (response: financialPageResponseInterface) => {
                this.isLoading.set(false)
                const generateSlug = this.generateSlug(response.name)
                const urlSlug = `${generateSlug}-${response.id}`
                // persist last page and list locally so sidebar and navigation can use it
                try{
                    const pageEntry = { id: response.id, name: response.name, slugWithId: urlSlug }
                    const raw = localStorage.getItem('financialPagesList') || '[]'
                    const pages = JSON.parse(raw)
                    pages.unshift(pageEntry)
                    localStorage.setItem('financialPagesList', JSON.stringify(pages.slice(0,50)))
                    localStorage.setItem('lastFinancialPage', urlSlug)
                }catch(e){ /* ignore storage errors */ }

                this.router.navigate([`/financial-page/${urlSlug}`])
                this.toastr.success('new financial page')
                
            },
            error: (err) => {
                this.isLoading.set(false)
                this.toastr.error('error')
            }
        })
    }
    
}