import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'card-details/:id', // Ruta dinámica para los detalles de la carta
    loadComponent: () => import('./card-details/card-details.page').then((m) => m.CardDetailsPage),
    canActivate: [authGuard],
  },
  {
    path: 'card-list', // Ruta para la lista de cartas
    loadComponent: () => import('./card-list/card-list.page').then((m) => m.CardListPage),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then((m) => m.ProfilePage),
    canActivate: [authGuard],
  },
  {
    path: 'profile/:username',
    loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'registro',
    pathMatch: 'full',
  },
];
