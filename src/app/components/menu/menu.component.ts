import { Component, computed, Input, signal } from '@angular/core';
import {MatListModule} from '@angular/material/list'
import {MatIconModule} from '@angular/material/icon'
import { RouterLink,RouterLinkActive } from '@angular/router';

export type MenuItem={
  icon:string;
  label:string;
  route:string;
}


@Component({
  selector: 'app-menu',
  imports: [MatListModule,MatIconModule,RouterLink,RouterLinkActive],
  template: `
  <div class="sidenav-header">
    <img src="kimsa_black.png" alt="" [width]="profilePicSize()">
    <div class="header-text" [class.hide-header-text]="sideNavCollpsed()">
      <h2>Kisma</h2>
      <p>Pastas y Pizzas</p>
    </div>
  </div>
<br><br>
  <mat-nav-list>
    @for (item of menuItems(); track $index) {
      <a  class="menu-item">
      <mat-list-item routerLinkActive ="selected-menu-item" 
      #rla="routerLinkActive" routerLink={{item.route}}>
        <mat-icon matListItemIcon>{{item.icon}}</mat-icon>
        @if (!sideNavCollpsed()) {
          <span class="title" matListItemTitle>{{item.label}}</span>
        }
      </mat-list-item>
      </a>
    }
  </mat-nav-list>
  `,

  styles: `
  :host{
    transition:all 500ms ease-in-out
  }
  mat-list-item {
  border: 2px solid transparent; /* Borde invisible por defecto */
  color: #D32F2F; /* Rojo tomate para el texto */

  mat-icon {
    color: #D32F2F; /* Rojo tomate para los íconos */
  }

  .title {
    font-weight: bold;
    color: #D32F2F; /* Rojo tomate para los títulos */
  }

  &:hover {
    background-color: rgba(221, 44, 44, 0.1); /* Fondo suave de rojo cuando se pasa el cursor */
    border-color: #D32F2F; /* Borde rojo cuando se pasa el cursor */
  }
}
    .sidenav-header{
      padding-top: 24px;
      text-align:center;

      >img{
        border-radius:100%;
        object-fit:cover;
      }

      .header-text{
        >h2{
          margin:0;
          font-size:1rem;
          line-height:1.5rem;
        }
        >p{
          margin:0;
          font-size:0.8rem;
        }
      }
    }
    .hide-header-text{
      opacity:0;
      height:0px !important ;
    }

    .menu-item{
      border-right: 50px solid;
      border-color:rgba(48, 17, 187, 0);
      
    }
    .selected-menu-item {
      border-left: 5px solid #D32F2F; /* Borde rojo tomate al seleccionar */
      background-color: rgba(221, 44, 44, 0.4);
      border-color: #D32F2F; /* Borde rojo cuando se selecciona */
    }
    .selected-menu-item:hover{
        background-color: rgba(221, 44, 44, 0.4);
      }
  `
})
export class MenuComponent {

  sideNavCollpsed=signal(false);
  @Input() set collapsed(val:boolean){
    this.sideNavCollpsed.set(val)
  }

  menuItems=signal<MenuItem[]>([
    {
      icon:'local_pizza',
      label:'Productos',
      route:'categoria'
    },
    {
      icon:'store',
      label:'Ventas',
      route:'ventas'
    },
    {
      icon:'trending_up',
      label:'Estadisticas',
      route:'estadisticas'
    }
  ])

  profilePicSize = computed(()=>
    this.sideNavCollpsed()?'32':'100'
  );
}
