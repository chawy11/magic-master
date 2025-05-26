
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createTransaction(sellerId: string, buyerWants: any[], sellerWants: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/transaction/create`,
      { sellerId, buyerWants, sellerWants },
      { headers: this.getHeaders() }
    );
  }

  getMyTransactions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions`,
      { headers: this.getHeaders() }
    );
  }

  confirmTransaction(transactionId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/transaction/${transactionId}/confirm`, {}, { headers: this.getHeaders() });
  }

  addReview(transactionId: string, rating: number, comment: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/transaction/${transactionId}/review`,
      { rating, comment },
      { headers: this.getHeaders() }
    );
  }

}
