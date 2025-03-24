import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Categorías
  getCategorias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categorias`);
  }

  createCategoria(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categorias`, data);
  }

  updateCategoria(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/categorias/${id}`, data);
  }

  deleteCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categorias/${id}`);
  }

    // Marcas
    getMarcas(): Observable<any> {
      return this.http.get(`${this.apiUrl}/marcas`);
    }
  
    createMarca(data: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/marcas`, data);
    }
  
    updateMarca(id: number, data: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/marcas/${id}`, data);
    }
  
    deleteMarca(id: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/marcas/${id}`);
    }

  // Productos
  getProductos(): Observable<any> {
    this.http.get(`${this.apiUrl}/productos`).subscribe(data => console.log(data));

    return this.http.get(`${this.apiUrl}/productos`);
  }

  getProductosByCategoriaNombre(nombreCategoria: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos/categoria/${encodeURIComponent(nombreCategoria)}`);
  }

  createProducto(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos`, data);
  }

  updateProducto(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/productos/${id}`, data);
  }

  deleteProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/productos/${id}`);
  }

    // Productos Bebidas
    getProductosBebidas(): Observable<any> {
      this.http.get(`${this.apiUrl}/productos_bebidas`).subscribe(data => console.log(data));
  
      return this.http.get(`${this.apiUrl}/productos_bebidas`);
    }
  
    getProductosBebidasByCategoriaNombre(nombreCategoria: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/productos_bebidas/categoria/${encodeURIComponent(nombreCategoria)}`);
    }
  
    createProductoBebida(data: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/productos_bebidas`, data);
    }
  
    updateProductoBebida(id: number, data: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/productos_bebidas/${id}`, data);
    }
  
    deleteProductoBebida(id: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/productos_bebidas/${id}`);
    }

  uploadImage(file: File): Observable<{ filePath: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ filePath: string }>(`${this.apiUrl}/upload`, formData);
  }

  // Usuarios
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }
  getUsuarioById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  createUsuario(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }
  updateUsuario(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
  login(usuario: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { usuario, contrasena });
  }
}