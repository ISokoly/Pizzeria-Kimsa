import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule]
})
export class LoginComponent {
  usuario: string = '';
  contrasena: string = '';
  error: string = '';

  constructor(private apiService: ApiService, private router: Router) { }

  login() {
    this.apiService.login(this.usuario, this.contrasena).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del servidor:', response); // 👀 Verifica qué devuelve el backend

        if (response.success && response.usuario && response.token) {
          this.apiService.setUsuarioActual(response.usuario, response.token);

          console.log('🔍 Usuario guardado en localStorage:', localStorage.getItem('usuario')); // 👀 Confirma que se guarda

          this.router.navigate(['/view']).then(() => {
            location.reload();
          });
        } else {
          this.error = 'Usuario o contraseña incorrectos';
        }
      },
      error: (err) => {
        console.error('❌ Error en login:', err);
        this.error = 'Error al conectar con el servidor';
      }
    });
  }
}
