import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
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
  usuarios: any[] = [];
  administradores: any[] = [];
  mostrarContrasena = false;
  mostrarFormulario = false;
  nuevoEmpleado = { 
    usuario: '', 
    nombre: '', 
    apellido: '', 
    dni: '',
    direccion: '', 
    telefono: '', 
    contrasena: '',
    rol: ''
  };
  userSeleccionado: any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.obtenerUsuario();
    this.obtenerUsuarios();
    this.obtenerEmpleados();
    this.obtenerAdministradores();
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

  obtenerUsuarios(): void {
    this.apiService.getUsuarios().subscribe(
      (data) => (this.usuarios = data), 
      (error) => console.error('Error al obtener usuarios', error)
    );
  }

  obtenerAdministradores(): void {
    this.apiService.getUsuarios().subscribe(
      (data) => {
        this.administradores = data.filter((user: any) => user.rol === 'Administrador');
      },
      (error) => console.error('Error al obtener usuarios', error)
    );
  }

  obtenerEmpleados(): void {
    this.apiService.getUsuarios().subscribe(
      (data) => {
        this.empleados = data.filter((user: any) => user.rol === 'Empleado');
      },
      (error) => console.error('Error al obtener usuarios', error)
    );
  }

  toggleContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  abrirFormulario(rol: string): void {
    this.mostrarFormulario = true;
    this.userSeleccionado = null;
    this.nuevoEmpleado = {
      usuario: '',
      nombre: '',
      apellido: '',
      dni: '',
      direccion: '',
      telefono: '',
      contrasena: '',
      rol: rol
    };
  }
  

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.nuevoEmpleado = { usuario: '', nombre: '', apellido: '', dni: '', direccion: '', telefono: '', contrasena: '', rol:'' };
    this.userSeleccionado = null;
  }

  guardarEmpleado(): void {
    const id = this.userSeleccionado?.id || this.userSeleccionado?.id_usuario;
  
    if (id) {
      this.apiService.updateUsuario(id, this.nuevoEmpleado).subscribe(
        () => {
          this.obtenerUsuarios();
  
          if (this.usuario?.id_usuario === id) {
            this.usuario = { ...this.usuario, ...this.nuevoEmpleado };
            localStorage.setItem('usuario', JSON.stringify(this.usuario)); // Guardar cambios en localStorage
          }
  
          this.cerrarFormulario();
  
          // Esperar un momento antes de recargar
          setTimeout(() => {
            location.reload();
          }, 200); // Pequeña espera para asegurar la escritura en localStorage
        },
        (error) => console.error("Error al actualizar usuario", error)
      );
    } else {
      this.apiService.createUsuario(this.nuevoEmpleado).subscribe(
        () => {
          this.obtenerUsuarios();
          this.cerrarFormulario();
          
          // Recargar después de guardar un nuevo usuario
          setTimeout(() => {
            location.reload();
          }, 200);
        },
        (error) => console.error("Error al añadir usuario", error)
      );
    }
  }
  

  editarUsuario(usuario: any): void {
    this.userSeleccionado = { ...usuario };
    this.nuevoEmpleado = { ...usuario };
    this.mostrarFormulario = true;
  }
  
  eliminarUsuario(id: number): void {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.apiService.deleteUsuario(id).subscribe(
        () => {
          if (this.usuario?.id_usuario === id) {
            this.apiService.logout();
            location.reload();
          } else {
            this.obtenerUsuarios();
            location.reload();
          }
        },
        (error) => console.error('Error al eliminar usuario', error)
      );
    }
  }
  
}
