import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AdminService } from '../../servicios/admin.service';
import { Admin } from '../../interfaces/admin';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

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
  showPassword: boolean = false;
  showRepeatPassword: boolean = false;

  // New properties to track validation errors for display in HTML
  passwordHasUppercase: boolean = true;
  passwordHasNumber: boolean = true;

  constructor(
    private adminService: AdminService,
    private toast: ToastrService,
    private router: Router
  ) {}

  validarMayuscula(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  validarNumero(password: string): boolean {
    return /\d/.test(password);
  }

  validarPassword() {
    if (this.password) {
      this.passwordHasUppercase = this.validarMayuscula(this.password);
      this.passwordHasNumber = this.validarNumero(this.password);
    } else {
      this.passwordHasUppercase = true;
      this.passwordHasNumber = true;
    }
  }

  registrarAdmin() {
    // Reset validation flags at the beginning of the submission attempt
    this.passwordHasUppercase = true;
    this.passwordHasNumber = true;

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

    if (!this.validarMayuscula(this.password)) {
      this.passwordHasUppercase = false; // Set flag for HTML display
      this.toast.error('Error', 'La contraseña debe contener al menos una letra mayúscula');
      return;
    }

    if (!this.validarNumero(this.password)) {
      this.passwordHasNumber = false; // Set flag for HTML display
      this.toast.error('Error', 'La contraseña debe contener al menos un número');
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
        const email = response.email;
        const emailParts = email.split('@');
        const username = emailParts[0];
        const domain = emailParts[1];

        Swal.fire({
          title: '¡Registro exitoso!',
          html: `
            <div style="text-align: left;">
              <p><strong>Tu correo electrónico es:</strong></p>
              <p style="color: #56baed; font-size: 1.2em; margin: 10px 0;">${email}</p>
              
              <p><strong>Instrucciones para recordar tu correo:</strong></p>
              <ul style="text-align: left; margin: 10px 0;">
                <li>Primeros 3 caracteres de tu nombre: <strong>${username.substring(0, 3)}</strong></li>
                <li>Ultimos 3 caracteres de tu apellido: <strong>${username.substring(3, 6)}</strong></li>
                <li>Dominio: <strong>${domain}</strong></li>
              </ul>
              
              <p style="color: #dc3545; font-size: 0.9em;">
                <i class="bi bi-exclamation-triangle"></i> 
                Por favor, guarda esta información en un lugar seguro.
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Ir al login',
          confirmButtonColor: '#56baed',
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/login']);
          }
        });
      },
      error: (error) => {
        this.toast.error('Error', 'No se pudo registrar el administrador');
      }
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShowRepeatPassword() {
    this.showRepeatPassword = !this.showRepeatPassword;
  }
} 