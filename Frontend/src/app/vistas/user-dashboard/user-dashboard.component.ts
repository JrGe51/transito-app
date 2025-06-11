import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  userData: User | undefined;
  showProfileInfo: boolean = false;

  constructor(private router: Router, private toast: ToastrService) { }

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      this.userData = JSON.parse(userString);
    }
  }

  navigateTo(route: string): void {
    console.log('Navegando a:', route);
    this.router.navigate([route]);
  }

  irAReservaPrimeraLicencia(): void {
    this.router.navigate(['/reserva'], { queryParams: { tipoTramite: 'Primera Licencia' } });
  }

  irAReservaRenovacion(): void {
    this.router.navigate(['/reserva2'], { queryParams: { tipoTramite: 'Renovación' } });
  }

  irAReservaCambioClase(): void {
    this.router.navigate(['/reserva3'], { queryParams: { tipoTramite: 'Cambio de Clase' } });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.toast.info('Sesión cerrada', 'Hasta pronto!');
    this.router.navigate(['/login']);
  }

  toggleProfileInfo(): void {
    this.showProfileInfo = !this.showProfileInfo;
  }
} 