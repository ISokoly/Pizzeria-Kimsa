import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';  // Ajusta la importación según tu estructura

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router, private apiService: ApiService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Verifica si el usuario está autenticado y es administrador
    const usuario = this.apiService.usuarioAutenticado;

    if (usuario && usuario.rol === 'Administrador') {
      return true;
    }

    // Si no es admin, redirige a la página de usuarios
    this.router.navigate(['/view/usuarios']);
    return false;
  }
}
