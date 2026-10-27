import { Module } from "@nestjs/common";
import { InvestmentsService } from "./investments.service";
import { StockPricesModule } from "@/apis/stock-prices/stock-prices.module";
import { MarketCoingeckoModule } from "@/apis/market-coingecko/market-coingecko.module";

@Module({
    providers: [InvestmentsService],
    imports:[StockPricesModule,MarketCoingeckoModule]
})
export class InvestmentsModule{}