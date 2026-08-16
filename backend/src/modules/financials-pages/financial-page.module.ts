import { Module } from "@nestjs/common";
import { FinancialPagesController } from "./financial-page.controller";
import { FinancialsPagesService } from "./financials-pages.service";

@Module({
    controllers:[FinancialPagesController],
    providers:[FinancialsPagesService]
})
export class FinanacialPagesModule{}