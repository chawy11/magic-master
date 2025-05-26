import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { CustomValidators } from '../validators/form-validators';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel, IonNote,
  IonTitle,
  IonToolbar
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ReactiveFormsModule,
    IonItem,
    IonInput,
    IonLabel,
    IonButton,
    RouterLink,
    IonNote,
  ]
})

export class RegistroPage {
  registroForm: FormGroup;
  campoTocado: { [key: string]: boolean } = {};
  errorMessage: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(5), CustomValidators.usernameFormat()]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), CustomValidators.passwordStrength()]],
    });
  }

  onBlur(campo: string) {
    this.campoTocado[campo] = true; // Marca el campo como tocado
  }

  mostrarError(campo: string): boolean {
    return ((this.registroForm.get(campo)?.invalid ?? false) && this.campoTocado[campo])
      || !!this.errorMessage[campo];
  }

  onSubmit() {
    Object.keys(this.registroForm.controls).forEach((campo) => {
      this.campoTocado[campo] = true;
    });

    this.errorMessage = {};

    if (this.registroForm.invalid) {
      return;
    }

    this.authService.registrar(this.registroForm.value).subscribe({
      next: (response) => {
        console.log('Usuario registrado', response);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error en el registro', error);

        try {
          const errores = JSON.parse(error.message);
          errores.forEach((err: string) => {
            if (err.includes('email')) {
              this.errorMessage['email'] = err;
              this.registroForm.get('email')?.reset();
            }
            if (err.includes('nombre de usuario')) {
              this.errorMessage['usuario'] = err;
              this.registroForm.get('usuario')?.reset();
            }
          });
        } catch (e) {
          if (error.message === 'El email ya está registrado') {
            this.errorMessage['email'] = error.message;
            this.registroForm.get('email')?.reset();
          } else if (error.message === 'El nombre de usuario ya está registrado') {
            this.errorMessage['usuario'] = error.message;
            this.registroForm.get('usuario')?.reset();
          } else {
            this.errorMessage['general'] = error.message;
          }
        }
      }
    });
  }
}
