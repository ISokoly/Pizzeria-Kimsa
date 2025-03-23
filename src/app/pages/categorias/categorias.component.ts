import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss']
})
export class CategoriasComponent implements OnInit {
  previewImage: string = '';

  cancelEditCategoria() {
    this.selectedCategoria = null;
    this.formData = { nombre: '',  descripcion: '', imagen: ''}; // Restablecer formulario
  }

  categorias: any[] = [];
  formData = { nombre: '', descripcion: '', imagen: '' };
  selectedCategoria: any = null;
  imagePreview: string | null = null;

  constructor(private router: Router, private apiService: ApiService, private http: HttpClient) {}

  verProductos(nombreCategoria: string) {
    const nombreFormateado = encodeURIComponent(nombreCategoria);
    this.router.navigate([`/dashboard/producto/${nombreFormateado}`]);
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
      this.apiService.uploadImage(file).subscribe(response => {
        this.formData.imagen = response.filePath; // Guardamos la imagen en base64
        this.imagePreview = `data:image/png;base64,${response.filePath}`;
      });
    }
  }
  
  saveCategoria(): void {
    if (this.selectedCategoria) {
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
  }

  editCategoria(categoria: any): void {
    this.selectedCategoria = categoria;
    this.formData = { ...categoria };
  }

  deleteCategoria(id: number): void {
    this.apiService.deleteCategoria(id).subscribe(() => {
      this.loadCategorias();
    });
  }

  resetForm(): void {
    this.formData = { nombre: '',  descripcion: '', imagen: ''};
    this.selectedCategoria = null;
    this.imagePreview = null;
  }
}