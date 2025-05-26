import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonTitle,
  IonToolbar,
  IonList, IonIcon, IonPopover,
} from '@ionic/angular/standalone';
import { AuthService } from "../services/auth.service";
import { ScryfallService } from "../services/scryfall.service";
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { Router } from '@angular/router';
import {addIcons} from "ionicons";
import {logOutOutline, personCircleOutline, personOutline, search, star, starOutline} from "ionicons/icons";
import {UserprofileService} from "../services/userprofile.service";


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButtons,
    IonButton,
    IonNote,
    IonItem,
    IonLabel,
    IonInput,
    IonList,
    IonIcon,
    IonPopover,
  ]
})
export class HomePage implements OnInit {
  nombreCarta: string = '';
  searchResults: any[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  cartaPreview: any = null;
  previewPosition = { top: 0, left: 0 };
  private searchTerms = new Subject<string>();

  constructor(
    private authService: AuthService,
    private scryfallService: ScryfallService,
    private router: Router
  ) {
    addIcons({search, personCircleOutline, logOutOutline, personOutline});
  }

  ngOnInit(): void {

    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.loading = true;
        return this.scryfallService.buscarCartas(term).pipe(
          catchError(error => {
            this.loading = false;
            this.errorMessage = 'No se encontraron resultados.';
            return of({ data: [] });
          })
        );
      })
    ).subscribe(
      data => {
        this.searchResults = data.data || [];
        this.loading = false;
      },
      error => {
        this.loading = false;
        this.errorMessage = 'Error al buscar cartas.';
        console.error('Error al buscar cartas:', error);
      }
    );
  }

  mostrarPreview(carta: any, event: MouseEvent) {
    this.cartaPreview = carta;
    this.previewPosition = {
      top: event.clientY + 10,
      left: event.clientX + 10
    };
  }

  ocultarPreview() {
    this.cartaPreview = null;
  }

  onInputChange(term: string | null | undefined): void {
    const searchTerm = term ?? '';
    this.searchTerms.next(searchTerm);
  }

  seleccionarCarta(carta: any): void {
    this.router.navigate(['/card-details', carta.id]);
  }

  buscarCarta(event?: Event): void {
    if ((!event || (event instanceof KeyboardEvent && event.key === 'Enter')) && this.nombreCarta.trim()) {
      this.router.navigate(['/card-list'], {
        queryParams: { q: this.nombreCarta.trim() },
      });
    }
  }

  irAPerfil(popover: any): void {
    popover.dismiss();
    this.router.navigate(['/profile']);
  }


  cerrarSesion(popover: any): void {
    popover.dismiss();
    this.authService.cerrarSesion();
  }
}
