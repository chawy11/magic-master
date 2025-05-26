import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserprofileService {
  // Make sure this is set correctly
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/profile/me`, { headers: this.getHeaders() });
  }


  getMatchingCards(otherUsername: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/matches/${otherUsername}/cards`,
      { headers: this.getHeaders() }
    );
  }

  addCardToWants(cardId: string, cardName: string, setCode: string = '', setName: string = '', price: number = 0): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/wants`,
      { cardId, cardName, edition: setName, setCode, price },
      { headers: this.getHeaders() }
    );
  }

  addCardToSells(cardId: string, cardName: string, setCode: string = '', setName: string = '', price: number = 0): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/sells`,
      { cardId, cardName, edition: setName, setCode, price },
      { headers: this.getHeaders() }
    );
  }

  updateCardInWants(cardId: string, quantity: number, edition: string, language: string, foil: boolean, price: number = 0, setCode: string = ''): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/wants/${cardId}`,
      { quantity, edition, language, foil, price, setCode },
      { headers: this.getHeaders() }
    );
  }

  updateCardInSells(cardId: string, quantity: number, edition: string, language: string, foil: boolean, price: number = 0, setCode: string = ''): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/sells/${cardId}`,
      { quantity, edition, language, foil, price, setCode },
      { headers: this.getHeaders() }
    );
  }

  removeCardFromWants(cardId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/wants/${cardId}`,
      { headers: this.getHeaders() }
    );
  }

  removeCardFromSells(cardId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/sells/${cardId}`,
      { headers: this.getHeaders() }
    );
  }

  getProfileByUsername(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${username}`, { headers: this.getHeaders() });
  }

  getMatches(otherUsername: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/matches/${otherUsername}`, { headers: this.getHeaders() });
  }
}
