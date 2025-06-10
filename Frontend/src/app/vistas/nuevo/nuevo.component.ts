import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nuevo',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './nuevo.component.html',
  styleUrl: './nuevo.component.css'
})
export class NuevoComponent {

  constructor(private router: Router, private toast: ToastrService) { }

  checkAccessAndRedirect(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.toast.warning('Debe iniciar sesión para continuar con el proceso', 'Acceso restringido', {
        positionClass: 'toast-top-center',
        timeOut: 1500 
      });
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500); 
    }
  }
}
