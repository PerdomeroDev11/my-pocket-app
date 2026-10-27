export interface CoinGeckoPriceResponse {
    [key: string]: {
        usd: number;
    };
}
export interface CoinGeckoSearchResult {
    id: string;        
    name: string;      
    symbol: string;    
    market_cap_rank: number;
}

export interface CoinGeckoSearchApiGet {
  coins: {
    id: string;
    name: string;
    api_symbol: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    large: string;
  }[];
  exchanges: {
    id: string;
    name: string;
    market_type: string;
    thumb: string;
    large: string;
  }[];
  icos: any[];
  categories: {
    id: string;
    name: string;
  }[];
  nfts: {
    id: string;
    name: string;
    symbol: string;
    thumb: string;
  }[];
}