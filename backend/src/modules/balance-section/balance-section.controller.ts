import { Controller, Get, UseGuards } from "@nestjs/common";
import { BalanceSectionService } from "./balance-section.service";
import { CurrentUser } from "@/common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";

@Controller('balance')
export class balanceSectionController {
    constructor (private balanceSectionService: BalanceSectionService){}

    @UseGuards(JwtAuthGuard)
    @Get()
    async available(
        @CurrentUser('sub') userId: string
    ){
        return this.balanceSectionService.getBalanceAvailable(userId)
    }
}