import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorarioService } from '../../servicios/horario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  showHorariosManagement: boolean = false;
  showCreateForm: boolean = false;
  horarios: any[] = [];
  tiposLicencia: string[] = ['Clase B', 'Clase C'];
  minDate: string;
  
  // Nuevo horario
  nuevoHorario = {
    fecha: '',
    hora: '',
    name: '',
    cupodisponible: true
  };

  constructor(
    private horarioService: HorarioService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Establecer la fecha mínima como hoy
    this.minDate = this.getTodayDate();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    }
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  toggleHorariosManagement() {
    this.showHorariosManagement = !this.showHorariosManagement;
    if (this.showHorariosManagement) {
      this.loadHorarios();
    } else {
      this.horarios = [];
      this.showCreateForm = false;
      this.cdr.markForCheck();
    }
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetNuevoHorario();
      this.cdr.markForCheck();
    }
  }

  resetNuevoHorario() {
    this.nuevoHorario = {
      fecha: '',
      hora: '',
      name: '',
      cupodisponible: true
    };
  }

  loadHorarios() {
    this.horarioService.getAllHorarios().subscribe({
      next: (data: any) => {
        this.horarios = [...data.map((item: any) => {
          console.log(item);
          return {
            fecha: item.fecha,
            hora: item.hora,
            tipoLicenciaMostrado: item['Licencium.name'] || 'N/A',
            cupodisponible: item.cupodisponible
          };
        })];
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error al cargar horarios:', err);
        this.cdr.markForCheck();
      }
    });
  }

  crearHorario() {
    if (!this.nuevoHorario.fecha || !this.nuevoHorario.hora || !this.nuevoHorario.name) {
      alert('Por favor complete todos los campos');
      return;
    }

    this.horarioService.registerHorario(this.nuevoHorario).subscribe({
      next: (response) => {
        alert('Horario creado exitosamente');
        this.loadHorarios();
        this.toggleCreateForm();
        this.resetNuevoHorario();
      },
      error: (error) => {
        console.error('Error al crear horario:', error);
        alert('Error al crear el horario');
      }
    });
  }
} 