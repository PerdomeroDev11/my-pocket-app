import { Module } from "@nestjs/common";
import { StockPricesService } from "./stock-prices.service";
import YahooFinance from "yahoo-finance2";

@Module({
    providers: [
        StockPricesService,
        {
            provide: 'YAHOO_FIANCE',
            useValue: new YahooFinance
        }
    ],
    exports: [StockPricesService]
})
export class StockPricesModule {}