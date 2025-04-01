import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss']
})
export class ProductoComponent implements OnInit {
  productos: any[] = [];
  tiposMarcas: any[] = [];
  categorias: any[] = [];
  marcas: any[] = [];
  formData = { nombre: '', descripcion: '', precio: 0, id_categoria: '', id_marca: null as number | null, imagen: '' };
  selectedProducto: any = null;
  nombreCategoria: string = '';
  imagePreview: string | null = null;
  selectedCategoriaNombre: string = 'Productos de la pizzería';
  marcado: boolean = false;

  formMarca = { nombre: '', tipos_marcas: '' };
  selectedMarca: any = null;
  mostrarFormularioMarca = false;
  selectedMarcaNombre: string = ''; // Para almacenar el nombre de la marca seleccionada
  isVertical: boolean = false;
  mostrarLista = false;
  marcasFiltradas = [...this.marcas];

  constructor(private apiService: ApiService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {

      const nombreCategoria = params.get('nombreCategoria');

      if (nombreCategoria) {
        this.nombreCategoria = nombreCategoria;
        this.loadProductos();
      }
    });

    this.loadCategorias();
    this.loadTiposMarcas();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          this.isVertical = img.height > img.width;
          this.imagePreview = img.src;
        };
      };
      reader.readAsDataURL(file);

      // Subir la imagen sin afectar la lógica anterior
      this.apiService.uploadImage(file).subscribe(response => {
        this.formData.imagen = response.filePath;
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
    const tipoMarcaSeleccionado = Number(this.formMarca.tipos_marcas);

    if (isNaN(tipoMarcaSeleccionado) || tipoMarcaSeleccionado === 0) {
      this.marcas = [];
      return;
    }

    this.apiService.getMarcas().subscribe(
      (data: { id: number; nombre: string; tipos_marcas: number }[]) => {
        this.marcas = data.filter(marca => marca.tipos_marcas === tipoMarcaSeleccionado);
        console.log('Marcas filtradas:', this.marcas);
      },
      error => {
        console.error('Error cargando marcas:', error);
      }
    );
  }

  filtrarMarcas() {
    this.marcasFiltradas = this.marcas.filter((marca) =>
      marca.nombre.toLowerCase().includes(this.selectedMarcaNombre.toLowerCase())
    );
    this.mostrarLista = this.marcasFiltradas.length > 0;
  }

  mostrarListaMarcas() {
    // Al enfocar el input, mostramos todas las marcas si no hay filtro
    this.marcasFiltradas = this.marcas;
    this.mostrarLista = true;
  }

  seleccionarMarca(nombre: string) {
    this.selectedMarcaNombre = nombre;
    this.mostrarLista = false;
  }

  ocultarListaConRetraso() {
    setTimeout(() => (this.mostrarLista = false), 200);
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

  loadTiposMarcas(): void {
    this.apiService.getTiposMarca().subscribe(
      data => {
        console.log('Tipos de Marcas cargadas:', data);
        this.tiposMarcas = data;

        // Asegura que se seleccione el tipo de marca correcto basado en la categoría
        const tiposMarcasEncontrada = this.tiposMarcas.find(c => c.nombre === this.nombreCategoria);
        if (tiposMarcasEncontrada) {
          this.formMarca.tipos_marcas = tiposMarcasEncontrada.id;
        }
      },
      error => {
        console.error('Error cargando tipos_marcas:', error);
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
      this.selectedMarcaNombre = ''; // Reiniciar el campo de marca
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
    this.selectedMarcaNombre = ''; // Reiniciar el campo de marca
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
    this.formMarca = { nombre: '', tipos_marcas: this.formMarca.tipos_marcas };
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
    this.formMarca = { nombre: '', tipos_marcas: this.formMarca.tipos_marcas };
    this.mostrarFormularioMarca = false;
    document.body.style.overflow = 'auto';
  }
}