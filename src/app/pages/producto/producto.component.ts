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
  formData = { nombre: '', descripcion: '', precio: 0, id_categoria: '', imagen: ''};
  selectedProducto: any = null;
  nombreCategoria: string = '';
  imagePreview: string | null = null;
  selectedCategoriaNombre: string = 'Productos de la pizzería';

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      
      const nombreCategoria = params.get('nombreCategoria');
      console.log('Nombre de categoría obtenido del route:', nombreCategoria);

      if (nombreCategoria) {
        this.nombreCategoria = nombreCategoria;
        this.loadProductos();
      }
    });

    this.loadCategorias();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.apiService.uploadImage(file).subscribe(response => {
        this.formData.imagen = response.filePath;
        this.imagePreview = `data:image/png;base64,${response.filePath}`;
      });
    }
  }

  cancelEditProducto(): void {
    this.selectedProducto = null;
    this.resetForm();
    this.mostrarFormularioProducto = false;
    document.body.style.overflow = 'auto'; // Restaura el scrol
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
    if (!this.imagePreview && this.formData.imagen) {
      alert('Seleccione una imagen');
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
    this.mostrarFormularioProducto = false;
  }

  editProducto(producto: any): void {
    this.selectedProducto = producto;
    this.formData = { ...producto };
    this.mostrarFormularioProducto = true;
  }

  deleteProducto(id: number): void {
    this.apiService.deleteProducto(id).subscribe(() => {
      console.log('Producto eliminado:', id);
      this.loadProductos();
    });
  }

  resetForm(): void {
    this.formData = { nombre: '', descripcion: '', precio: 0, id_categoria: '', imagen: '' };
    this.selectedProducto = null;
    this.imagePreview = null;
  }

  mostrarFormularioProducto = false; // Estado para mostrar u ocultar el formulario

  abrirFormularioProducto(producto: any = null) {
    this.selectedProducto = producto;
    this.mostrarFormularioProducto = true;
    document.body.style.overflow = 'hidden'; // Bloquea el scroll del fondo
  }
  
  cerrarFormularioProducto() {
    this.selectedProducto = null;
    this.mostrarFormularioProducto = false;
    document.body.style.overflow = 'auto'; // Restaura el scroll
  }
}