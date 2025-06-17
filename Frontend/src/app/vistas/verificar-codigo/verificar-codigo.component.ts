import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../servicios/user.service';

@Component({
  selector: 'app-verificar-codigo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verificar-codigo.component.html',
  styleUrl: './verificar-codigo.component.css'
})
export class VerificarCodigoComponent implements OnInit {
  codigo: string = '';
  email: string = '';

  constructor(
    private userService: UserService,
    private toast: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      if (!this.email) {
        this.toast.error('Email no proporcionado', 'Error');
        this.router.navigate(['/recuperar-password']);
      }
    });
  }

  verificarCodigo() {
    if (!this.codigo) {
      this.toast.error('Por favor ingrese el código de verificación', 'Error');
      return;
    }

    this.userService.verificarCodigo(this.email, this.codigo).subscribe({
      next: (response) => {
        this.toast.success('Código verificado correctamente', 'Éxito');
        this.router.navigate(['/nueva-password'], { queryParams: { email: this.email, codigo: this.codigo } });
      },
      error: (error) => {
        this.toast.error('Código inválido o expirado', 'Error');
        console.error('Error:', error);
      }
    });
  }
}
