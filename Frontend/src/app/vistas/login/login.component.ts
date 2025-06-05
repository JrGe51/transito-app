import { Component } from '@angular/core';
import { UserService } from '../../servicios/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../interfaces/user';
import { HttpErrorResponse } from '@angular/common/http';
import { ErroresService } from '../../servicios/errores.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email: string = ''
  password: string = ''

  constructor(
    private userService: UserService,
    private toast: ToastrService,
    private router: Router,
    private errorService: ErroresService
  ) {}

  login(){
    if(this.email == '' || this.password == ''){
      this.toast.error('Error', 'Todos los campos son obligatorios')
      return
    }

    if(this.email === 'admin@loespejo.com' && this.password === 'Admin@2024#Secure') {
      this.toast.success('Credenciales maestras válidas', 'Redirigiendo al registro de administrador')
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
        if (response.isAdmin) {
          this.toast.success(`Bienvenido administrador ${this.email}, Login exitoso`)
          this.router.navigate(['/admin-dashboard'])
        } else {
          this.toast.success(`Bienvenido ${this.email}, Login exitoso`)
          this.router.navigate(['/nuevo'])
        }
      },
      error: (e: HttpErrorResponse) => {
        this.errorService.messageError(e)
      }
    })
  }
}