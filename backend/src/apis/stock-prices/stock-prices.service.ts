import { PrismaService } from "@/prisma-config/prisma.service";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import YahooFinance from "yahoo-finance2";
import { StockSearchResult } from "./interfaces/search-stock-prices";

@Injectable()
export class StockPricesService{
    private readonly logger = new Logger(StockPricesService.name)
    constructor (
        private readonly prisma: PrismaService,
        @Inject('YAHOO_FINANCE') private yahooFinance: InstanceType<typeof YahooFinance>
    ){}
   @Cron(CronExpression.EVERY_WEEK)
    async handleCron() {
        this.logger.log('Executing automatic update of market prices...');

        try {
            const activeInvestments = await this.prisma.marketPrice.findMany();
            if (activeInvestments.length === 0) return;

            
            for (const investment of activeInvestments) {
                try {
                    const quote = await this.yahooFinance.quote(investment.ticker);
                    
                    if (quote && quote.regularMarketPrice) {
                        await this.prisma.marketPrice.update({
                            where: { id: investment.id },
                            data: { currentPrice: quote.regularMarketPrice }
                        });
                    }
                } catch (error) {
                    this.logger.warn(`Failed to fetch stock price for ${investment.ticker}`);
                }
            }
            this.logger.log('Stock prices successfully updated.');
        } catch (error) {
            this.logger.error('Error updating prices in the Cron Job', error);
        }
    }
    async searchStocks(query: string): Promise<StockSearchResult[]> {
        if (!query || query.trim() === '') {
            return [];
        }

        try {
            const result = await this.yahooFinance.search(query);

            const quotes = result.quotes || [];

            return quotes
                .filter((item: any) => item.quoteType === 'EQUITY' || item.quoteType === 'ETF')
                .slice(0, 10) 
                .map((item: any) => ({
                    symbol: item.symbol,
                    name: item.shortname || item.longname || item.symbol,
                    exchange: item.exchDisp || item.exchange || '',
                    type: item.quoteType,
                }));
        } catch (error) {
            return [];
        }
    }
}