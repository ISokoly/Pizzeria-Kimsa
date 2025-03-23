import { Routes } from '@angular/router';
import { ProductoComponent } from './pages/producto/producto.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
export const routes: Routes = [
  {
    path:'',
    pathMatch:'full',
    redirectTo:'login'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'categoria', pathMatch: 'full' },
      { path: 'categoria', component: CategoriasComponent },
      { path: 'producto/:nombreCategoria', component: ProductoComponent },
    ]
  },
  {
    path:'login',
    component:LoginComponent
  }
];
