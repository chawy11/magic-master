import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateTransactionRequest, Transaction } from '../models/transaction.models';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  createTransaction(request: CreateTransactionRequest): Observable<{ transactionId: string }> {
    return this.http.post<{ transactionId: string }>(
      `${this.apiUrl}/transaction/create`,
      request
    );
  }

  getMyTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
  }

  confirmTransaction(transactionId: string): Observable<{ transactionCompleted: boolean }> {
    return this.http.put<{ transactionCompleted: boolean }>(
      `${this.apiUrl}/transaction/${transactionId}/confirm`, {}
    );
  }

  cancelTransaction(transactionId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/transaction/${transactionId}/cancel`, {});
  }

  addReview(transactionId: string, rating: number, comment: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/transaction/${transactionId}/review`,
      { rating, comment }
    );
  }
}
