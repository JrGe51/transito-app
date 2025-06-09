import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorarioService } from '../../servicios/horario.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

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
  shouldShowTable: boolean = false;
  
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
    private cdr: ChangeDetectorRef,
    private toast: ToastrService
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
      this.shouldShowTable = false;
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
    // Primero ocultamos la tabla
    this.shouldShowTable = false;
    this.cdr.markForCheck();

    this.horarioService.getAllHorarios().subscribe({
      next: (data: any) => {
        // Esperamos un momento antes de mostrar la tabla
        setTimeout(() => {
          this.horarios = data.map((item: any) => ({
            id: item.id,
            fecha: item.fecha,
            hora: item.hora,
            tipoLicenciaMostrado: item.licenciaName || 'N/A',
            cupodisponible: item.cupodisponible
          }));
          
          // Forzamos la recreación de la tabla
          this.shouldShowTable = true;
          this.cdr.markForCheck();
        }, 100);
      },
      error: (err: any) => {
        console.error('Error al cargar horarios:', err);
        this.shouldShowTable = true;
        this.cdr.markForCheck();
      }
    });
  }

  crearHorario() {
    if (!this.nuevoHorario.fecha || !this.nuevoHorario.hora || !this.nuevoHorario.name) {
      this.toast.error('Por favor complete todos los campos', 'Error');
      return;
    }

    this.horarioService.registerHorario(this.nuevoHorario).subscribe({
      next: (response) => {
        Swal.fire('¡Éxito!', 'Horario creado exitosamente', 'success');
        this.loadHorarios();
        this.toggleCreateForm();
        this.resetNuevoHorario();
      },
      error: (error) => {
        console.error('Error al crear horario:', error);
        Swal.fire('Error', 'Error al crear el horario', 'error');
      }
    });
  }

  eliminarHorario(id: number) {
    Swal.fire({
      title: '¿Está seguro de que desea eliminar este horario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.horarioService.eliminarHorario(id).subscribe({
          next: (response) => {
            Swal.fire('¡Eliminado!', 'Horario eliminado exitosamente', 'success');
            this.loadHorarios();
          },
          error: (error) => {
            console.error('Error al eliminar horario:', error);
            Swal.fire('Error', 'Error al eliminar el horario', 'error');
          }
        });
      }
    });
  }
} 