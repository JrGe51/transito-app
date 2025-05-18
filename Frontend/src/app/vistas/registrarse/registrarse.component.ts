import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../interfaces/user';
import { UserService } from '../../servicios/user.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-registrarse',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registrarse.component.html',
  styleUrl: './registrarse.component.css'
})
export class RegistrarseComponent implements OnInit {

  name: string = '';
  rut: string = '';
  lastname: string = '';
  email: string = '';
  password: string = '';
  telefono: string = '';
  fechanacimiento: string = '';
  direccion: string = '';
  repetirpassword: string = '';

  constructor(
    private toast: ToastrService,
    private userService: UserService,
    private router: Router
  ) { }
  ngOnInit(): void {}

  addUser() {
    if(this.name == '' || this.lastname == '' || this.fechanacimiento == '' || this.rut == '' || this.telefono == '' || this.direccion == '' || this.email == '' || this.password == '' || this.repetirpassword == ''){
      this.toast.error('Error', 'Todos los campos son obligatorios')
      return
    }
    
    if(this.password != this.repetirpassword){
      this.toast.warning('Las contraseñas no coinciden', 'warning')
      
      return
    }


    const user: User = {
      name: this.name,
      rut: this.rut,
      lastname: this.lastname,
      email: this.email,
      password: this.password,
      telefono: this.telefono,
      fechanacimiento: this.fechanacimiento,
      direccion: this.direccion
    }

    console.log(user);

    this.userService.signIn(user).subscribe(data => {
      this.toast.success(`Cuenta de ${this.name} ${this.lastname} se creo con exito`)
      this.router.navigate(['/login']);
    }, (event: HttpErrorResponse) =>{
      if(event.error.msg){
        console.log(event.error.msg);
        this.toast.error(event.error.msg, 'Error')
      }else{
        this.toast.error('Error', 'Error al crear la cuenta')
      }

    })
  } 
}
