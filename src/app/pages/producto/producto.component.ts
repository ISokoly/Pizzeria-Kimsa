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
  marcas: any[] = [];
  formData = { nombre: '', descripcion: '', precio: 0, id_categoria: '', id_marca: null as number | null, imagen: ''};
  selectedProducto: any = null;
  nombreCategoria: string = '';
  imagePreview: string | null = null;
  selectedCategoriaNombre: string = 'Productos de la pizzería';
  marcado: boolean = false;

  formMarca = { nombre: ''};
  selectedMarca: any = null;
  mostrarFormularioMarca = false;
  selectedMarcaNombre: string = ''; // Para almacenar el nombre de la marca seleccionada

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
  
        const categoriaEncontrada = this.categorias.find(c => c.nombre === this.nombreCategoria);
        if (categoriaEncontrada) {
          this.formData.id_categoria = categoriaEncontrada.id;
          this.marcado = categoriaEncontrada.marca;
          
          if (this.marcado) {
            this.loadMarcas(); // Cargar marcas si la categoría las requiere
          }
        }
      },
      error => {
        console.error('Error cargando categorías:', error);
      }
    );
  }
  

  onMarcaSelected(): void {
    const marcaSeleccionada = this.marcas.find(m => m.nombre === this.selectedMarcaNombre);
    this.formData.id_marca = marcaSeleccionada ? marcaSeleccionada.id : null;
  }

  saveProducto(): void {
    if (!this.imagePreview && this.formData.imagen) {
      alert('Seleccione una imagen');
      return;
    }

    if (!this.marcado) {
      this.formData.id_marca = null;
    }

    const accion = this.selectedProducto
      ? this.apiService.updateProducto(this.selectedProducto.id, this.formData)
      : this.apiService.createProducto(this.formData);

    accion.subscribe(() => {
      console.log(this.selectedProducto ? 'Producto actualizado' : 'Producto creado', this.formData);
      this.loadProductos();
      this.resetForm();
    });

    this.mostrarFormularioProducto = false;
  }
  

  editProducto(producto: any): void {
    this.selectedProducto = producto;
    this.formData = { ...producto };
  
    const marcaSeleccionada = this.marcas.find(m => m.id === this.formData.id_marca);
    this.selectedMarcaNombre = marcaSeleccionada ? marcaSeleccionada.nombre : '';
  
    this.mostrarFormularioProducto = true;
  }

  deleteProducto(id: number): void {
    this.apiService.deleteProducto(id).subscribe(() => {
      console.log('Producto eliminado:', id);
      this.loadProductos();
    });
  }

  resetForm(): void {
    this.formData = { nombre: '', descripcion: '', precio: 0, id_categoria: this.formData.id_categoria, id_marca: null, imagen: '' };
    this.selectedProducto = null;
    this.imagePreview = null;
    this.selectedMarcaNombre = '';
  }

  mostrarFormularioProducto = false; // Estado para mostrar u ocultar el formulario

  abrirFormularioProducto(producto: any = null) {
    if (!producto) {
      this.resetForm(); // Resetea el formulario al abrirlo para crear un nuevo producto
    } else {
      this.selectedProducto = producto;
      this.formData = { ...producto };
  
      // Si la categoría tiene marcas, actualizar el nombre de la marca seleccionada
      const marcaSeleccionada = this.marcas.find(m => m.id === this.formData.id_marca);
      this.selectedMarcaNombre = marcaSeleccionada ? marcaSeleccionada.nombre : '';
    }
  
    this.mostrarFormularioProducto = true;
    document.body.style.overflow = 'hidden';
  
    if (this.marcado) {
      this.loadMarcas();
    }
  }
  
  cerrarFormularioProducto() {
    this.selectedProducto = null;
    this.mostrarFormularioProducto = false;
    document.body.style.overflow = 'auto'; // Restaura el scroll
  }

  abrirFormularioMarca(marca: any = null) {
    this.selectedMarca = marca;
    this.mostrarFormularioMarca = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarFormularioMarca() {
    this.selectedMarca = null;
    this.mostrarFormularioMarca = false;
    document.body.style.overflow = 'auto';
    this.resetFormMarca();
  }

  resetFormMarca(): void {
    this.formMarca = { nombre: '' };
    this.selectedMarca = null;
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

  cancelEditMarca() {
    this.selectedMarca = null;
    this.formMarca = { nombre: ''};
    this.mostrarFormularioMarca = false;
    document.body.style.overflow = 'auto';
  }
}