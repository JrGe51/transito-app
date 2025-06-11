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
  selector: 'app-reserva',
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.css'],
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
export class ReservaComponent implements OnInit {
  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;

  fechasDisponibles$ = new BehaviorSubject<string[]>([]);
  horasDisponibles: string[] = [];
  fechaSeleccionada: Date | null = null;
  horaSeleccionada: string | null = null;
  tiposLicencia: string[] = ['Clase B', 'Clase C', 'Clase D']; 
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
    });
    // No cargamos fechas aquí, esperamos a que se seleccione un tipo de licencia
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

    if (this.tipoLicenciaSeleccionado) {
      this.horarioService.getHorasPorFecha(fechaString, this.tipoLicenciaSeleccionado).subscribe({
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

  // Función para calcular la edad
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

  // Función para validar edad según tipo de licencia
  validarEdadParaLicencia(tipoLicencia: string): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.fechanacimiento) {
      this.toast.error('No se encontró la fecha de nacimiento del usuario', 'Error');
      return false;
    }

    const edad = this.calcularEdad(user.fechanacimiento);
    let edadMinima = 18; // Edad mínima por defecto
    let mensajeError = '';

    // Definir edad mínima y mensaje según tipo de licencia
    switch (tipoLicencia) {
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
        return true; // Para otros tipos de licencia que no requieran validación de edad
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
    // Validar edad para cualquier tipo de licencia
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

    // OCULTAR CALENDARIO
    this.showCalendar = false;
    this.cdr.detectChanges(); // Forzar la detección de cambios para que se oculte

    this.horarioService.getFechasDisponibles(tipo).subscribe({
      next: (fechas) => {
        this.fechasDisponibles$.next(fechas);
        this.cdr.detectChanges();

        // MOSTRAR CALENDARIO después de un pequeño retraso para asegurar que se recree
        setTimeout(() => {
          this.showCalendar = true;
          this.cdr.detectChanges();

          if (this.calendar) {
            // Reasignar las funciones dateClass y filtrarFechasDisponibles para forzar reevaluación
            this.dateClass = (d: Date) => {
              const dateString = this.formatDate(d);
              return this.fechasDisponibles$.value.includes(dateString) ? 'fecha-disponible' : '';
            };
            this.filtrarFechasDisponibles = (date: Date | null): boolean => {
              if (!date) return false;
              const dateString = this.formatDate(date);
              return this.fechasDisponibles$.value.includes(dateString);
            };

            // Intentar establecer la fecha activa para forzar la reevaluación
            if (fechas.length > 0) {
              this.calendar.activeDate = new Date(fechas[0]);
            } else {
              this.calendar.activeDate = new Date(); // Si no hay fechas, mostrar el mes actual
            }
            this.calendar.updateTodaysDate(); // Fuerza la reevaluación de los filtros
            this.cdr.detectChanges();
          }
        }, 0);
      },
      error: (error) => {
        console.error('Error al obtener fechas por licencia:', error);
        this.fechasDisponibles$.next([]);
        this.toast.error('Error al cargar fechas disponibles', 'Error');
        this.cdr.detectChanges();

        // Asegurarse de que el calendario se muestre incluso en caso de error
        setTimeout(() => {
          this.showCalendar = true;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  mostrarFormularioReserva() {
    if (!this.tipoLicenciaSeleccionado) {
      this.toast.error('Por favor, selecciona un tipo de licencia', 'Error');
      return;
    }
    if (!this.fechaSeleccionada) {
      this.toast.error('Por favor, selecciona una fecha', 'Error');
      return;
    }
    if (!this.horaSeleccionada) {
      this.toast.error('Por favor, selecciona una hora', 'Error');
      return;
    }

    Swal.fire({
      title: 'Confirmar Reserva',
      html: `
        <div class="form-group">
          <label for="email">Correo electrónico:</label>
          <input type="email" id="email" class="swal2-input" placeholder="ejemplo@correo.com">
        </div>
        <div class="form-group">
          <label for="documentos">Documentos requeridos:</label>
          <input type="file" 
                 id="documentos" 
                 class="swal2-input" 
                 multiple 
                 accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">
          <small class="text-muted">Formatos permitidos: PDF, Word, imágenes. Máximo 3 archivos.</small>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Reservar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      focusConfirm: false,
      preConfirm: () => {
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const documentos = (document.getElementById('documentos') as HTMLInputElement).files;
        
        if (!email) {
          Swal.showValidationMessage('Por favor ingresa tu correo electrónico');
          return false;
        }

        if (!documentos || documentos.length === 0) {
          Swal.showValidationMessage('Por favor adjunte al menos un documento');
          return false;
        }

        if (documentos.length > 3) {
          Swal.showValidationMessage('Máximo 3 archivos permitidos');
          return false;
        }

        // Convertir archivos a base64
        const promesas = Array.from(documentos).map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
              nombre: file.name,
              tipo: file.type,
              contenido: reader.result,
              fecha: new Date().toISOString()
            });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });

        return Promise.all(promesas)
          .then(documentosBase64 => {
            return {
              email,
              documentos: documentosBase64
            };
          });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.email = result.value.email;
        this.documentos = result.value.documentos;
        this.onSubmit();
      }
    });
  }

  onSubmit() {
    if (!this.tipoLicenciaSeleccionado) {
      this.toast.error('Por favor, selecciona un tipo de licencia', 'Error');
      return;
    }
    if (!this.fechaSeleccionada) {
      this.toast.error('Por favor, selecciona una fecha', 'Error');
      return;
    }
    if (!this.horaSeleccionada) {
      this.toast.error('Por favor, selecciona una hora', 'Error');
      return;
    }

    if (!this.email) {
      this.toast.error('Por favor, ingresa tu correo electrónico', 'Error');
      return;
    }

    const solicitud = {
      name: this.tipoLicenciaSeleccionado,
      fecha: this.formatDate(this.fechaSeleccionada),
      hora: this.horaSeleccionada,
      tipoTramite: this.tipoTramite,
      documentos: this.documentos || []
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

    const minDuration = 3000;

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
              this.router.navigate(['/nuevo']);
            });
            this.limpiarFormulario();
          }, remainingTime);
        } else {
          Swal.close();
          Swal.fire({
            icon: 'success',
            title: '¡Reserva realizada con éxito!',
            text: `Estimado/a usuario, su reserva para el día ${this.formatDate(this.fechaSeleccionada!)} a las ${this.horaSeleccionada} ha sido registrada correctamente.`,
            confirmButtonColor: '#3085d6'
          }).then(() => {
            this.router.navigate(['/nuevo']);
          });
          this.limpiarFormulario();
        }
      },
      error: (err) => {
        const endTime = new Date().getTime();
        const elapsedTime = endTime - startTime;
        const remainingTime = minDuration - elapsedTime;

        if (remainingTime > 0) {
          setTimeout(() => {
            Swal.close();
            console.error('Error al reservar:', err);
            this.toast.error(err.error?.msg || 'Error al realizar la reserva', 'Error');
          }, remainingTime);
        } else {
          Swal.close();
          console.error('Error al reservar:', err);
          this.toast.error(err.error?.msg || 'Error al realizar la reserva', 'Error');
        }
      }
    });
  }

  private limpiarFormulario() {
    this.tipoLicenciaSeleccionado = null;
    this.licenciaSeleccionada = false;
    this.fechaSeleccionada = null;
    this.horaSeleccionada = null;
    this.horasDisponibles = [];
    this.rut = '';
    this.email = '';
    this.documentos = [];
  }
}