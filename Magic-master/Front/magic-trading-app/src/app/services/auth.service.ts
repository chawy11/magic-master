import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError, Observable } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  registrar(usuario: any) {
    return this.http.post(`${this.apiUrl}/registro`, usuario).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocurrió un error inesperado';
        if (error.status === 400) {
          if (error.error.errores) {
            return throwError(() => new Error(JSON.stringify(error.error.errores)));
          } else {
            errorMessage = error.error.message;
          }
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales).pipe(
      catchError(this.handleError)
    );
  }

  guardarToken(token: string, usuario: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', usuario);
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('userId');


    window.location.href = '/login';
  }

  getUsuarioActual(): string {
    return localStorage.getItem('usuario') || '';
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error en la autenticación';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 400) {
        errorMessage = error.error.message || 'Usuario o contraseña incorrectos';
      } else if (error.status === 0) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = `Error ${error.status}: ${error.error.message || 'Error desconocido'}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
