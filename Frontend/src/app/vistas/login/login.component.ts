import { Component } from '@angular/core';
import { UserService } from '../../servicios/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user';
import { HttpErrorResponse } from '@angular/common/http';
import { ErroresService } from '../../servicios/errores.service';
import { MasterAccessService } from '../../servicios/master-access.service';
import Swal from 'sweetalert2';

// Variable de sesión para el acceso maestro (debe ser la misma que en auth.guard.ts)
declare let masterAccessSession: boolean;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email: string = ''
  password: string = ''
  showPassword: boolean = false;

  constructor(
    private userService: UserService,
    private toast: ToastrService,
    private router: Router,
    private errorService: ErroresService,
    private masterAccessService: MasterAccessService
  ) {}

  login(){
    if(this.email == '' || this.password == ''){
      this.toast.error('Error', 'Todos los campos son obligatorios')
      return
    }

    if(this.email === 'admin@loespejo.com' && this.password === 'Admin@2024#Secure') {
      this.toast.success('Credenciales maestras válidas', 'Redirigiendo al registro de administrador')
      this.masterAccessService.grantMasterAccess();
      this.router.navigate(['/registro-admin'])
      return
    }

    const user: User = {
      email: this.email,
      password: this.password,
    }

    this.userService.logIn(user).subscribe({
      next: (response) => {
        console.log('Respuesta del login:', response)
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        if (response.isAdmin) {
          this.toast.success(`Bienvenido administrador ${this.email}, Login exitoso`)
          this.router.navigate(['/admin-dashboard'])
        } else {
          this.toast.success(`Bienvenido ${this.email}, Login exitoso`)
          this.router.navigate(['/user-dashboard'])
        }
      },
      error: (e: HttpErrorResponse) => {
        if (e.error && e.error.msg) {
          let titulo = 'Error de autenticación';
          let texto = '';
          if (e.error.msg.includes('Email incorrecto')) {
            texto = 'El email ingresado no está registrado.';
          } else if (e.error.msg.includes('Contraseña incorrecta')) {
            texto = 'La contraseña ingresada es incorrecta.';
          } else {
            texto = 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
          }
          Swal.fire({
            icon: 'error',
            title: titulo,
            text: texto,
            confirmButtonColor: '#56baed'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error inesperado. Intenta nuevamente.',
            confirmButtonColor: '#56baed'
          });
        }
      }
    })
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}