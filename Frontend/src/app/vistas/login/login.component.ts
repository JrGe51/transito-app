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
    const user: User = {
      email: this.email,
      password: this.password,

    }
    this.userService.logIn(user).subscribe({
      next: (token: any) => {
        console.log(token);
        localStorage.setItem('token', token.token);
        this.toast.success(`Bienvenido ${this.email}, Login exitoso`);
        this.router.navigate(['/nuevo']);
      },
      error: (e: HttpErrorResponse) => {
        this.errorService.messageError(e)
      }
    })
  }
}