import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../servicios/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nueva-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-password.component.html',
  styleUrl: './nueva-password.component.css'
})
export class NuevaPasswordComponent implements OnInit {
  password: string = '';
  confirmPassword: string = '';
  email: string = '';
  codigo: string = '';

  constructor(
    private userService: UserService,
    private toast: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      this.codigo = params['codigo'];
      if (!this.email || !this.codigo) {
        this.toast.error('Información incompleta', 'Error');
        this.router.navigate(['/recuperar-password']);
      }
    });
  }

  cambiarPassword() {
    if (!this.password || !this.confirmPassword) {
      this.toast.error('Por favor complete todos los campos', 'Error');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toast.error('Las contraseñas no coinciden', 'Error');
      return;
    }

    this.userService.cambiarPassword(this.email, this.codigo, this.password).subscribe({
      next: (response) => {
        this.toast.success('Contraseña actualizada correctamente', 'Éxito');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.toast.error('Error al cambiar la contraseña', 'Error');
        console.error('Error:', error);
      }
    });
  }

  validarMayuscula(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  validarNumero(password: string): boolean {
    return /\d/.test(password);
  }
}
