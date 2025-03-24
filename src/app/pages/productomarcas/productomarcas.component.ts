import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-productomarcas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productomarcas.component.html',
  styleUrls: ['./productomarcas.component.scss']
})
export class ProductoMarcasComponent implements OnInit {
  productos: any[] = [];
  categorias: any[] = [];
  marcas: any[] = [];
  formData = { nombre: '', id_marca:'', descripcion: '', precio: 0, id_categoria: '', imagen: ''};
  selectedProductoMarca: any = null;
  nombreCategoria: string = '';
  imagePreview: string | null = null;
  selectedCategoriaNombreMarca: string = 'Productos de la pizzería';

  formMarca = { nombre: ''};
  selectedMarca: any = null;
  mostrarFormularioMarca = false;

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const nombreCategoria = params.get('nombreCategoria');
      console.log('Nombre de categoría obtenido del route:', nombreCategoria);

      if (nombreCategoria) {
        this.nombreCategoria = nombreCategoria;
        this.loadProductosMarca();
      }
    });

    this.loadCategorias();
    this.loadMarcas();
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

  cancelEditProductoMarca(): void {
    this.selectedProductoMarca = null;
    this.resetForm();
    this.mostrarFormularioProducto = false;
    document.body.style.overflow = 'auto';
  }

  loadProductosMarca(): void {
    if (!this.nombreCategoria) return;
    
    this.apiService.getProductosBebidasByCategoriaNombre(this.nombreCategoria).subscribe(
      data => {
        console.log(`Productos cargados para ${this.nombreCategoria}:`, data);
        this.productos = data;
      },
      error => {
        console.error('Error cargando productos:', error);
      }
    );
  }

  loadMarcas(): void {
    this.apiService.getMarcas().subscribe(
      data => {
        console.log('Marcas cargadas:', data);
        this.marcas = data;
      },
      error => {
        console.error('Error cargando marcas:', error);
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

  saveProductoMarca(): void {
    if (!this.formData.nombre || !this.formData.descripcion || !this.formData.id_marca ||!this.formData.precio || !this.formData.id_categoria || !this.formData.imagen) {
      console.warn('Todos los campos son obligatorios');
      return;
    }

    if (!this.imagePreview && this.formData.imagen) {
      alert('Seleccione una imagen');
      return;
    }
    
    if (this.selectedProductoMarca) {
      this.apiService.updateProductoBebida(this.selectedProductoMarca.id, this.formData).subscribe(() => {
        console.log('Producto actualizado:', this.formData);
        this.loadProductosMarca();
        this.resetForm();
      });
    } else {
      this.apiService.createProductoBebida(this.formData).subscribe(() => {
        console.log('Producto creado:', this.formData);
        this.loadProductosMarca();
        this.resetForm();
      });
    }
    this.mostrarFormularioProducto = false;
  }

  cancelEditMarca() {
    this.selectedMarca = null;
    this.formMarca = { nombre: ''}; // Restablecer formulario
    this.mostrarFormularioMarca = false;
    document.body.style.overflow = 'auto';
  }

  editProductoMarca(producto: any): void {
    this.selectedProductoMarca = producto;
    this.formData = { ...producto };
    this.mostrarFormularioProducto = true;
  }

  deleteProductoMarca(id: number): void {
    this.apiService.deleteProductoBebida(id).subscribe(() => {
      console.log('Producto eliminado:', id);
      this.loadProductosMarca();
    });
  }

  resetForm(): void {
    this.formData = { nombre: '', id_marca:'', descripcion: '', precio: 0, id_categoria: '', imagen: '' };
    this.selectedProductoMarca = null;
    this.imagePreview = null;
  }

  mostrarFormularioProducto = false; // Estado para mostrar u ocultar el formulario

  abrirFormularioProductoMarca(producto: any = null) {
    this.selectedProductoMarca = producto;
    this.mostrarFormularioProducto = true;
    document.body.style.overflow = 'hidden'; // Bloquea el scroll del fondo
  }
  
  cerrarFormularioProductoMarca() {
    this.selectedProductoMarca = null;
    this.mostrarFormularioProducto = false;
    document.body.style.overflow = 'auto'; // Restaura el scroll
  }

  // 📌 Funciones para marcas
  abrirFormularioMarca(marca: any = null) {
    this.selectedMarca = marca;
    this.mostrarFormularioMarca = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarFormularioMarca() {
    this.selectedMarca = null;
    this.mostrarFormularioMarca = false;
    document.body.style.overflow = 'auto';
  }

  saveMarca(): void {
    if (!this.formMarca.nombre) {
      console.warn('El nombre de la marca es obligatorio');
      return;
    }

    if (this.selectedMarca) {
      this.apiService.updateMarca(this.selectedMarca.id, this.formMarca).subscribe(() => {
        console.log('Marca actualizada:', this.formMarca);
        this.loadMarcas();
        this.cerrarFormularioMarca();
      });
    } else {
      this.apiService.createMarca(this.formMarca).subscribe(() => {
        console.log('Marca creada:', this.formMarca);
        this.loadMarcas();
        this.cerrarFormularioMarca();
      });
    }
  }
}