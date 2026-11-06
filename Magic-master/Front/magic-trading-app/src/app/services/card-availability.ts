export interface TradableCard {
  cardId: string;
  inTransaction?: boolean;
}

export function getAvailableCards<T extends TradableCard>(cards: T[]): T[] {
  return cards.filter(card => card.inTransaction !== true);
}
