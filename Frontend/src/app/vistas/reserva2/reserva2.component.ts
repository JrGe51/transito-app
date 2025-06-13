import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HorarioService } from '../../servicios/horario.service';
import { RutService } from '../../servicios/rut.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule, MatCalendar } from '@angular/material/datepicker';
import { HttpClientModule } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-reserva2',
  templateUrl: './reserva2.component.html',
  styleUrls: ['./reserva2.component.css'],
  providers: [provideNativeDateAdapter()],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    HttpClientModule,
    MatDialogModule,
    MatButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Reserva2Component implements OnInit {
  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;

  fechasDisponibles$ = new BehaviorSubject<string[]>([]);
  horasDisponibles: string[] = [];
  fechaSeleccionada: Date | null = null;
  horaSeleccionada: string | null = null;
  tiposLicencia: string[] = ['Clase A','Clase B', 'Clase C', 'Clase D']; 
  tipoLicenciaSeleccionado: string | null = null;
  licenciaSeleccionada: boolean = false;
  rut: string = '';
  email: string = '';
  userName: string = '';
  minDate: Date = new Date();
  showCalendar: boolean = true;
  documentos: any[] = [];
  tipoTramite: string = '';

  constructor(
    private horarioService: HorarioService,
    private rutService: RutService,
    private dialog: MatDialog,
    private toast: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.tipoTramite = params['tipoTramite'] || '';
      if (this.tipoTramite !== 'Renovación') {
        this.tipoLicenciaSeleccionado = this.tipoTramite;
      }
    });
  }

  cargarFechasDisponibles() {
    this.horarioService.getFechasDisponibles(this.tipoTramite).subscribe({
      next: (fechas) => {
        this.fechasDisponibles$.next(fechas);
        this.cdr.detectChanges();

        setTimeout(() => {
          this.showCalendar = true;
          this.cdr.detectChanges();

          if (this.calendar) {
            this.dateClass = (d: Date) => {
              const dateString = this.formatDate(d);
              return this.fechasDisponibles$.value.includes(dateString) ? 'fecha-disponible' : '';
            };
            this.filtrarFechasDisponibles = (date: Date | null): boolean => {
              if (!date) return false;
              const dateString = this.formatDate(date);
              return this.fechasDisponibles$.value.includes(dateString);
            };

            if (fechas.length > 0) {
              this.calendar.activeDate = new Date(fechas[0]);
            } else {
              this.calendar.activeDate = new Date();
            }
            this.calendar.updateTodaysDate();
            this.cdr.detectChanges();
          }
        }, 0);
      },
      error: (error) => {
        console.error('Error al obtener fechas disponibles:', error);
        this.fechasDisponibles$.next([]);
        this.toast.error('Error al cargar fechas disponibles', 'Error');
        this.cdr.detectChanges();

        setTimeout(() => {
          this.showCalendar = true;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  onFechaChange(date: Date | null) {
    if (!date) {
      this.fechaSeleccionada = null;
      this.horaSeleccionada = null;
      this.horasDisponibles = [];
      this.cdr.detectChanges();
      return;
    }
    this.fechaSeleccionada = date;
    this.horaSeleccionada = null;
    const fechaString = this.formatDate(date);

    let tipoParaHoras = this.tipoLicenciaSeleccionado || this.tipoTramite;

    if (tipoParaHoras) {
      this.horarioService.getHorasPorFecha(fechaString, tipoParaHoras).subscribe({
        next: (horas) => {
          this.horasDisponibles = horas;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al obtener horas:', error);
          this.horasDisponibles = [];
          this.toast.error('Error al cargar horas disponibles', 'Error');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.horasDisponibles = [];
      this.cdr.detectChanges();
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  dateClass = (d: Date) => {
    const dateString = this.formatDate(d);
    return this.fechasDisponibles$.value.includes(dateString) ? 'fecha-disponible' : '';
  };

  filtrarFechasDisponibles = (date: Date | null): boolean => {
    if (!date) return false;
    const dateString = this.formatDate(date);
    return this.fechasDisponibles$.value.includes(dateString);
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    return edad;
  }

  validarEdadParaLicencia(tipoLicencia: string): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.fechanacimiento) {
      this.toast.error('No se encontró la fecha de nacimiento del usuario', 'Error');
      return false;
    }

    const edad = this.calcularEdad(user.fechanacimiento);
    let edadMinima = 18; 
    let mensajeError = '';

    switch (tipoLicencia) {
      case 'Clase A':
        edadMinima = 20;
        mensajeError = 'Debes ser mayor de 20 años para obtener una licencia Clase A';
        break;
      case 'Clase B':
        edadMinima = 18;
        mensajeError = 'Debes ser mayor de 18 años para obtener una licencia Clase B';
        break;
      case 'Clase C':
        edadMinima = 18;
        mensajeError = 'Debes ser mayor de 18 años para obtener una licencia Clase C';
        break;
      case 'Clase D':
        edadMinima = 18;
        mensajeError = 'Debes ser mayor de 18 años para obtener una licencia Clase D';
        break;
      default:
        return true; 
    }

    if (edad < edadMinima) {
      Swal.fire({
        title: 'Edad insuficiente',
        text: mensajeError,
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return false;
    }
    return true;
  }

  seleccionarTipoLicencia(tipo: string) {
    if (!this.validarEdadParaLicencia(tipo)) {
      return;
    }

    this.tipoLicenciaSeleccionado = tipo;
    this.licenciaSeleccionada = true;
    this.fechaSeleccionada = null;
    this.horaSeleccionada = null;
    this.horasDisponibles = [];
    this.fechasDisponibles$.next([]);
    this.cdr.detectChanges();

    this.showCalendar = false;
    this.cdr.detectChanges(); 

    this.horarioService.getFechasDisponibles(tipo).subscribe({
      next: (fechas) => {
        this.fechasDisponibles$.next(fechas);
        this.cdr.detectChanges();

        setTimeout(() => {
          this.showCalendar = true;
          this.cdr.detectChanges();

          if (this.calendar) {
            this.dateClass = (d: Date) => {
              const dateString = this.formatDate(d);
              return this.fechasDisponibles$.value.includes(dateString) ? 'fecha-disponible' : '';
            };
            this.filtrarFechasDisponibles = (date: Date | null): boolean => {
              if (!date) return false;
              const dateString = this.formatDate(date);
              return this.fechasDisponibles$.value.includes(dateString);
            };

            if (fechas.length > 0) {
              this.calendar.activeDate = new Date(fechas[0]);
            } else {
              this.calendar.activeDate = new Date(); 
            }
            this.calendar.updateTodaysDate(); 
            this.cdr.detectChanges();
          }
        }, 0);
      },
      error: (error) => {
        console.error('Error al obtener fechas por licencia:', error);
        this.fechasDisponibles$.next([]);
        this.toast.error('Error al cargar fechas disponibles', 'Error');
        this.cdr.detectChanges();

        setTimeout(() => {
          this.showCalendar = true;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  onSubmit() {
    if (!this.fechaSeleccionada || !this.horaSeleccionada) {
      this.toast.error('Por favor, selecciona una fecha y hora', 'Error');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      this.toast.error('Debes iniciar sesión para realizar una reserva', 'Error');
      this.router.navigate(['/login']);
      return;
    }

    const solicitud = {
      userId: user.id,
      fecha: this.formatDate(this.fechaSeleccionada),
      hora: this.horaSeleccionada,
      name: this.tipoLicenciaSeleccionado || this.tipoTramite,
      tipoTramite: this.tipoTramite,
      documentos: []
    };

    console.log('Enviando solicitud:', solicitud);

    // Mostrar SweetAlert de carga
    const startTime = new Date().getTime();
    Swal.fire({
      title: 'Procesando reserva...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const minDuration = 3000; // Duración mínima del spinner

    this.horarioService.registrarSolicitud(solicitud).subscribe({
      next: () => {
        const endTime = new Date().getTime();
        const elapsedTime = endTime - startTime;
        const remainingTime = minDuration - elapsedTime;

        if (remainingTime > 0) {
          setTimeout(() => {
            Swal.close();
            Swal.fire({
              icon: 'success',
              title: '¡Reserva realizada con éxito!',
              text: `Estimado/a usuario, su reserva para el día ${this.formatDate(this.fechaSeleccionada!)} a las ${this.horaSeleccionada} ha sido registrada correctamente.`,
              confirmButtonColor: '#3085d6'
            }).then(() => {
              this.router.navigate(['/user-dashboard']); // Redirigir al dashboard de usuario
            });
          }, remainingTime);
        } else {
          Swal.close();
          Swal.fire({
            icon: 'success',
            title: '¡Reserva realizada con éxito!',
            text: `Estimado/a usuario, su reserva para el día ${this.formatDate(this.fechaSeleccionada!)} a las ${this.horaSeleccionada} ha sido registrada correctamente.`,
            confirmButtonColor: '#3085d6'
          }).then(() => {
            this.router.navigate(['/user-dashboard']); // Redirigir al dashboard de usuario
          });
        }
      },
      error: (error) => {
        const endTime = new Date().getTime();
        const elapsedTime = endTime - startTime;
        const remainingTime = minDuration - elapsedTime;

        if (remainingTime > 0) {
          setTimeout(() => {
            Swal.close();
            console.error('Error al registrar la solicitud:', error);
            this.toast.error('Error al realizar la reserva', 'Error');
          }, remainingTime);
        } else {
          Swal.close();
          console.error('Error al registrar la solicitud:', error);
          this.toast.error('Error al realizar la reserva', 'Error');
        }
      }
    });
  }
}
