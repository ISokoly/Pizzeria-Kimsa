import { Routes } from '@angular/router';
import { ProductoComponent } from './pages/producto/producto.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { LoginComponent } from './login/login.component';
import { ViewComponent } from './view/view.component';
import { UruariosComponent } from './pages/uruarios/uruarios.component';
import { AuthGuard } from './core/guard/auth.guard';
import { VentasComponent } from './pages/ventas/ventas.component';
import { EstadisticasComponent } from './estadisticas/estadisticas.component';

const usuarioGuardado = localStorage.getItem('usuario');
const redireccionInicial = usuarioGuardado ? 'view' : 'login';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: redireccionInicial
  },
  {
    path: 'view',
    component: ViewComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'categoria', pathMatch: 'full' },
      { path: 'categoria', component: CategoriasComponent },
      { path: 'categoria/producto/:nombreCategoria', component: ProductoComponent },
      { path: 'ventas', component: VentasComponent },
      { path: 'estadisticas', component: EstadisticasComponent },
      { path: 'usuarios', component: UruariosComponent }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];
