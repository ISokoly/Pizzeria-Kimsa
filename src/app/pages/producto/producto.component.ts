import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { MatIconModule } from '@angular/material/icon';
import { MarcasService } from '../../core/services/marcas.service';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
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
  marcado: boolean = false;

  formMarca = { nombre: '', tipos_marcas: '' };
  selectedMarca: any = null;
  mostrarFormularioMarca = false;
  selectedMarcaNombre: string = '';
  mostrarLista = false;
  marcasFiltradas = [...this.marcas];
  marcaMap = new Map<number, string>();

  caracteristicas: any[] = [];
  formCaracteristica = { nombre_caracteristica: '', valor_caracteristica: '' };
  mostrarFormularioCaracteristica = false;
  mostrarModalAgregarCaracteristica = false;
  productoIdParaCaracteristica: number | null = null;
  sinCaracteristicas: boolean = false;


  constructor(private apiService: ApiService, private route: ActivatedRoute, private marcasService: MarcasService) { 
    this.marcasService.getMarcas().subscribe(marcas => {
      this.marcas = marcas;
      this.marcasFiltradas = marcas;
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {

      const nombreCategoria = params.get('nombreCategoria');

      if (nombreCategoria) {
        this.nombreCategoria = nombreCategoria;
        this.loadProductos();
      }
    });

    this.apiService.getMarcas().subscribe((marcas: any[]) => {
      this.marcas = marcas;
          this.marcaMap = new Map(marcas.map(m => [m.id, m.nombre]));
    });

    this.loadCategorias();
    this.loadTiposMarcas();
    this.loadCaracteristicas();
  }

  selectedFile: File | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        this.imagePreview = img.src;
      };
      reader.readAsDataURL(file);
    }
  }

  filtro: string = '';
  filtroTipo: 'nombre' | 'caracteristica' | 'marca' = 'nombre';
  mostrarOpciones: boolean = false;
  
  cambiarFiltroTipo(tipo: 'nombre' | 'caracteristica' | 'marca') {
    this.filtroTipo = tipo;
    this.mostrarOpciones = false;
    this.filtro = '';
  }
  
  productosFiltrados() {
    const filtroLower = this.filtro.toLowerCase();
  
    return this.productos.filter(producto => {
      // Verificar si la categoría tiene el campo 'marca' activado
      const categoria = this.categorias.find(cat => cat.id === producto.id_categoria);
      const mostrarMarca = categoria ? categoria.marca : false;
  
      if (this.filtroTipo === 'nombre') {
        return producto.nombre.toLowerCase().includes(filtroLower);
      } else if (this.filtroTipo === 'caracteristica') {
        const caracteristicas = this.caracteristicasMap.get(producto.id) || [];
  
        return caracteristicas.some((c: any) =>
          c.nombre_caracteristica?.toLowerCase().includes(filtroLower) ||
          c.valor_caracteristica?.toLowerCase().includes(filtroLower)
        );
      } else if (this.filtroTipo === 'marca' && mostrarMarca) {
        const nombreMarca = this.marcaMap.get(producto.id_marca);
        return nombreMarca?.toLowerCase().includes(filtroLower);
      }
  
      return true;
    });
  }
  

  cancelEditProducto(): void {
    this.selectedProducto = null;
    this.resetForm('producto');
    this.mostrarFormularioProducto = false;
    document.body.style.overflow = 'auto'; // Restaura el scrol
  }

  validateFormData(): boolean {
    if (!this.formData.nombre || !this.formData.descripcion || !this.formData.precio || !this.formData.id_categoria) {
      alert('Todos los campos del producto son obligatorios.');
      return false;
    }
    if (isNaN(this.formData.precio) || this.formData.precio <= 0) {
      alert('El precio debe ser un valor positivo.');
      return false;
    }
    return true;
  }
  
  validateMarcaData(): boolean {
    if (!this.formMarca.nombre) {
      alert('El nombre de la marca es obligatorio.');
      return false;
    }
    return true;
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

  loadMarcas(tipoMarcaId?: number): void {
    this.apiService.getMarcas().subscribe(
      (data: { id: number; nombre: string; tipos_marcas: number }[]) => {
        // Filtrar solo si se proporciona un tipo
        this.marcas = tipoMarcaId && tipoMarcaId > 0
          ? data.filter(marca => marca.tipos_marcas === tipoMarcaId)
          : data;
  
        // Crear el Map para acceder rápidamente a nombres de marcas por ID
        this.marcaMap = new Map<number, string>();
        this.marcas.forEach(marca => {
          this.marcaMap.set(marca.id, marca.nombre);
        });
  
        console.log('Marcas cargadas:', this.marcas);
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
    this.marcasFiltradas = this.marcas;
    this.mostrarLista = true;
  }

  seleccionarMarca(nombre: string) {
    const marcaSeleccionada = this.marcas.find(m => m.nombre === nombre);
    if (marcaSeleccionada) {
      this.selectedMarcaNombre = marcaSeleccionada.nombre;
      this.formData.id_marca = marcaSeleccionada.id; // <-- Aquí asignas el ID correctamente
    }
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
            this.loadMarcas();
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
    if (!this.validateFormData()) return;
  
    // Si no se selecciona imagen y ya hay una imagen asignada al producto seleccionado, se mantiene
    if (!this.imagePreview && this.selectedProducto && this.selectedProducto.imagen) {
      this.formData.imagen = this.selectedProducto.imagen; // Mantener la imagen anterior si no se selecciona una nueva
    }
  
    // Si no está marcado, se asigna null a la marca
    if (!this.marcado) {
      this.formData.id_marca = null;
    }
  
    const nombre = this.formData.nombre;
    const tipo = 'productos';
  
    // Obtener la categoría del producto
    const categoriaObj = this.categorias.find(cat => cat.id === this.formData.id_categoria);
    const categoria = categoriaObj ? categoriaObj.nombre : 'sin_categoria';
  
    // Utilizamos el id del producto seleccionado si existe
    const productoId = this.selectedProducto ? this.selectedProducto.id : null;
    
    const isUpdate = this.selectedProducto ? true : false; // Determinamos si es actualización o creación
  
    if (this.selectedFile) {
      // Si hay un archivo seleccionado, lo subimos
      this.apiService.uploadImage(this.selectedFile, nombre, tipo, categoria, productoId , isUpdate)
        .subscribe(response => {
          this.formData.imagen = response.filePath; // Asignamos la nueva imagen recibida
          this.finalizarGuardadoProducto(); // Procedemos con la creación o actualización del producto
        });
    } else {
      // Si no se seleccionó un archivo, solo finalizamos el guardado
      this.finalizarGuardadoProducto();
    }
  }
  
  
  finalizarGuardadoProducto(): void {
    const accion = this.selectedProducto
      ? this.apiService.updateProducto(this.selectedProducto.id, this.formData)
      : this.apiService.createProducto(this.formData);

    accion.subscribe(() => {
      console.log(this.selectedProducto ? 'Producto actualizado' : 'Producto creado', this.formData);
      this.loadProductos();
      this.resetForm('producto');
      location.reload();
    });

    this.mostrarFormularioProducto = false;
  }
  
  editProducto(producto: any): void {
    this.selectedProducto = producto;
    this.formData = { ...producto };

    const marcaSeleccionada = this.marcas.find(m => m.id === this.formData.id_marca);
    this.selectedMarcaNombre = marcaSeleccionada ? marcaSeleccionada.nombre : '';

    if (producto.imagen) {
      this.imagePreview = producto.imagen;
    }

    this.loadMarcas();
    const marca = this.marcas.find(m => m.id === producto.id_marca);
    this.selectedMarcaNombre = marca ? marca.nombre : '';
    this.mostrarFormularioProducto = true;
  }


  deleteProducto(id: number): void {
    this.apiService.deleteProducto(id).subscribe(() => {
      console.log('Producto eliminado:', id);
      this.loadProductos();
    });
  }

  resetForm(form: string): void {
    if (form === 'producto') {
      this.formData = { nombre: '', descripcion: '', precio: 0, id_categoria: this.formData.id_categoria, id_marca: null, imagen: '' };
      this.selectedProducto = null;
      this.imagePreview = null;
      this.selectedMarcaNombre = '';
    }
    if (form === 'marca') {
      this.formMarca = { nombre: '', tipos_marcas: this.formMarca.tipos_marcas };
      this.selectedMarca = null;
    }
  }

  mostrarFormularioProducto = false; // Estado para mostrar u ocultar el formulario

  abrirFormularioProducto(producto: any = null) {
    if (!producto) {
      this.resetForm('producto');
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
    this.resetForm('marca');
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
        location.reload();

      });
    } else {
      this.apiService.createMarca(this.formMarca).subscribe(() => {
        console.log('Marca creada:', this.formMarca);
        this.loadMarcas();
        this.cerrarFormularioMarca();
        location.reload();
      });
    }
  }

  cancelEditMarca() {
    this.selectedMarca = null;
    this.formMarca = { nombre: '', tipos_marcas: this.formMarca.tipos_marcas };
    this.mostrarFormularioMarca = false;
    document.body.style.overflow = 'auto';
  }

  caracteristicasMap = new Map<number, any[]>();

  loadCaracteristicas(): void {
    this.apiService.getCaracteristicas().subscribe(
      data => {
        console.log('Características cargadas:', data);
        this.caracteristicas = data;

        // Mapeamos por producto_id
        this.caracteristicasMap.clear();
        for (const c of data) {
          if (!this.caracteristicasMap.has(c.producto_id)) {
            this.caracteristicasMap.set(c.producto_id, []);
          }
          this.caracteristicasMap.get(c.producto_id)!.push(c);
        }
      },
      error => {
        console.error('Error cargando características:', error);
      }
    );
  }

  saveCaracteristica(): void {
    if (!this.productoIdParaCaracteristica) return;

    const data = {
      ...this.formCaracteristica,
      producto_id: this.productoIdParaCaracteristica
    };

    this.apiService.createCaracteristicas(data).subscribe(() => {
      this.loadCaracteristicas();
      this.formCaracteristica = { nombre_caracteristica: '', valor_caracteristica: '' };
      this.mostrarModalAgregarCaracteristica = false;
      this.mostrarFormularioCaracteristica = true;
    });
  }

  deleteCaracteristica(id: number): void {
    this.apiService.deleteCaracteristicas(id).subscribe(() => {
      console.log('Característica eliminada:', id);
      // Al eliminar, recargamos todas las características de todos los productos
      this.loadCaracteristicas();  // Recargamos todas las características
    });
  }

  abrirFormularioCaracteristiscasProducto(producto: any): void {
    if (!producto) {
      return;
    }
    // Asignar el producto seleccionado
    this.selectedProducto = producto;

    this.loadCaracteristicas();
    // Mostrar el formulario de características
    this.productoIdParaCaracteristica = producto.id;
    this.mostrarFormularioCaracteristica = true;
    document.body.style.overflow = 'hidden';
  }

  cancelarFormularioCaracteristica(): void {
    this.mostrarFormularioCaracteristica = false;
    this.selectedProducto = null;
    this.productoIdParaCaracteristica = null;
    document.body.style.overflow = 'auto';
  }

  abrirFormularioAgregarCaracteristiscasProducto(producto: any): void {
    // Asignar el producto seleccionado para agregar nuevas características
    this.selectedProducto = producto;
    this.productoIdParaCaracteristica = producto.id;

    // Abrir el formulario para agregar características
    this.mostrarModalAgregarCaracteristica = true;
    this.mostrarFormularioCaracteristica = false;
    document.body.style.overflow = 'hidden';
    this.formCaracteristica = { nombre_caracteristica: '', valor_caracteristica: '' };
  }

  cancelarAgregarFormularioCaracteristica(): void {
    this.mostrarModalAgregarCaracteristica = false;
    this.formCaracteristica = { nombre_caracteristica: '', valor_caracteristica: '' };
    this.selectedProducto = null;
    this.productoIdParaCaracteristica = null;
    document.body.style.overflow = 'auto';
  }
}