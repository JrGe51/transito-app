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
import { Location } from '@angular/common';

@Component({
  selector: 'app-reserva3',
  templateUrl: './reserva3.component.html',
  styleUrls: ['./reserva3.component.css'],
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
export class Reserva3Component implements OnInit {
  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;

  fechasDisponibles$ = new BehaviorSubject<string[]>([]);
  horasDisponibles: string[] = [];
  fechaSeleccionada: Date | null = null;
  horaSeleccionada: string | null = null;
  tiposLicencia: string[] = ['Clase B', 'Clase C', 'Clase D','Clase F' ,'Clase A1', 'Clase A2', 'Clase A3', 'Clase A4', 'Clase A5']; 
  tipoLicenciaSeleccionado: string | null = null;
  licenciaSeleccionada: boolean = false;
  rut: string = '';
  email: string = '';
  userName: string = '';
  minDate: Date = new Date();
  showCalendar: boolean = true;
  documentos: any[] = [];
  tipoTramite: string = '';
  licenciaActualSeleccionada: any = null;
  nuevaClaseSeleccionada: string | null = null;
  licenciasUsuario: any[] = [];

  constructor(
    private horarioService: HorarioService,
    private toast: ToastrService,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.tipoTramite = params['tipoTramite'] || '';
    });
    // Cargar licencias del usuario
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.licenciasUsuario = Array.isArray(user.licenciaVigente) ? user.licenciaVigente : (user.licenciaVigente ? [user.licenciaVigente] : []);
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

  formatDateForDisplay(date: Date): string {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();
    return `${dia} de ${mes} de ${año}`;
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
      case 'Clase A1':
        edadMinima = 20;
        mensajeError = 'Debes ser mayor de 20 años para obtener una licencia Clase A1';
        break;
      case 'Clase A2':
        edadMinima = 20;
        mensajeError = 'Debes ser mayor de 20 años para obtener una licencia Clase A2';
        break;
      case 'Clase A3':
        edadMinima = 20;
        mensajeError = 'Debes ser mayor de 20 años para obtener una licencia Clase A3';
        break;
      case 'Clase A4':
        edadMinima = 20;
        mensajeError = 'Debes ser mayor de 20 años para obtener una licencia Clase A4';
        break;
      case 'Clase A5':
        edadMinima = 20;
        mensajeError = 'Debes ser mayor de 20 años para obtener una licencia Clase A5';
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
      case 'Clase F':
        edadMinima = 18;
        mensajeError = 'Debes ser mayor de 18 años para obtener una licencia Clase F';
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

    // Verificar si la licencia existe en la base de datos
    this.horarioService.getLicencias().subscribe({
      next: (licencias: any[]) => {
        const licenciaExiste = licencias.some(
          lic => lic.name.toLowerCase() === tipo.toLowerCase()
        );
        if (!licenciaExiste) {
          return;
        }
        // Si la licencia existe, continuar con el proceso
        this.tipoLicenciaSeleccionado = tipo;
        this.licenciaSeleccionada = true;
        this.fechaSeleccionada = null;
        this.horaSeleccionada = null;
        this.horasDisponibles = [];
        this.fechasDisponibles$.next([]);
        this.cdr.detectChanges();

        // OCULTAR CALENDARIO
        this.showCalendar = false;
        this.cdr.detectChanges(); 

        this.horarioService.getFechasDisponibles(tipo).subscribe({
          next: (fechas: string[]) => {
            this.fechasDisponibles$.next(fechas);
            this.cdr.detectChanges();
            // Mostrar el calendario inmediatamente
            this.showCalendar = true;
            this.cdr.detectChanges();
            if (fechas.length > 0) {
              // Asignar automáticamente la primera fecha disponible
              const primerFecha = fechas[0];
              this.fechaSeleccionada = new Date(primerFecha);
              // Actualizar funciones de clase y filtro
              this.dateClass = (d: Date) => {
                const dateString = this.formatDate(d);
                return this.fechasDisponibles$.value.includes(dateString) ? 'fecha-disponible' : '';
              };
              this.filtrarFechasDisponibles = (date: Date | null): boolean => {
                if (!date) return false;
                const dateString = this.formatDate(date);
                return this.fechasDisponibles$.value.includes(dateString);
              };
              // Forzar la fecha activa del calendario si existe
              setTimeout(() => {
                if (this.calendar) {
                  this.calendar.activeDate = new Date(primerFecha);
                  this.calendar.updateTodaysDate();
                  this.cdr.detectChanges();
                }
              }, 0);
            } else {
              Swal.fire({
                icon: 'info',
                title: 'Sin cupos disponibles',
                text: `No hay fechas disponibles para reservar la licencia ${this.nuevaClaseSeleccionada}. Por favor, intenta más tarde.`,
                confirmButtonColor: '#3085d6'
              });
              this.nuevaClaseSeleccionada = null;
              this.tipoLicenciaSeleccionado = null;
            }
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
      },
      error: (error) => {
        console.error('Error al verificar licencia:', error);
        this.toast.error('Error al verificar la licencia', 'Error');
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
          <label for="documentos">Documentos requeridos:</label>
            <mat-card class="mb-4">
              <mat-card-content style="text-align: left;">
                <ul class="document-list">
                  <p>&nbsp;</p>
                  <li>Cédula de identidad</li>
                  <li>Licencia de Conducir actual</li>
                  <li>Certificado de antecedentes</li>
                  <li>Fotocopias: De la cédula de identidad y la licencia de conducir actual</li>
                  <p>&nbsp;</p>
                  <p>Si vienes de otra comuna:
                  Certificado de Residencia
                  </p>                                                                                       
                </ul>
              </mat-card-content>
            </mat-card>
          <input type="file" 
                 id="documentos" 
                 class="swal2-input" 
                 multiple 
                 accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">
          <small class="text-muted">Formatos permitidos: PDF, Word, imágenes. Máximo 6 archivos.</small>
          <p class="text-info mt-2">Nota: La carga de documentos es opcional. Puedes entregarlos de forma presencial el día de tu cita.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Reservar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      focusConfirm: false,
      preConfirm: () => {
        const documentos = (document.getElementById('documentos') as HTMLInputElement).files;

        if (documentos && documentos.length > 6) {
          Swal.showValidationMessage('Máximo 6 archivos permitidos');
          return false;
        }

        // Convertir archivos a base64 si existen
        if (documentos && documentos.length > 0) {
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
                documentos: documentosBase64
              };
            });
        }

        return { documentos: [] };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentos = result.value.documentos;
        this.onSubmit();
      }
    });
  }

  // Función para validar que el usuario tenga licencia vigente
  validarLicenciaVigente(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.licenciaVigente || !Array.isArray(user.licenciaVigente) || user.licenciaVigente.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No puedes realizar este trámite',
        text: 'Para realizar un cambio de clase, debes tener una licencia vigente. Actualmente no tienes licencia activa.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return false;
    }
    
    return true;
  }

  onSubmit() {
    // Validar que el usuario tenga licencia vigente para cambio de clase
    if (!this.validarLicenciaVigente()) {
      return;
    }

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
      name: this.tipoLicenciaSeleccionado,
      tipoTramite: this.tipoTramite,
      documentos: this.documentos || [],
      claseAnterior: this.licenciaActualSeleccionada?.tipo,
      claseNueva: this.nuevaClaseSeleccionada
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
              text: `Estimado/a usuario, su reserva para el día ${this.formatDateForDisplay(this.fechaSeleccionada!)} a las ${this.horaSeleccionada} ha sido registrada correctamente.
                      Se le ha enviado un correo electrónico con los detalles de la reserva.`,
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
            text: `Estimado/a usuario, su reserva para el día ${this.formatDateForDisplay(this.fechaSeleccionada!)} a las ${this.horaSeleccionada} ha sido registrada correctamente.
                    Se le ha enviado un correo electrónico con los detalles de la reserva.`,
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
            // Verificar si es un error de tipo warning (reserva existente)
            if (err.error?.type === 'warning') {
              Swal.fire({
                icon: 'warning',
                title: 'Reserva existente',
                text: err.error.msg,
                confirmButtonColor: '#3085d6'
              });
            } else {
              this.toast.error(err.error?.msg || 'Error al realizar la reserva', 'Error');
            }
          }, remainingTime);
        } else {
          Swal.close();
          console.error('Error al reservar:', err);
          // Verificar si es un error de tipo warning (reserva existente)
          if (err.error?.type === 'warning') {
            Swal.fire({
              icon: 'warning',
              title: 'Reserva existente',
              text: err.error.msg,
              confirmButtonColor: '#3085d6'
            });
          } else {
            this.toast.error(err.error?.msg || 'Error al realizar la reserva', 'Error');
          }
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
    this.documentos = [];
  }

  goBack(): void {
    this.location.back();
  }

  tieneLicencia(tipo: string): boolean {
    const userString = localStorage.getItem('user');
    if (!userString) return false;
    const user = JSON.parse(userString);
    if (!user.licenciaVigente) return false;
    if (Array.isArray(user.licenciaVigente)) {
      return user.licenciaVigente.some((l: any) => l && l.tipo === tipo);
    }
    if (typeof user.licenciaVigente === 'string') {
      return user.licenciaVigente === tipo;
    }
    return false;
  }

  getNombreLicencia(licencia: any): string {
    return licencia && typeof licencia === 'object' && 'tipo' in licencia ? licencia.tipo : licencia;
  }

  seleccionarLicenciaActual(licencia: any) {
    this.licenciaActualSeleccionada = licencia;
  }

  seleccionarNuevaClase(tipo: string) {
    this.nuevaClaseSeleccionada = tipo;
    this.tipoLicenciaSeleccionado = tipo;
    this.cargarFechasDisponibles();
  }

  volverSeleccionLicencia() {
    this.licenciaActualSeleccionada = null;
    this.nuevaClaseSeleccionada = null;
    this.tipoLicenciaSeleccionado = null;
  }

  cargarFechasDisponibles() {
    if (!this.nuevaClaseSeleccionada) return;
    // Verificar si la licencia existe en la base de datos
    this.horarioService.getLicencias().subscribe({
      next: (licencias: any[]) => {
        const licenciaExiste = licencias.some(
          lic => lic.name.toLowerCase() === this.nuevaClaseSeleccionada!.toLowerCase()
        );
        if (!licenciaExiste) {
          Swal.fire({
            icon: 'error',
            title: 'Licencia no disponible',
            text: 'De momento no se está impartiendo este tipo de licencia',
            confirmButtonColor: '#3085d6'
          });
          this.nuevaClaseSeleccionada = null;
          this.tipoLicenciaSeleccionado = null;
          return;
        }
        // Si la licencia existe, continuar con la carga de fechas
        this.horarioService.getFechasDisponibles(this.nuevaClaseSeleccionada!).subscribe({
          next: (fechas: string[]) => {
            this.fechasDisponibles$.next(fechas);
            this.cdr.detectChanges();
            // Mostrar el calendario inmediatamente
            this.showCalendar = true;
            this.cdr.detectChanges();
            if (fechas.length > 0) {
              // Asignar automáticamente la primera fecha disponible
              const primerFecha = fechas[0];
              this.fechaSeleccionada = new Date(primerFecha);
              // Actualizar funciones de clase y filtro
              this.dateClass = (d: Date) => {
                const dateString = this.formatDate(d);
                return this.fechasDisponibles$.value.includes(dateString) ? 'fecha-disponible' : '';
              };
              this.filtrarFechasDisponibles = (date: Date | null): boolean => {
                if (!date) return false;
                const dateString = this.formatDate(date);
                return this.fechasDisponibles$.value.includes(dateString);
              };
              // Forzar la fecha activa del calendario si existe
              setTimeout(() => {
                if (this.calendar) {
                  this.calendar.activeDate = new Date(primerFecha);
                  this.calendar.updateTodaysDate();
                  this.cdr.detectChanges();
                }
              }, 0);
            } else {
              Swal.fire({
                icon: 'info',
                title: 'Sin cupos disponibles',
                text: `No hay fechas disponibles para reservar la licencia ${this.nuevaClaseSeleccionada}. Por favor, intenta más tarde.`,
                confirmButtonColor: '#3085d6'
              });
              this.nuevaClaseSeleccionada = null;
              this.tipoLicenciaSeleccionado = null;
            }
          },
          error: (error) => {
            console.error('Error al cargar fechas disponibles:', error);
            this.toast.error('Error al cargar fechas disponibles', 'Error');
            this.fechasDisponibles$.next([]);
            this.showCalendar = true;
            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        console.error('Error al verificar licencia:', error);
        this.toast.error('Error al verificar la licencia', 'Error');
      }
    });
  }

  puedeElegirNuevaClase(tipo: string): boolean {
    return !this.licenciasUsuario.some(l => this.getNombreLicencia(l) === tipo);
  }
}