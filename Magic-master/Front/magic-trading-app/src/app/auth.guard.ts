import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    // Verifica si el usuario está autenticado
    if (this.authService.estaAutenticado()) {
      return true; // Permite el acceso a la ruta
    }

    // Si no está autenticado:
    // 1. Muestra un mensaje toast
    const toast = await this.toastController.create({
      message: 'Debes iniciar sesión para acceder a esta página',
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();

    // 2. Guarda la URL original para volver después del login
    const redirectUrl = state.url;

    // 3. Redirige al usuario a la página de login
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: redirectUrl }
    });

    // 4. Deniega el acceso a la ruta
    return false;
  }
}
