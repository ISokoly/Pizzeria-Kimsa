import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MenuComponent } from '../components/menu/menu.component';


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
  collapsed = signal(false);

  sidenavWidth = computed(()=>this.collapsed()?'65px':'250px');

  constructor(private router: Router) {}

  logout() {
    this.router.navigate(['/login']);
  }
}
