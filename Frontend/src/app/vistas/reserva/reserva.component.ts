import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { HorarioService } from '../../servicios/horario.service';
import { RutService } from '../../servicios/rut.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpClientModule } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservaComponent implements OnInit {
  fechasDisponibles: string[] = [];
  horasDisponibles: string[] = [];
  fechaSeleccionada: Date | null = null;
  horaSeleccionada: string | null = null;
  tiposLicencia: string[] = ['Clase B', 'Clase C']; 
  tipoLicenciaSeleccionado: string | null = null;
  licenciaSeleccionada: boolean = false;
  rut: string = '';
  email: string = '';
  userName: string = '';

  constructor(
    private horarioService: HorarioService,
    private rutService: RutService,
    private dialog: MatDialog,
    private toast: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    // No cargamos fechas aquí, esperamos a que se seleccione un tipo de licencia
  }

  onFechaChange(date: Date | null) {
    if (!date) {
      this.fechaSeleccionada = null;
      this.horaSeleccionada = null;
      this.horasDisponibles = [];
      console.log('Fecha deseleccionada');
      return;
    }
    this.fechaSeleccionada = date;
    this.horaSeleccionada = null;
    const fechaString = this.formatDate(date);
    console.log('Fecha seleccionada:', fechaString);

    // Asegurarse de que hay un tipo de licencia seleccionado antes de obtener horas
    if (this.tipoLicenciaSeleccionado) {
      this.horarioService.getHorasPorFecha(fechaString, this.tipoLicenciaSeleccionado).subscribe({
        next: (horas) => {
          console.log('Horas disponibles:', horas);
          this.horasDisponibles = horas;
        },
        error: (error) => {
          console.error('Error al obtener horas:', error);
          this.horasDisponibles = [];
          this.toast.error('Error al cargar horas disponibles', 'Error');
        }
      });
    } else {
      console.log('Tipo de licencia no seleccionado, no se obtienen horas.');
      this.horasDisponibles = [];
    }
  }

  formatDate(date: Date): string {
    // Convierte Date a 'YYYY-MM-DD'
    return date.toISOString().split('T')[0];
  }

  dateClass = (d: Date) => {
    const dateString = this.formatDate(d);
    // Aquí no filtramos por licencia, solo marcamos las fechas que existen en general
    return this.fechasDisponibles.includes(dateString) ? 'fecha-disponible' : '';
  };

  filtrarFechasDisponibles = (date: Date | null): boolean => {
    if (!date) return false;
    const dateString = this.formatDate(date);
    // Aquí sí usamos las fechas disponibles cargadas para el tipo de licencia seleccionado
    return this.fechasDisponibles.includes(dateString);
  }

  seleccionarTipoLicencia(tipo: string) {
    this.tipoLicenciaSeleccionado = tipo;
    this.licenciaSeleccionada = true;
    this.fechaSeleccionada = null;
    this.horaSeleccionada = null;
    this.horasDisponibles = [];
    this.fechasDisponibles = []; // Limpiar fechas anteriores
    console.log('Tipo de licencia seleccionado:', tipo);

    // Cargar fechas disponibles para el tipo de licencia seleccionado
    this.horarioService.getFechasDisponibles(tipo).subscribe({
      next: (fechas) => {
        console.log('Fechas disponibles para', tipo, ':', fechas);
        this.fechasDisponibles = fechas;
      },
      error: (error) => {
        console.error('Error al obtener fechas por licencia:', error);
        this.fechasDisponibles = [];
        this.toast.error('Error al cargar fechas disponibles', 'Error');
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
        <div class="mb-3">
          <label class="form-label">RUT (sin puntos, con guión)</label>
          <input type="text" id="rut" class="swal2-input" placeholder="12345678-9">
        </div>
        <div class="mb-3">
          <label class="form-label">Correo electrónico</label>
          <input type="email" id="email" class="swal2-input" placeholder="ejemplo@correo.com">
        </div>
        <div class="mb-3">
          <label class="form-label">Fecha de nacimiento</label>
          <input type="date" id="fechaNacimiento" class="swal2-input">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Reservar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      focusConfirm: false,
      preConfirm: () => {
        const rut = (document.getElementById('rut') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const fechaNacimiento = (document.getElementById('fechaNacimiento') as HTMLInputElement).value;
        
        if (!rut) {
          Swal.showValidationMessage('Por favor ingresa tu RUT');
          return false;
        }
        if (!email) {
          Swal.showValidationMessage('Por favor ingresa tu correo electrónico');
          return false;
        }
        if (!fechaNacimiento) {
          Swal.showValidationMessage('Por favor ingresa tu fecha de nacimiento');
          return false;
        }

        // Validar RUT
        const verificacionRut = this.rutService.esMayorDeEdad(rut);
        if (!verificacionRut.esValido) {
          Swal.showValidationMessage(verificacionRut.mensaje);
          return false;
        }

        // Validar edad
        const fechaNac = new Date(fechaNacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mesActual = hoy.getMonth();
        const mesNacimiento = fechaNac.getMonth();

        if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNac.getDate())) {
          edad--;
        }

        if (edad < 18) {
          Swal.showValidationMessage(`No cumples con la edad mínima requerida. Tu edad es ${edad} años.`);
          return false;
        }
        
        return { rut, email };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.rut = result.value.rut;
        this.email = result.value.email;
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
    if (!this.rut) {
      this.toast.error('Por favor, ingresa tu RUT', 'Error');
      return;
    }
    if (!this.email) {
      this.toast.error('Por favor, ingresa tu correo electrónico', 'Error');
      return;
    }

    // Verificar RUT
    const verificacion = this.rutService.esMayorDeEdad(this.rut);
    if (!verificacion.esValido) {
      this.toast.error(verificacion.mensaje, 'Error de verificación');
      return;
    }

    const solicitud = {
      name: this.tipoLicenciaSeleccionado,
      fecha: this.formatDate(this.fechaSeleccionada),
      hora: this.horaSeleccionada
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

    const minDuration = 3000; // 3 segundos

    this.horarioService.registrarSolicitud(solicitud).subscribe({
      next: () => {
        const endTime = new Date().getTime();
        const elapsedTime = endTime - startTime;
        const remainingTime = minDuration - elapsedTime;

        if (remainingTime > 0) {
          setTimeout(() => {
            Swal.close(); // Cerrar SweetAlert de carga
            Swal.fire({
              icon: 'success',
              title: '¡Reserva realizada con éxito!',
              text: `Estimado/a usuario, su reserva para el día ${this.formatDate(this.fechaSeleccionada!)} a las ${this.horaSeleccionada} ha sido registrada correctamente.`,
              confirmButtonColor: '#3085d6'
            }).then(() => {
              this.router.navigate(['/nuevo']); // Redireccionar al hacer clic en OK
            });
            // Limpiar el formulario después de una reserva exitosa
            this.tipoLicenciaSeleccionado = null;
            this.licenciaSeleccionada = false;
            this.fechaSeleccionada = null;
            this.horaSeleccionada = null;
            this.horasDisponibles = [];
            this.rut = '';
            this.email = '';
          }, remainingTime);
        } else {
          Swal.close(); // Cerrar SweetAlert de carga inmediatamente
          Swal.fire({
            icon: 'success',
            title: '¡Reserva realizada con éxito!',
            text: `Estimado/a usuario, su reserva para el día ${this.formatDate(this.fechaSeleccionada!)} a las ${this.horaSeleccionada} ha sido registrada correctamente.`,
            confirmButtonColor: '#3085d6'
          }).then(() => {
            this.router.navigate(['/nuevo']); // Redireccionar al hacer clic en OK
          });
          // Limpiar el formulario después de una reserva exitosa
          this.tipoLicenciaSeleccionado = null;
          this.licenciaSeleccionada = false;
          this.fechaSeleccionada = null;
          this.horaSeleccionada = null;
          this.horasDisponibles = [];
          this.rut = '';
          this.email = '';
        }
      },
      error: (err) => {
        const endTime = new Date().getTime();
        const elapsedTime = endTime - startTime;
        const remainingTime = minDuration - elapsedTime;

        if (remainingTime > 0) {
          setTimeout(() => {
            Swal.close(); // Cerrar SweetAlert de carga
            console.error('Error al reservar:', err);
            this.toast.error(err.error?.msg || 'Error al realizar la reserva', 'Error');
          }, remainingTime);
        } else {
          Swal.close(); // Cerrar SweetAlert de carga inmediatamente
          console.error('Error al reservar:', err);
          this.toast.error(err.error?.msg || 'Error al realizar la reserva', 'Error');
        }
      }
    });
  }
}