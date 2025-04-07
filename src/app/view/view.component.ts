import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MenuComponent } from '../components/menu/menu.component';
import { ApiService } from '../core/services/api.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-view',
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MenuComponent,
    CommonModule
  ],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent {
  usuarioNombre = '';

  collapsed = signal(false);
  estaSeleccionado = false;

  sidenavWidth = computed(() => this.collapsed() ? '65px' : '250px');
  isUsuariosPage: boolean = false;
  static estaSeleccionado: boolean;

  constructor(private router: Router, private apiService: ApiService) {
    this.router.events.subscribe(() => {
      this.isUsuariosPage = this.router.url.startsWith('/view/usuarios');
    });
  }

  ngOnInit() {
    const usuario = this.apiService.usuarioAutenticado;
    if (usuario) {
      this.usuarioNombre = `${usuario.nombre} ${usuario.apellido}`;
    }
  }

  logout() {
    this.apiService.logout();
    location.reload();
  }

  irAUsuarios(): void {
    this.estaSeleccionado = true;
    this.router.navigate(['/view/usuarios']);
  }
}
