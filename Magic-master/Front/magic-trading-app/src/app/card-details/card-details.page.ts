import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { ScryfallService } from '../services/scryfall.service';
import { UserprofileService } from '../services/userprofile.service';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon, IonButtons, ToastController
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { add, personCircleOutline, arrowBackOutline, ellipsisHorizontalOutline} from 'ionicons/icons';
import { AlertController } from '@ionic/angular/standalone';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-card-details',
  templateUrl: './card-details.page.html',
  styleUrls: ['./card-details.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonButtons,
    IonButton,
    RouterLink
  ]
})
export class CardDetailsPage implements OnInit {
  carta: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scryfallService: ScryfallService,
    private userProfileService: UserprofileService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ ellipsisHorizontalOutline, add, personCircleOutline, arrowBackOutline });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.scryfallService.obtenerDetallesCarta(id).subscribe(
        data => {
          this.carta = data;
        },
        error => {
          console.error('Error al obtener los detalles de la carta:', error);
        }
      );
    }
  }

  async mostrarOpciones(event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Añadir a Wants',
          handler: () => {
            this.addToWants();
          }
        },
        {
          text: 'Añadir a Sells',
          handler: () => {
            this.addToSells();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  async addToWants() {
    if (!this.carta) return;

    try {
      const printData = await lastValueFrom(this.scryfallService.getCardPrints(this.carta.name));
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

  async addToSells() {
    if (!this.carta) return;

    try {
      const printData = await lastValueFrom(this.scryfallService.getCardPrints(this.carta.name));
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
