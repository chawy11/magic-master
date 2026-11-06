export interface TradingCard {
  cardId: string;
  cardName: string;
  quantity?: number;
  edition?: string;
  setCode?: string;
  language?: string;
  foil?: boolean;
  price?: number;
  inTransaction?: boolean;
  transactionId?: string;
}

export interface CardCollection {
  wants: TradingCard[];
  sells: TradingCard[];
}
