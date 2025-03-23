import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss']
})
export class ProductoComponent implements OnInit {
  productos: any[] = [];
  categorias: any[] = [];
  formData = { nombre: '', descripcion: '', precio: 0, id_categoria: '' };
  selectedProducto: any = null;
  nombreCategoria: string = '';

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const nombreCategoria = params.get('nombreCategoria');
      if (nombreCategoria) {
        this.nombreCategoria = nombreCategoria;
        this.loadProductos();
      }
    });

    this.loadCategorias();
  }

  cancelEditProducto(): void {
    this.selectedProducto = null;
    this.resetForm();
  }

  loadProductos(): void {
    if (!this.nombreCategoria) return;
    
    this.apiService.getProductosByCategoriaNombre(this.nombreCategoria).subscribe(
      data => {
        console.log(`Productos cargados para ${this.nombreCategoria}:`, data);
        this.productos = data;
      },
      error => {
        console.error('Error cargando productos:', error);
      }
    );
  }

  loadCategorias(): void {
    this.apiService.getCategorias().subscribe(
      data => {
        console.log('Categorías cargadas:', data);
        this.categorias = data;
      },
      error => {
        console.error('Error cargando categorías:', error);
      }
    );
  }

  saveProducto(): void {
    if (!this.formData.nombre || !this.formData.descripcion || !this.formData.precio || !this.formData.id_categoria) {
      console.warn('Todos los campos son obligatorios');
      return;
    }

    if (this.selectedProducto) {
      this.apiService.updateProducto(this.selectedProducto.id, this.formData).subscribe(() => {
        console.log('Producto actualizado:', this.formData);
        this.loadProductos();
        this.resetForm();
      });
    } else {
      this.apiService.createProducto(this.formData).subscribe(() => {
        console.log('Producto creado:', this.formData);
        this.loadProductos();
        this.resetForm();
      });
    }
  }

  editProducto(producto: any): void {
    this.selectedProducto = producto;
    this.formData = { ...producto };
  }

  deleteProducto(id: number): void {
    this.apiService.deleteProducto(id).subscribe(() => {
      console.log('Producto eliminado:', id);
      this.loadProductos();
    });
  }

  resetForm(): void {
    this.formData = { nombre: '', descripcion: '', precio: 0, id_categoria: '' };
    this.selectedProducto = null;
  }
}
