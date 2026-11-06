import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ScryfallCard {
  id: string;
  name: string;
  set: string;
  set_name: string;
  prices?: { eur?: string; usd?: string };
}

interface ScryfallSearchResponse {
  data: ScryfallCard[];
}

@Injectable({
  providedIn: 'root',
})
export class ScryfallService {
  private readonly baseUrl = environment.urlBase;

  constructor(private http: HttpClient) {}


  buscarCartas(query: string): Observable<ScryfallSearchResponse> {
    const url = `${this.baseUrl}/cards/search?q=${encodeURIComponent(query)}`;
    return this.http.get<ScryfallSearchResponse>(url);
  }


  obtenerDetallesCarta(id: string): Observable<ScryfallCard> {
    const url = `${this.baseUrl}/cards/${id}`;
    return this.http.get<ScryfallCard>(url);
  }


  getCardPrints(cardName: string): Observable<ScryfallSearchResponse> {
    const url = `${this.baseUrl}/cards/search?q=!"${encodeURIComponent(cardName)}"&unique=prints`;
    return this.http.get<ScryfallSearchResponse>(url);
  }

  getCardPrice(setCode: string, cardName: string): Observable<ScryfallSearchResponse> {
    return this.http.get<ScryfallSearchResponse>(`${this.baseUrl}/cards/search?q=!"${encodeURIComponent(cardName)}" set:${setCode}`);
  }
}
