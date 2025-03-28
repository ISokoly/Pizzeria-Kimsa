export interface Usuario {
    id_usuario: number;
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    direccion: string;
    rol: 'Administrador' | 'Empleado';
    usuario: string;
    contrasena: string;
  }