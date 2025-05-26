import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonTitle,
  IonToolbar
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ReactiveFormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    RouterLink,
    IonNote
  ]
})
export class LoginPage {
  loginForm: FormGroup;
  campoTocado: { [key: string]: boolean } = {};
  mensajeError: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }


  onBlur(campo: string) {
    this.campoTocado[campo] = true;
  }


  mostrarError(campo: string): boolean {
    return (this.loginForm.get(campo)?.invalid ?? false) && this.campoTocado[campo];
  }


  onSubmit() {
    Object.keys(this.loginForm.controls).forEach((campo) => {
      this.campoTocado[campo] = true;
    });

    if (this.loginForm.invalid) {
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        console.log('Inicio de sesión exitoso', response);
        this.authService.guardarToken(response.token, this.loginForm.value.usuario);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error en el inicio de sesión', error);
        this.mensajeError = error.message || 'Error de autenticación';
        this.loginForm.reset();
      }
    });
  }
}
