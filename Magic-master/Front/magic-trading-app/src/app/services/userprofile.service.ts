import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CardCollection, TradingCard } from '../models/card.models';

@Injectable({
  providedIn: 'root'
})
export class UserprofileService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getMyProfile(): Observable<CardCollection & { _id: string }> {
    return this.http.get<CardCollection & { _id: string }>(`${this.apiUrl}/user/profile/me`);
  }

  getMatchingCards(otherUsername: string): Observable<{ myMatchingCards: TradingCard[]; theirMatchingCards: TradingCard[] }> {
    return this.http.get<{ myMatchingCards: TradingCard[]; theirMatchingCards: TradingCard[] }>(
      `${this.apiUrl}/matches/${otherUsername}/cards`
    );
  }

  addCardToWants(cardId: string, cardName: string, setCode = '', setName = '', price = 0): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/user/wants`,
      { cardId, cardName, edition: setName, setCode, price },
    );
  }

  addCardToSells(cardId: string, cardName: string, setCode = '', setName = '', price = 0): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/user/sells`,
      { cardId, cardName, edition: setName, setCode, price },
    );
  }

  updateCardInWants(cardId: string, quantity: number, edition: string, language: string, foil: boolean, price = 0, setCode = ''): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/user/wants/${cardId}`,
      { quantity, edition, language, foil, price, setCode },
    );
  }

  updateCardInSells(cardId: string, quantity: number, edition: string, language: string, foil: boolean, price = 0, setCode = ''): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/user/sells/${cardId}`,
      { quantity, edition, language, foil, price, setCode },
    );
  }

  removeCardFromWants(cardId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/user/wants/${cardId}`);
  }

  removeCardFromSells(cardId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/user/sells/${cardId}`);
  }

  getProfileByUsername(username: string): Observable<CardCollection & { _id: string; usuario: string }> {
    return this.http.get<CardCollection & { _id: string; usuario: string }>(`${this.apiUrl}/profile/${username}`);
  }

  getMatches(otherUsername: string): Observable<{ wantsMatches: number; wantsTotal: number; sellsMatches: number; sellsTotal: number }> {
    return this.http.get<{ wantsMatches: number; wantsTotal: number; sellsMatches: number; sellsTotal: number }>(`${this.apiUrl}/matches/${otherUsername}`);
  }
}
