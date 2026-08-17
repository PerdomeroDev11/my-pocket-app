import { Module } from "@nestjs/common";
import { balanceSectionController } from "./balance-section.controller";
import { BalanceSectionService } from "./balance-section.service";

@Module({
    controllers:[balanceSectionController],
    providers: [BalanceSectionService]
})
export class BalanceSectionModule{}