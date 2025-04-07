import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarcasService {
  private apiUrl = 'http://localhost:3000/api/marcas'; // Cambia esto por la URL de tu API

  constructor(private http: HttpClient) {}

  // Método para obtener todas las marcas
  getMarcas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
