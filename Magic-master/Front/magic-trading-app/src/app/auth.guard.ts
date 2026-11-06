import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ToastController } from '@ionic/angular/standalone';

export const authGuard: CanActivateFn = async (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastController = inject(ToastController);

  if (authService.estaAutenticado()) {
    return true;
  }

  const toast = await toastController.create({
      message: 'Debes iniciar sesión para acceder a esta página',
      duration: 2000,
      position: 'bottom'
  });
  await toast.present();

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
