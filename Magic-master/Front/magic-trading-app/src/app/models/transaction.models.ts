import { TradingCard } from './card.models';

export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

export interface Transaction {
  _id: string;
  buyerId: string;
  sellerId: string;
  buyerUsername: string;
  sellerUsername: string;
  buyerWants: TradingCard[];
  sellerWants: TradingCard[];
  status: TransactionStatus;
  createdAt: string;
  completedAt?: string;
  buyerConfirmed?: boolean;
  sellerConfirmed?: boolean;
  buyerReview?: Review;
  sellerReview?: Review;
}

export interface Review {
  rating: number;
  comment: string;
  date: string;
}

export interface CreateTransactionRequest {
  sellerId: string;
  buyerWants: TradingCard[];
  sellerWants: TradingCard[];
}
