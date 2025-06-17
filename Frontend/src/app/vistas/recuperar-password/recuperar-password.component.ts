import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../servicios/user.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recuperar-password.component.html',
  styleUrl: './recuperar-password.component.css'
})
export class RecuperarPasswordComponent {
  email: string = '';

  constructor(
    private userService: UserService,
    private toast: ToastrService,
    private router: Router
  ) {}

  recuperarPassword() {
    if (!this.email) {
      this.toast.error('Por favor ingrese su correo electrónico', 'Error');
      return;
    }

    this.userService.recuperarPassword(this.email).subscribe({
      next: (response) => {
        this.toast.success('Se ha enviado un código de recuperación a su correo electrónico', 'Éxito');
        this.router.navigate(['/verificar-codigo'], { queryParams: { email: this.email } });
      },
      error: (error) => {
        this.toast.error('Error al enviar el código de recuperación', 'Error');
        console.error('Error:', error);
      }
    });
  }
}
