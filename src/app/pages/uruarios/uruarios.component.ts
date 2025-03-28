import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-uruarios',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon],
  templateUrl: './uruarios.component.html',
  styleUrls: ['./uruarios.component.scss']
})
export class UruariosComponent implements OnInit {
  usuario: any;
  empleados: any[] = [];
  mostrarContrasena = false;
  mostrarFormulario = false;
  nuevoEmpleado = { 
    usuario: '', 
    nombre: '', 
    apellido: '', 
    dni: '',
    direccion: '', 
    telefono: '', 
    contrasena: '' 
  };
  empleadoSeleccionado: any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.obtenerUsuario();
    this.obtenerUsuarios();
    this.obtenerEmpleados();
  }
  obtenerUsuario(): void {
    const usuario = this.apiService.getUsuarioActual();
    console.log('Usuario en el componente:', usuario);
  
    if (!usuario) {
      console.error('No se encontró un usuario autenticado');
      return;
    }
  
    this.usuario = usuario;
  }
  
  cambiarContrasena(): void {
    console.log('Función para cambiar la contraseña');
  }

  obtenerUsuarios(): void {
    this.apiService.getUsuarios().subscribe(
      (data) => (this.empleados = data), // No filtrar solo empleados
      (error) => console.error('Error al obtener usuarios', error)
    );
  }

  obtenerEmpleados(): void {
    this.apiService.getUsuarios().subscribe(
      (data) => {
        this.empleados = data.filter((user: any) => user.rol === 'Empleado'); // Filtra aquí
      },
      (error) => console.error('Error al obtener usuarios', error)
    );
  }

  toggleContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  abrirFormulario(): void {
    this.mostrarFormulario = true;
    this.empleadoSeleccionado = null;
    this.nuevoEmpleado = { usuario: '', nombre: '', apellido: '', dni: '', direccion: '', telefono: '', contrasena: '' };
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.nuevoEmpleado = { usuario: '', nombre: '', apellido: '', dni: '', direccion: '', telefono: '', contrasena: '' };
    this.empleadoSeleccionado = null;
  }

  guardarEmpleado(): void {
    const id = this.empleadoSeleccionado?.id || this.empleadoSeleccionado?.id_usuario;
  
    if (id) {
      console.log("Editando usuario con ID:", id);
      this.apiService.updateUsuario(id, this.nuevoEmpleado).subscribe(
        () => {
          this.obtenerUsuarios();
  
          if (this.usuario?.id_usuario === id) {
            // Actualizar usuario autenticado
            this.usuario = { ...this.usuario, ...this.nuevoEmpleado };
            localStorage.setItem('usuario', JSON.stringify(this.usuario)); // Si lo guardas en localStorage
          }
  
          this.cerrarFormulario();
        },
        (error) => console.error("Error al actualizar usuario", error)
      );
    } else {
      console.log("Creando usuario:", this.nuevoEmpleado);
      this.apiService.createUsuario(this.nuevoEmpleado).subscribe(
        () => {
          this.obtenerUsuarios();
          this.cerrarFormulario();
        },
        (error) => console.error("Error al añadir usuario", error)
      );
    }
  }  

  editarUsuario(usuario: any): void {
    this.empleadoSeleccionado = { ...usuario }; // Guardar referencia del usuario que se edita
    this.nuevoEmpleado = { ...usuario }; // Llenar el formulario con los datos del usuario
    this.mostrarFormulario = true;
  }
  

  eliminarUsuario(id: number): void {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.apiService.deleteUsuario(id).subscribe(
        () => this.obtenerUsuarios(),
        (error) => console.error('Error al eliminar usuario', error)
      );
    }
  }
}
