import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';
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
  isVertical: boolean = false;
  cancelEditCategoria() {
    this.selectedCategoria = null;
    this.formData = { nombre: '',  descripcion: '', imagen: '', marca: false}; // Restablecer formulario
    this.mostrarFormulario = false;
    document.body.style.overflow = 'auto';
  }

  categorias: any[] = [];
  formData = { nombre: '', descripcion: '', imagen: '', marca: false };
  selectedCategoria: any = null;
  imagePreview: string | null = null;

  constructor(private router: Router, private apiService: ApiService, private http: HttpClient) {}

  verProductos(nombreCategoria: string, marcado: boolean) {
    const nombreFormateado = encodeURIComponent(nombreCategoria);
    const ruta = `/dashboard/producto/${nombreFormateado}`;
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
  
      this.apiService.uploadImage(file).subscribe(response => {
        this.formData.imagen = response.filePath;
      });
    }
  }

  saveCategoria(): void {
    if (this.selectedCategoria) {
      if (!this.imagePreview && this.formData.imagen === this.selectedCategoria.imagen) {
        alert('Seleccione una imagen');
        return;
      }
  
      this.apiService.updateCategoria(this.selectedCategoria.id, this.formData).subscribe(() => {
        this.loadCategorias();
        this.resetForm();
      });
    } else {
      this.apiService.createCategoria(this.formData).subscribe(() => {
        this.loadCategorias();
        this.resetForm();
      });
    }
  
    this.mostrarFormulario = false;
  }
  
  
  editCategoria(categoria: any): void {
    this.selectedCategoria = categoria;
    this.formData = { ...categoria };
    this.mostrarFormulario = true;
  }

  deleteCategoria(id: number): void {
    this.apiService.deleteCategoria(id).subscribe(() => {
      this.loadCategorias();
    });
  }

  resetForm(): void {
    this.formData = { nombre: '',  descripcion: '', imagen: '', marca: false};
    this.selectedCategoria = null;
    this.imagePreview = null;
  }

  toggleMarca() {
    this.formData.marca = !this.formData.marca;
  }

  mostrarFormulario = false; // Estado para mostrar u ocultar el formulario

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