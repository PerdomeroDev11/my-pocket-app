import { Module } from "@nestjs/common";
import { MarketCoingeckoCronService } from "./market-coingecko.service";

@Module({
    providers: [MarketCoingeckoCronService],
    exports: [MarketCoingeckoCronService]
})
export class MarketCoingeckoModule {}