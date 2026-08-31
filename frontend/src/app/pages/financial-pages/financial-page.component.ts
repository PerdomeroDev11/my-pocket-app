import { Component, inject } from "@angular/core";
import { FinancialPageComponent } from "../../features/financial-pages/fin-page/components/financial-page.component";

@Component({
    selector: 'financial-page',
    standalone: true,
    imports: [FinancialPageComponent],
    template: `
        <app-financial-page-component/>
    `
})
export class FinancialPage{}