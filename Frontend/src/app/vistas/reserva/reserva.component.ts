import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HorarioService } from '../../servicios/horario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule, MatCalendar } from '@angular/material/datepicker';
import { HttpClientModule } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Location } from '@angular/common';

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
  tiposLicencia: string[] = ['Clase B', 'Clase C', 'Clase D', 'Clase F']; 
  tipoLicenciaSeleccionado: string | null = null;
  licenciaSeleccionada: boolean = false;
  rut: string = '';
  email: string = '';
  userName: string = '';
  minDate: Date = new Date();
  showCalendar: boolean = true;
  documentos: any[] = [];
  tipoTramite: string = '';
  userData: any | null = null;

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
    this.loadUserData();
    this.cargarTiposLicencia();
  }

  loadUserData(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      this.userData = JSON.parse(userString);
      this.cdr.detectChanges();
    }
  }

  cargarTiposLicencia(): void {
    this.horarioService.getLicencias().subscribe({
      next: (licencias: any[]) => {
        // Filtrar las licencias para excluir las clases A1 a A5
        this.tiposLicencia = licencias
          .map(licencia => licencia.name)
          .filter(licencia => !['Clase A1', 'Clase A2', 'Clase A3', 'Clase A4', 'Clase A5'].includes(licencia));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar tipos de licencia:', error);
        this.toast.error('Error al cargar los tipos de licencia.', 'Error');
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
          Swal.fire({
            icon: 'error',
            title: 'Licencia no disponible',
            text: 'De momento no se está impartiendo este tipo de licencia',
            confirmButtonColor: '#3085d6'
          });
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
          next: (fechas) => {
            if (fechas && fechas.length > 0) {
              this.fechasDisponibles$.next(fechas);
              this.cdr.detectChanges();

              // MOSTRAR CALENDARIO después de un pequeño retraso
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
            } else {
              Swal.fire({
                icon: 'info',
                title: 'Sin cupos disponibles',
                text: `No hay fechas disponibles para reservar la licencia ${tipo}. Por favor, intenta más tarde.`,
                confirmButtonColor: '#3085d6'
              });
              this.tipoLicenciaSeleccionado = null;
              this.licenciaSeleccionada = false;
            }
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
                  <li>Certificado de estudios</li>
                  <li>Certificado de antecedentes</li>
                  <li>Fotocopias: De la cédula de identidad</li>
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
          <small class="text-muted">Formatos permitidos: PDF, Word, imágenes. Máximo 5 archivos.</small>
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

        if (documentos && documentos.length > 5) {
          Swal.showValidationMessage('Máximo 5 archivos permitidos');
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

  onTipoLicenciaChange() {
    if (this.tipoLicenciaSeleccionado) {
      // Verificar si la licencia existe en la base de datos
      this.horarioService.getLicencias().subscribe({
        next: (licencias: any[]) => {
          const licenciaExiste = licencias.some(
            lic => lic.name.toLowerCase() === this.tipoLicenciaSeleccionado?.toLowerCase()
          );

          if (!licenciaExiste) {
            Swal.fire({
              icon: 'error',
              title: 'Licencia no disponible',
              text: 'De momento no se está impartiendo este tipo de licencia',
              confirmButtonColor: '#3085d6'
            });
            this.tipoLicenciaSeleccionado = '';
            return;
          }

          // Si la licencia existe, continuar con la carga de fechas
          if (this.tipoLicenciaSeleccionado) {
            this.horarioService.getFechasDisponibles(this.tipoLicenciaSeleccionado).subscribe({
              next: (fechas: string[]) => {
                this.fechasDisponibles$.next(fechas);
                if (fechas.length === 0) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Sin cupos disponibles',
                    text: 'No hay cupos disponibles para esta licencia en este momento',
                    confirmButtonColor: '#3085d6'
                  });
                }
              },
              error: (error: any) => {
                console.error('Error al obtener fechas disponibles:', error);
                this.toast.error('Error al cargar fechas disponibles', 'Error');
              }
            });
          }
        },
        error: (error: any) => {
          console.error('Error al verificar licencia:', error);
          this.toast.error('Error al verificar la licencia', 'Error');
        }
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  tieneLicencia(tipo: string): boolean {
    if (!this.userData || !this.userData.licenciaVigente) return false;
    if (Array.isArray(this.userData.licenciaVigente)) {
      return this.userData.licenciaVigente.some((l: any) => l && l.tipo === tipo);
    }
    if (typeof this.userData.licenciaVigente === 'string') {
      return this.userData.licenciaVigente === tipo;
    }
    return false;
  }
}