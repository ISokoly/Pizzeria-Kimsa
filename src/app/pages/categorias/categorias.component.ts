import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss']
})
export class CategoriasComponent implements OnInit {
  tiposMarcas: any[] = [];
  categorias: any[] = [];
  formData = { nombre: '', descripcion: '', imagen: '', marca: false };
  selectedCategoria: any = null;
  imagePreview: string | null = null;

  constructor(private router: Router, private apiService: ApiService, private http: HttpClient) { }

  verProductos(nombreCategoria: string, marcado: boolean) {
    const nombreFormateado = encodeURIComponent(nombreCategoria);
    const ruta = `/view/categoria/producto/${nombreFormateado}`;
    this.router.navigate([ruta]);
    marcado = this.formData.marca;
  }

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.apiService.getCategorias().subscribe(data => {
      this.categorias = data;
    });
  }

  loadTiposMarcas(): void {
    this.apiService.getTiposMarca().subscribe(data => {
      this.tiposMarcas = data;
    });
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

  saveCategoria(): void {
    const nombreCategoria = this.formData.nombre?.trim();
  
    if (!nombreCategoria) {
      alert('El nombre de la categoría no puede estar vacío.');
      return;
    }
  
    if (!this.imagePreview && this.selectedCategoria && this.selectedCategoria.imagen) {
      this.formData.imagen = this.selectedCategoria.imagen;
    }
  
    this.apiService.getCategorias().subscribe((categorias: any[]) => {
      this.categorias = categorias;
  
      const existeOtraCategoria = this.categorias.some(cat =>
        cat.nombre.toLowerCase() === nombreCategoria.toLowerCase() &&
        (!this.selectedCategoria || cat.id !== this.selectedCategoria.id) // Comparación por ID
      );
  
      if (existeOtraCategoria) {
        alert('Ya existe otra categoría con este nombre.');
        return;
      }
  
      // Si hay un archivo seleccionado, sube la imagen
      if (this.selectedFile) {
        const nombre = this.formData.nombre;
        const tipo = 'categorias'; // Cambia esto si es necesario
        const categoria = nombreCategoria; // Asegúrate de que esto existe
  
        this.apiService.uploadImage(this.selectedFile, nombre, tipo, categoria).subscribe(response => {
          this.formData.imagen = response.filePath;
  
          // Después de subir la imagen, guarda la categoría
          if (this.selectedCategoria) {
            this.apiService.updateCategoria(this.selectedCategoria.id, this.formData).subscribe(() => {
              this.loadCategorias();
              this.resetForm();
            });
  
          } else {
            this.apiService.createCategoria(this.formData).subscribe(() => {
              this.loadCategorias();
              this.resetForm();
              location.reload();
            });
          }
  
          this.mostrarFormulario = false;
          location.reload();
        });
      } else {
        // Si no hay archivo seleccionado, guarda la categoría directamente
        if (this.selectedCategoria) {
          this.apiService.updateCategoria(this.selectedCategoria.id, this.formData).subscribe(() => {
            this.loadCategorias();
            this.resetForm();
          });
  
        } else {
          this.apiService.createCategoria(this.formData).subscribe(() => {
            this.loadCategorias();
            this.resetForm();
            location.reload();
          });
        }
  
        this.mostrarFormulario = false;
        location.reload();
      }
    });
  }
  

  editCategoria(categoria: any): void {
    this.selectedCategoria = categoria;
    this.formData = { ...categoria };
    this.mostrarFormulario = true;
  }
  cancelEditCategoria() {
    this.selectedCategoria = null;
    this.formData = { nombre: '', descripcion: '', imagen: '', marca: false };
    this.mostrarFormulario = false;
    document.body.style.overflow = 'auto';
  }

  deleteCategoria(id: number, nombre: string): void {
    this.apiService.getTiposMarcaByNombre(nombre).subscribe({
      next: (tipoMarcas: any[]) => {
        if (tipoMarcas.length > 0) {
          this.apiService.deleteTiposMarca(nombre).subscribe({
            next: () => this.eliminarCategoria(id),
            error: (error) => {
              console.error('Error al eliminar tipos_marcas:', error);
              this.eliminarCategoria(id);
            }
          });
        } else {
          this.eliminarCategoria(id);
        }
      },
      error: (error) => {
        console.error('Error al obtener tipos_marcas:', error);
        this.eliminarCategoria(id);
      }
    });
  }

  private eliminarCategoria(id: number): void {
    this.apiService.deleteCategoria(id).subscribe({
      next: () => {
        console.log(`Categoría con ID ${id} eliminada`);
        this.loadCategorias();
        this.loadTiposMarcas();
      },
      error: (error) => console.error('Error al eliminar categoría:', error)
    });
  }

  resetForm(): void {
    this.formData = { nombre: '', descripcion: '', imagen: '', marca: false };
    this.selectedCategoria = null;
    this.imagePreview = null;
  }

  toggleMarca() {
    this.formData.marca = !this.formData.marca;
  }

  mostrarFormulario = false;

  abrirFormulario(categoria: any = null) {
    this.selectedCategoria = categoria;
    this.mostrarFormulario = true;
    document.body.style.overflow = 'hidden'; // Bloquea el scroll del fondo
  }

  cerrarFormulario() {
    this.selectedCategoria = null;
    this.mostrarFormulario = false;
    document.body.style.overflow = 'auto'; // Restaura el scroll
  }
}