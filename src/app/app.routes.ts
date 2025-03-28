import { Routes } from '@angular/router';
import { ProductoComponent } from './pages/producto/producto.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UruariosComponent } from './pages/uruarios/uruarios.component';
import { AuthGuard } from './auth.guard';
import { VentasComponent } from './pages/ventas/ventas.component';

const usuarioGuardado = localStorage.getItem('usuario');
const redireccionInicial = usuarioGuardado ? 'dashboard' : 'login';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: redireccionInicial
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'categoria', pathMatch: 'full' },
      { path: 'categoria', component: CategoriasComponent },
      { path: 'producto/:nombreCategoria', component: ProductoComponent },
      { path: 'ventas', component: VentasComponent },
      { path: 'usuarios', component: UruariosComponent }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];
