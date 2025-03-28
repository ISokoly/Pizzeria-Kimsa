import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MenuComponent } from '../components/menu/menu.component';
import { ApiService } from '../api.service';


@Component({
  selector: 'app-dashboard',
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MenuComponent
],
templateUrl: './dashboard.component.html',
styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  usuarioNombre = '';

  collapsed = signal(false);

  sidenavWidth = computed(()=>this.collapsed()?'65px':'250px');

  constructor(private router: Router, private apiService: ApiService) {
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
    this.router.navigate(['/dashboard/usuarios']);
  }
}
