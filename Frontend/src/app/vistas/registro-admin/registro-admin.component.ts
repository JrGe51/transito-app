import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AdminService } from '../../servicios/admin.service';
import { Admin } from '../../interfaces/admin';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro-admin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registro-admin.component.html',
  styleUrl: './registro-admin.component.css'
})
export class RegistroAdminComponent {
  name: string = '';
  lastname: string = '';
  password: string = '';
  repetirPassword: string = '';

  constructor(
    private adminService: AdminService,
    private toast: ToastrService,
    private router: Router
  ) {}

  registrarAdmin() {
    if (this.name === '' || this.lastname === '' || this.password === '' || this.repetirPassword === '') {
      this.toast.error('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (this.password !== this.repetirPassword) {
      this.toast.error('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (this.password.length < 6) {
      this.toast.error('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const admin: Admin = {
      name: this.name,
      lastname: this.lastname,
      password: this.password,
      email: '' 
    };

    this.adminService.registerAdmin(admin).subscribe({
      next: (response) => {
        this.toast.success('Administrador registrado exitosamente', `Email generado: ${response.email}`);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.toast.error('Error', 'No se pudo registrar el administrador');
      }
    });
  }
} 