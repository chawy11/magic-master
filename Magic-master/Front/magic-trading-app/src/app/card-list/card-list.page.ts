
import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { ScryfallService } from '../services/scryfall.service';
import { UserprofileService } from '../services/userprofile.service';
import { AlertController } from '@ionic/angular';
import {
  IonCard, IonCardHeader, IonCardTitle,
  IonCol, IonContent, IonGrid, IonHeader, IonRow,
  IonSpinner, IonTitle, IonToolbar, IonButton,
  IonIcon, IonButtons, ToastController
} from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  addCircle,
  cartOutline,
  personCircleOutline,
  arrowBackOutline,
  ellipsisHorizontalOutline
} from 'ionicons/icons';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.page.html',
  styleUrls: ['./card-list.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    CommonModule,
    IonButtons,
    IonButton,
    RouterLink
  ]
})
export class CardListPage implements OnInit {
  cartas: any[] = [];
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scryfallService: ScryfallService,
    private userProfileService: UserprofileService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ ellipsisHorizontalOutline, addCircle, cartOutline, personCircleOutline, arrowBackOutline });
  }

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap.get('q');
    if (query) {
      this.scryfallService.buscarCartas(query).subscribe(
        data => {
          this.cartas = data.data || [];
          this.loading = false;
        },
        error => {
          this.loading = false;
          console.error('Error al buscar cartas:', error);
        }
      );
    }
  }

  irADetalle(carta: any) {
    this.router.navigate(['/card-details', carta.id]);
  }

  async mostrarOpciones(carta: any, event: Event) {
    event.stopPropagation();

    const actionSheet = await this.alertController.create({
      header: carta.name,
      buttons: [
        {
          text: 'Añadir a Wants',
          handler: () => {
            this.addToWants(carta);
          }
        },
        {
          text: 'Añadir a Sells',
          handler: () => {
            this.addToSells(carta);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async addToWants(carta: any) {
    try {
      const printData = await lastValueFrom(this.scryfallService.getCardPrints(carta.name));
      if (printData && printData.data) {
        const sortedPrints = printData.data.sort((a: any, b: any) =>
          new Date(a.released_at).getTime() - new Date(b.released_at).getTime()
        );

        const alert = await this.alertController.create({
          header: 'Seleccionar Edición',
          inputs: sortedPrints.map((print: any, idx: number) => ({
            type: 'radio',
            label: `${print.set_name} (${print.prices?.eur ? print.prices.eur + '€' : 'N/A'})`,
            value: idx,
            checked: idx === 0
          })),
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Añadir',
              handler: (value) => {
                const selectedPrint = sortedPrints[value];
                const price = selectedPrint.prices?.eur || selectedPrint.prices?.usd || 0;

                this.userProfileService.addCardToWants(
                  selectedPrint.id,
                  selectedPrint.name,
                  selectedPrint.set,
                  selectedPrint.set_name,
                  parseFloat(price) || 0
                ).subscribe(
                  () => this.presentToast('Carta añadida a wants correctamente'),
                  error => {
                    this.presentToast(error.error?.message || 'Error al añadir carta a wants');
                    console.error('Error al añadir carta a wants:', error);
                  }
                );
              }
            }
          ]
        });

        await alert.present();
      }
    } catch (error) {
      console.error('Error fetching card editions:', error);
    }
  }

  async addToSells(carta: any) {
    try {
      const printData = await lastValueFrom(this.scryfallService.getCardPrints(carta.name));
      if (printData && printData.data) {
        const sortedPrints = printData.data.sort((a: any, b: any) =>
          new Date(a.released_at).getTime() - new Date(b.released_at).getTime()
        );

        const alert = await this.alertController.create({
          header: 'Seleccionar Edición',
          inputs: sortedPrints.map((print: any, idx: number) => ({
            type: 'radio',
            label: `${print.set_name} (${print.prices?.eur ? print.prices.eur + '€' : 'N/A'})`,
            value: idx,
            checked: idx === 0
          })),
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Añadir',
              handler: (value) => {
                const selectedPrint = sortedPrints[value];
                const price = selectedPrint.prices?.eur || selectedPrint.prices?.usd || 0;

                this.userProfileService.addCardToSells(
                  selectedPrint.id,
                  selectedPrint.name,
                  selectedPrint.set,
                  selectedPrint.set_name,
                  parseFloat(price) || 0
                ).subscribe(
                  () => this.presentToast('Carta añadida a sells correctamente'),
                  error => {
                    this.presentToast(error.error?.message || 'Error al añadir carta a sells');
                    console.error('Error al añadir carta a sells:', error);
                  }
                );
              }
            }
          ]
        });

        await alert.present();
      }
    } catch (error) {
      console.error('Error fetching card editions:', error);
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }


  irAPerfil(): void {
    this.router.navigate(['/profile']);
  }
}
