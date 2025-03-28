import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:3000/api';
  private usuarioActualSubject: BehaviorSubject<any>;
  public usuarioActual: Observable<any>;

  constructor(private http: HttpClient) {
    const usuarioGuardado = localStorage.getItem('usuario');
    this.usuarioActualSubject = new BehaviorSubject<any>(usuarioGuardado ? JSON.parse(usuarioGuardado) : null);
    this.usuarioActual = this.usuarioActualSubject.asObservable();
  }

  // Método para obtener el usuario actual
  public get usuarioAutenticado(): any {
    return this.usuarioActualSubject.value;
  }

  // Login con almacenamiento de usuario
  login(usuario: string, contrasena: string): Observable<any> {
    return this.http.post<{ success: boolean; usuario?: any; token?: string; message?: string }>(
      `${this.apiUrl}/login`, 
      { usuario, contrasena },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      catchError(error => {
        console.error('Error en el login:', error);
        return throwError(() => new Error('Error al iniciar sesión'));
      })
    );
  }

  // Guardar usuario en localStorage y actualizar el estado
  setUsuarioActual(usuario: any, token: string): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('token', token);
    this.usuarioActualSubject.next(usuario);
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.usuarioActualSubject.next(null);
  }

  // Obtener token actual
  getToken(): string | null {
    return localStorage.getItem('token');
  }

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

  // Subir imágenes
  uploadImage(file: File): Observable<{ filePath: string }> {
    const formData = new FormData();
    formData.append('image', file);
  
    return this.http.post<{ filePath: string }>(`${this.apiUrl}/upload`, formData);
  }

  // Usuarios
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`);
  }

getUsuarioActual() {
  const usuario = localStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
}

  getUsuarioById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/${id}`);
  }

  createUsuario(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, data);
  }

  updateUsuario(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, data);
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`);
  }
}
