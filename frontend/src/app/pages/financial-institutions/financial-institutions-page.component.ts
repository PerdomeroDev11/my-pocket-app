import { Component, } from "@angular/core";
import { FinancialInstitutuionComponent } from "../../features/financial-institutions/components/financial-page.component";

@Component({
    selector: 'financial-page',
    standalone: true,
    imports: [FinancialInstitutuionComponent],
    template: `
        <app-financial-institution/>
    `
})
export class FinancialInstitutionsPage{}