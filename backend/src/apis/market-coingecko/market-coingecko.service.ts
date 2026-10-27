import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import {HttpService} from '@nestjs/axios'
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "@/prisma-config/prisma.service";
import { firstValueFrom, throwError } from "rxjs";
import { CoinGeckoPriceResponse, CoinGeckoSearchApiGet, CoinGeckoSearchResult } from "./interface/response-coingecko.interface";

@Injectable()
export class MarketCoingeckoCronService{
    private readonly logger = new Logger(MarketCoingeckoCronService.name)
    constructor(
        private httpService:  HttpService,
        private readonly prisma: PrismaService,
        
    ){}
    @Cron(CronExpression.EVERY_WEEK)
    async handleCron(){
        this.logger.log('Executing automatic update of market prices...');

    try {
      const activeInvestments = await this.prisma.marketPrice.findMany({
        select: { id: true, ticker: true, }, 
      });

      if (activeInvestments.length === 0) return;

      
        const uniqueTickers = Array.from(new Set(activeInvestments.map(item => item.ticker)));
        const tickersString = uniqueTickers.join(',');
        const responseApi = await this.fetchPriceFromApi(tickersString)
        for (const investment of activeInvestments) {
                const currentPrice = responseApi[investment.ticker]?.usd;
                if (currentPrice !== undefined) {
                    await this.prisma.marketPrice.update({
                        where: { id: investment.id },
                        data: { currentPrice }
                    });
                }
            }

      this.logger.log('Market prices successfully updated.');
    } catch (error) {
      console.error('Failed to fetch data from external API', error);
      throw new InternalServerErrorException('Error communicating with external market provider');
    }
    }
    async searchSymbol(query: string){
        if (!query || query.trim() === '') {
        return [];
        }
        const response = await this.fetchSearhSymbolApi(query)
        return response.slice(0, 10).map((coin: CoinGeckoSearchResult) => ({
                id: coin.id,             
                name: coin.name,         
                symbol: coin.symbol,     
                market_cap_rank: coin.market_cap_rank || 999999,
            }));

        
        
      
    }
    private async fetchPriceFromApi(tickersString: string):Promise<CoinGeckoPriceResponse>{
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tickersString}&vs_currencies=usd`;
        const response = await firstValueFrom(this.httpService.get(url));
        const pricesData: CoinGeckoPriceResponse = response.data;
        return pricesData 
  }
  private async fetchSearhSymbolApi (query: string): Promise<CoinGeckoSearchApiGet['coins']>{
    try{
       const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;
       const response = await firstValueFrom(this.httpService.get(url));
       const coins = response.data?.coins || [];
       return coins
    }catch(err){
       console.error('Failed to fetch data from external API', err);
      throw new InternalServerErrorException('Error communicating with external market provider');
    };    
  }
}