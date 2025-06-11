import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorarioService } from '../../servicios/horario.service';
import { LicenciaService } from '../../servicios/licencia.service';
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
  showLicenciasManagement: boolean = false;
  showCreateForm: boolean = false;
  showCreateLicenciaForm: boolean = false;
  horarios: any[] = [];
  licencias: any[] = [];
  tiposLicencia: string[] = [];
  minDate: string;
  shouldShowTable: boolean = false;
  shouldShowLicenciasTable: boolean = false;
  

  nuevoHorario = {
    fecha: '',
    hora: '',
    name: '',
    cupodisponible: true
  };


  nuevaLicencia = {
    name: '',
    description: ''
  };

  constructor(
    private horarioService: HorarioService,
    private licenciaService: LicenciaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastrService
  ) {
    this.minDate = this.getTodayDate();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    }
    this.loadLicencias();
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
      this.showLicenciasManagement = false;
      this.showCreateLicenciaForm = false;
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

    this.shouldShowTable = false;
    this.cdr.markForCheck();

    this.horarioService.getAllHorarios().subscribe({
      next: (data: any) => {

        setTimeout(() => {
          this.horarios = data.map((item: any) => ({
            id: item.id,
            fecha: item.fecha,
            hora: item.hora,
            tipoLicenciaMostrado: item.licenciaName || 'N/A',
            cupodisponible: item.cupodisponible
          }));
          

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
    // Limpiar espacios en el nombre de la licencia
    this.nuevoHorario.name = this.nuevoHorario.name.trim();
    console.log('Enviando horario:', this.nuevoHorario);
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

  // LICENCIAS
  toggleLicenciasManagement() {
    this.showLicenciasManagement = !this.showLicenciasManagement;
    if (this.showLicenciasManagement) {
      this.loadLicencias();
      this.showHorariosManagement = false;
      this.showCreateForm = false;
    } else {
      this.licencias = [];
      this.showCreateLicenciaForm = false;
      this.shouldShowLicenciasTable = false;
      this.cdr.markForCheck();
    }
  }

  toggleCreateLicenciaForm() {
    this.showCreateLicenciaForm = !this.showCreateLicenciaForm;
    if (!this.showCreateLicenciaForm) {
      this.resetNuevaLicencia();
      this.cdr.markForCheck();
    }
  }

  resetNuevaLicencia() {
    this.nuevaLicencia = {
      name: '',
      description: ''
    };
  }

  loadLicencias() {
    this.shouldShowLicenciasTable = false;
    this.cdr.markForCheck();
    this.licenciaService.getAllLicencias().subscribe({
      next: (data: any) => {
        setTimeout(() => {
          this.licencias = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description
          }));
          this.tiposLicencia = data.map((item: any) => item.name);
          this.shouldShowLicenciasTable = true;
          this.cdr.markForCheck();
        }, 100);
      },
      error: (err: any) => {
        console.error('Error al cargar licencias:', err);
        this.shouldShowLicenciasTable = true;
        this.cdr.markForCheck();
      }
    });
  }

  crearLicencia() {
    if (!this.nuevaLicencia.name || !this.nuevaLicencia.description) {
      this.toast.error('Por favor complete todos los campos', 'Error');
      return;
    }
    this.licenciaService.registerLicencia(this.nuevaLicencia).subscribe({
      next: (response) => {
        Swal.fire('¡Éxito!', 'Licencia creada exitosamente', 'success');
        this.loadLicencias();
        this.toggleCreateLicenciaForm();
        this.resetNuevaLicencia();
      },
      error: (error) => {
        console.error('Error al crear licencia:', error);
        Swal.fire('Error', error.error?.msg || 'Error al crear la licencia', 'error');
      }
    });
  }

  eliminarLicencia(id: number) {
    Swal.fire({
      title: '¿Está seguro de que desea eliminar esta licencia?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.licenciaService.eliminarLicencia(id).subscribe({
          next: (response) => {
            Swal.fire('¡Eliminado!', 'Licencia eliminada exitosamente', 'success');
            this.loadLicencias();
          },
          error: (error) => {
            console.error('Error al eliminar licencia:', error);
            Swal.fire('Error', 'Error al eliminar la licencia', 'error');
          }
        });
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.toast.info('Sesión cerrada', 'Hasta pronto!');
    this.router.navigate(['/login']);
  }
} 