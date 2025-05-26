import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScryfallService {
  private baseUrl: string = 'https://api.scryfall.com';

  constructor(private http: HttpClient) {}


  buscarCartas(query: string): Observable<any> {
    const url = `${this.baseUrl}/cards/search?q=${encodeURIComponent(query)}`;
    return this.http.get<any>(url);
  }


  obtenerDetallesCarta(id: string): Observable<any> {
    const url = `${this.baseUrl}/cards/${id}`;
    return this.http.get<any>(url);
  }


  getCardPrints(cardName: string): Observable<any> {
    const url = `${this.baseUrl}/cards/search?q=!"${encodeURIComponent(cardName)}"&unique=prints`;
    return this.http.get<any>(url);
  }

  getCardPrice(setCode: string, cardName: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/cards/search?q=!"${encodeURIComponent(cardName)}" set:${setCode}`);
  }
}
