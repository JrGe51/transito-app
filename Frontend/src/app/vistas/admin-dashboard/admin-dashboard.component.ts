import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorarioService } from '../../servicios/horario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  showHorariosManagement: boolean = false;
  horarios: any[] = [];

  constructor(
    private horarioService: HorarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    }
  }

  toggleHorariosManagement() {
    this.showHorariosManagement = !this.showHorariosManagement;
    if (this.showHorariosManagement) {
      this.loadHorarios();
    } else {
      this.horarios = []; // Limpiar horarios si se oculta la sección
    }
  }

  loadHorarios() {
    this.horarioService.getAllHorarios().subscribe({
      next: (data: any) => {
        // Asumiendo que el backend devuelve un arreglo de objetos con fecha, hora, name de licencia y cupodisponible
        this.horarios = data.map((item: any) => ({
          fecha: item.fecha,
          hora: item.hora,
          licenciaName: item.licencia ? item.licencia.name : 'N/A', // Asegúrate de manejar el caso donde licencia es nulo
          cupodisponible: item.cupodisponible
        }));
      },
      error: (err: any) => {
        console.error('Error al cargar horarios:', err);
        // Aquí podrías añadir un toastr o SweetAlert para mostrar el error al usuario
      }
    });
  }
} 