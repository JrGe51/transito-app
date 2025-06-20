import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../interfaces/user';
import { UserService } from '../../servicios/user.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RutService } from '../../servicios/rut.service';

@Component({
  selector: 'app-registrarse',
  standalone: true,
  imports: [FormsModule, CommonModule],
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
  showPassword: boolean = false;
  showRepeatPassword: boolean = false;

  private rutPattern = /^\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1}$/;
  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private telefonoPattern = /^\+?[0-9]{9,12}$/;

  constructor(
    private toast: ToastrService,
    private userService: UserService,
    private router: Router,
    private rutService: RutService
  ) { }
  ngOnInit(): void {}

  validarRut(rut: string): boolean {
    return this.rutService.validarRut(rut);
  }

  validarEmail(email: string): boolean {
    return this.emailPattern.test(email);
  }

  validarTelefono(telefono: string): boolean {
    return this.telefonoPattern.test(telefono);
  }

  validarLongitudMinima(texto: string, longitud: number): boolean {
    return texto.length >= longitud;
  }

  soloNumeros(texto: string): boolean {
    return /^\d+$/.test(texto);
  }

  validarMayuscula(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  validarNumero(password: string): boolean {
    return /\d/.test(password);
  }

  validarEdad(fechaNacimiento: string): boolean {
    if (!fechaNacimiento) return false;

    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad >= 16;
  }

  formatearRut() {
    let cleanedRut = this.rut.replace(/[^0-9kK]/g, '');
    let formattedRut = '';

    if (cleanedRut.length > 0) {
      if (cleanedRut.length > 1) {
        formattedRut = cleanedRut.substring(0, cleanedRut.length - 1) + '-' + cleanedRut.charAt(cleanedRut.length - 1);
      } else {
        formattedRut = cleanedRut;
      }

      if (formattedRut.length > 5) {
        formattedRut = formattedRut.substring(0, formattedRut.length - 5) + '.' + formattedRut.substring(formattedRut.length - 5);
      }

      if (formattedRut.length > 9) {
        formattedRut = formattedRut.substring(0, formattedRut.length - 9) + '.' + formattedRut.substring(formattedRut.length - 9);
      }

      if (formattedRut.includes('-') && formattedRut.indexOf('-') !== formattedRut.length - 2) {
          const parts = formattedRut.split('-');
          if (parts.length === 2) {
              formattedRut = parts[0] + '-' + parts[1];
          } else if (parts.length > 2) {
              formattedRut = parts.join('').replace(/[^0-9kK]/g, '');
               if (formattedRut.length > 1) {
                formattedRut = formattedRut.substring(0, formattedRut.length - 1) + '-' + formattedRut.charAt(formattedRut.length - 1);
              } else {
                formattedRut = formattedRut;
              }
          }
      }
    }

    this.rut = formattedRut;
  }

  getTelefonoError(): string {
    if (!this.soloNumeros(this.telefono)) {
      return '❌ El teléfono solo debe contener números';
    }
    if (this.telefono.length < 9) {
      return '❌ El teléfono debe tener al menos 9 dígitos';
    }
    if (this.telefono.length > 12) {
      return '❌ El teléfono no debe tener más de 12 dígitos';
    }
    return '';
  }

  getRutError(): string {
    if (!this.rut.includes('-')) {
      return '❌ Falta el guión (-) en el RUT';
    }
    if (!this.rut.includes('.')) {
      return '❌ Falta el formato con puntos (.) en el RUT';
    }
    if (!this.rutService.validarFormatoRut(this.rut)) {
      return '❌ El formato del RUT no es válido. Debe ser como: 12.345.678-9';
    }
    if (!this.rutService.validarRut(this.rut)) {
      const rutLimpio = this.rut.split('-')[0];
      const dvCalculado = this.rutService.calcularDigitoVerificador(rutLimpio);
      return `❌ El dígito verificador es incorrecto. Debería ser: ${dvCalculado}`;
    }
    return '';
  }

  getEmailError(): string {
    if (!this.email.includes('@')) {
      return '❌ Falta el símbolo @ en el email';
    }
    if (!this.email.includes('.')) {
      return '❌ Falta del dominio de el email (ejemplo: gmail.com)';
    }
    if (!this.validarEmail(this.email)) {
      return '❌ El formato del email no es válido';
    }
    return '';
  }

  addUser() {
    if(this.name == '' || this.lastname == '' || this.fechanacimiento == '' || this.rut == '' || 
       this.telefono == '' || this.direccion == '' || this.email == '' || this.password == '' || 
       this.repetirpassword == ''){
      this.toast.error('Error', 'Todos los campos son obligatorios')
      return
    }
    
    if(this.password != this.repetirpassword){
      this.toast.warning('Las contraseñas no coinciden', 'warning')
      return
    }

    if (!this.validarRut(this.rut)) {
      const validacion = this.rutService.esMayorDeEdad(this.rut);
      this.toast.error('Error', validacion.mensaje)
      return
    }

    if (!this.validarEdad(this.fechanacimiento)) {
      this.toast.error('Error', 'Debes tener al menos 16 años para registrarte.')
      return
    }

    if (!this.validarEmail(this.email)) {
      this.toast.error('Error', 'El formato del email no es válido')
      return
    }

    if (!this.validarTelefono(this.telefono)) {
      this.toast.error('Error', 'El formato del teléfono no es válido')
      return
    }

    if (!this.validarLongitudMinima(this.name, 3)) {
      this.toast.error('Error', 'El nombre debe tener al menos 3 caracteres')
      return
    }

    if (!this.validarLongitudMinima(this.lastname, 3)) {
      this.toast.error('Error', 'El apellido debe tener al menos 3 caracteres')
      return
    }

    if (!this.validarLongitudMinima(this.direccion, 5)) {
      this.toast.error('Error', 'La dirección debe tener al menos 5 caracteres')
      return
    }

    if (!this.validarLongitudMinima(this.password, 6)) {
      this.toast.error('Error', 'La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (!this.validarMayuscula(this.password)) {
      this.toast.error('Error', 'La contraseña debe contener al menos una letra mayúscula')
      return
    }

    if (!this.validarNumero(this.password)) {
      this.toast.error('Error', 'La contraseña debe contener al menos un número')
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

    this.userService.signIn(user).subscribe({
      next: (data) => {
        Swal.fire({
          title: '¡Registro exitoso!',
          text: `Cuenta de ${this.name} ${this.lastname} creada con éxito`,
          icon: 'success',
          confirmButtonText: 'Ir al login',
          confirmButtonColor: '#56baed'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/login']);
          }
        });
      },
      error: (event: HttpErrorResponse) => {
        if(event.error.msg){
          console.log(event.error.msg);
          this.toast.error(event.error.msg, 'Error')
        }else{
          this.toast.error('Error', 'Error al crear la cuenta')
        }
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
