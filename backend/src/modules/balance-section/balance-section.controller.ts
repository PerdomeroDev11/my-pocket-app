import { Controller, Get } from "@nestjs/common";
import { BalanceSectionService } from "./balance-section.service";
import { CurrentUser } from "@/common/decorator/current-user.decorator";

@Controller('balance')
export class balanceSectionController {
    constructor (private balanceSectionService: BalanceSectionService){}

    @Get('available')
    async available(
        @CurrentUser('sub') userId: string
    ){
        return this.balanceSectionService.getBalanceAvailable(userId)
    }
}